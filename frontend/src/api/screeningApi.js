// Single point of contact with the backend. Keep field names EXACTLY
// matching what reliability_gate.py / lambda_function.py expect and return.
//
// Confirmed live response shapes (verified against real lambda_function.py):
//   PASS:  { status: "PASS",  result: { prediction, result, bmi, top_factors }, warnings: [] }
//   BLOCK: { status: "BLOCK", reason, missing, message }
//   EXIT:  { status: "EXIT",  message }

const DEV_PROXY_PATH = "/api/screening";

// ── Client-side Fallback Engine Parameters (identical to backend model & gates) ──
const AGE_BUCKETS = [
  [18, 24, 1],
  [25, 29, 2],
  [30, 34, 3],
  [35, 39, 4],
  [40, 44, 5],
  [45, 49, 6],
  [50, 54, 7],
  [55, 59, 8],
  [60, 64, 9],
  [65, 69, 10],
  [70, 74, 11],
  [75, 79, 12],
  [80, 120, 13],
];

const FEATURE_ORDER = [
  "Age", "Sex", "BMI", "HighBP", "HighChol", "Smoker", "PhysActivity", "GenHlth"
];

const SCALER_MEANS = {
  Age: 8.083026925737693,
  Sex: 0.4379313538040843,
  BMI: 28.676237478142927,
  HighBP: 0.4541096748538776,
  HighChol: 0.4414938527827257,
  Smoker: 0.46527652945053627,
  PhysActivity: 0.7340218652460249,
  GenHlth: 2.6002483944241988,
};

const SCALER_SCALES = {
  Age: 3.090481095145462,
  Sex: 0.4961325258027398,
  BMI: 6.767826747770711,
  HighBP: 0.49788962437269485,
  HighChol: 0.496565233114231,
  Smoker: 0.4987928233174576,
  PhysActivity: 0.44185265257410344,
  GenHlth: 1.0650663300435455,
};

const COEF_MAP = {
  GenHlth: 0.6079606119508782,
  Age: 0.5099973006851145,
  BMI: 0.48364856474689377,
  HighBP: 0.3734130068325638,
  HighChol: 0.28942080407834386,
  Sex: 0.1307139984649878,
  Smoker: -0.014662335422844954,
  PhysActivity: -0.012689655068071896,
};

const INTERCEPT = -0.5262460761284706;

function buildPayload(formValues) {
  return {
    age: Number(formValues.age),
    sex: formValues.sex,                       // "male" | "female"
    height_cm: Number(formValues.height_cm),
    weight_kg: Number(formValues.weight_kg),
    high_bp: Boolean(formValues.high_bp),       // boolean
    high_chol: Boolean(formValues.high_chol),   // boolean
    smoker: Boolean(formValues.smoker),         // boolean
    phys_activity: Boolean(formValues.phys_activity), // boolean
    gen_health: Number(formValues.gen_health), // 1-5
    already_diagnosed: Boolean(formValues.already_diagnosed), // boolean
  };
}

