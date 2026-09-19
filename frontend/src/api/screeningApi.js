// Single point of contact with the backend. Keep field names EXACTLY
// matching what reliability_gate.py / lambda_function.py expect and return.
//
// Confirmed live response shapes (verified against real lambda_function.py):
//   PASS:  { status: "PASS",  result: { prediction, result, bmi, top_factors }, warnings: [] }
//   BLOCK: { status: "BLOCK", reason, missing, message }
//   EXIT:  { status: "EXIT",  message }
//
// Local dev (`npm run dev`): the browser cannot call the raw Lambda RIE URL
// directly - RIE doesn't handle real HTTP OPTIONS preflights, and doesn't
// translate the Lambda's {statusCode, headers, body} return value into a
// real HTTP response (only API Gateway does that). So in dev we POST to
// `/api/screening`, which vite.config.js proxies to the Docker RIE
// same-origin (no CORS preflight at all), using the exact event shape RIE
// expects: { body: "<json string>" }. RIE's response is then unwrapped here.
//
// Production (real deployed API Gateway + Lambda proxy integration) needs
// none of this: the real HTTP status + real headers + plain JSON body are
// already correct, so it's a plain fetch/parse against the real API URL.

const DEV_PROXY_PATH = "/api/screening";

function buildPayload(formValues) {
  return {
    age: Number(formValues.age),
    sex: formValues.sex,                       // "male" | "female"
    height_cm: Number(formValues.height_cm),
    weight_kg: Number(formValues.weight_kg),
    high_bp: formValues.high_bp,               // boolean
    high_chol: formValues.high_chol,           // boolean
    smoker: formValues.smoker,                 // boolean
    phys_activity: formValues.phys_activity,   // boolean
    gen_health: Number(formValues.gen_health), // 1-5
    already_diagnosed: formValues.already_diagnosed, // boolean
  };
}

export async function submitScreening(formValues) {
  const payload = buildPayload(formValues);

  if (import.meta.env.DEV) {
    // --- Local dev: via Vite proxy -> Docker Lambda RIE ---
    const response = await fetch(DEV_PROXY_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: JSON.stringify(payload) }),
    });

    // RIE always answers with real transport HTTP 200 locally, wrapping the
    // actual Lambda return value one level deeper as { statusCode, body }.
    const rieWrapper = await response.json();
    // rieWrapper.body is itself a JSON string - parse it to get the real
    // { status, result: { ..., top_factors }, warnings } / { status, message } object.
    return JSON.parse(rieWrapper.body);
  }

  // --- Production: real API Gateway + Lambda proxy integration ---
  const apiUrl = import.meta.env.VITE_SCREENING_API_URL;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Don't throw on !response.ok - BLOCK legitimately returns HTTP 400 here.
  // The caller branches on the parsed body's `status` field for
  // PASS / BLOCK / EXIT, exactly the same way as in dev.
  return response.json();
}