export function localFallbackPredict(payload, lang = "en") {
  const isHi = lang === "hi";

  if (payload.already_diagnosed) {
    return {
      status: "EXIT",
      reason: "already_diagnosed",
      message: isHi
        ? "यह टूल उन लोगों के लिए है जिन्हें मधुमेह का निदान नहीं हुआ है। कृपया अपने मौजूदा डॉक्टर के साथ देखभाल जारी रखें।"
        : "This tool is designed for people who have not been diagnosed with diabetes. Please continue care with your healthcare provider.",
    };
  }

  const age = Number(payload.age);
  const heightCm = Number(payload.height_cm);
  const weightKg = Number(payload.weight_kg);
  const genHealth = Number(payload.gen_health);
  const sex = String(payload.sex || "").toLowerCase();

  if (!age || age < 18 || age > 120) {
    return {
      status: "BLOCK",
      reason: "implausible_age",
      message: isHi ? "कृपया 18 से 120 के बीच सही उम्र दर्ज करें।" : "Please enter a valid age between 18 and 120.",
    };
  }

  if (!heightCm || heightCm < 100 || heightCm > 250) {
    return {
      status: "BLOCK",
      reason: "implausible_height",
      message: isHi ? "कृपया 100 से 250 सेमी के बीच सही लंबाई दर्ज करें।" : "Please enter a valid height between 100 and 250 cm.",
    };
  }

  if (!weightKg || weightKg < 20 || weightKg > 300) {
    return {
      status: "BLOCK",
      reason: "implausible_weight",
      message: isHi ? "कृपया 20 से 300 किग्रा के बीच सही वज़न दर्ज करें।" : "Please enter a valid weight between 20 and 300 kg.",
    };
  }

  if (![1, 2, 3, 4, 5].includes(genHealth)) {
    return {
      status: "BLOCK",
      reason: "invalid_gen_health",
      message: isHi ? "कृपया एक मान्य सामान्य स्वास्थ्य रेटिंग चुनें।" : "Please select a valid general health rating.",
    };
  }

  const bmi = Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;

  let ageBucket = 1;
  for (const [low, high, bucket] of AGE_BUCKETS) {
    if (age >= low && age <= high) {
      ageBucket = bucket;
      break;
    }
  }

  const features = {
    Age: ageBucket,
    Sex: sex === "male" ? 1 : 0,
    BMI: bmi,
    HighBP: payload.high_bp ? 1 : 0,
    HighChol: payload.high_chol ? 1 : 0,
    Smoker: payload.smoker ? 1 : 0,
    PhysActivity: payload.phys_activity ? 1 : 0,
    GenHlth: genHealth,
  };

  const scaled = {};
  for (const f of FEATURE_ORDER) {
    scaled[f] = (features[f] - SCALER_MEANS[f]) / SCALER_SCALES[f];
  }

  let z = INTERCEPT;
  const contribs = [];
  for (const f of FEATURE_ORDER) {
    const contrib = COEF_MAP[f] * scaled[f];
    z += contrib;
    contribs.push({
      mag: Math.abs(contrib),
      feature: f,
      direction: contrib > 0 ? "increased" : "decreased",
    });
  }

  contribs.sort((a, b) => b.mag - a.mag);
  const topFactors = contribs.slice(0, 3).map((c) => ({
    feature: c.feature,
    direction: c.direction,
  }));

  const prediction = z >= 0 ? 1 : 0;

  const warnings = [];
  if (bmi < 12 || bmi > 80) {
    warnings.push(
      isHi
        ? `आपका गणना किया गया BMI (${bmi}) असामान्य लग रहा है। कृपया लंबाई और वज़न दोबारा जांचें।`
        : `Your calculated BMI (${bmi}) is unusual. Please double-check your height and weight.`
    );
  }

  return {
    status: "PASS",
    result: {
      prediction,
      result: prediction === 1 ? "Elevated screening risk" : "Lower screening risk",
      bmi,
      top_factors: topFactors,
    },
    warnings,
  };
}

export async function submitScreening(formValues, lang = "en") {
  const payload = buildPayload(formValues);

  if (import.meta.env.DEV) {
    try {
      const response = await fetch(DEV_PROXY_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: JSON.stringify(payload) }),
      });

      if (!response.ok) {
        console.warn(`[SugarGuard DEV] Backend target unreached (${response.status} ${response.statusText}). Utilizing client-side screening engine.`);
        return localFallbackPredict(payload, lang);
      }

      const rieWrapper = await response.json();
      if (rieWrapper && rieWrapper.body) {
        return typeof rieWrapper.body === "string" ? JSON.parse(rieWrapper.body) : rieWrapper.body;
      }
      return localFallbackPredict(payload, lang);
    } catch (err) {
      console.warn("[SugarGuard DEV] Connection error to backend port 9000. Utilizing client-side fallback engine:", err.message);
      return localFallbackPredict(payload, lang);
    }
  }

  // --- Production: real API Gateway + Lambda proxy integration ---
  const apiUrl = import.meta.env.VITE_SCREENING_API_URL;
  if (!apiUrl) {
    console.warn("[SugarGuard] VITE_SCREENING_API_URL not defined. Using client-side fallback engine.");
    return localFallbackPredict(payload, lang);
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok && response.status === 502) {
      console.warn("[SugarGuard] API gateway 502 Bad Gateway. Using client-side fallback engine.");
      return localFallbackPredict(payload, lang);
    }

    return await response.json();
  } catch (err) {
    console.warn("[SugarGuard] Network call failed. Falling back to client-side screening engine:", err.message);
    return localFallbackPredict(payload, lang);
  }
}
