const API_URL =
  import.meta.env.VITE_SCREENING_API_URL ||
  "REPLACE_WITH_API_GATEWAY_URL";

/**
 * Send screening data to the backend Lambda.
 *
 * The Docker Lambda endpoint (localhost:9000) expects a raw JSON body
 * and returns { statusCode, body } where body is a JSON string.
 *
 * API Gateway will return the body directly as parsed JSON.
 *
 * @param {Object} formData - The screening form values.
 * @param {string} lang - "en" or "hi".
 * @returns {Promise<Object>} Parsed response from the backend.
 */
export async function submitScreening(formData, lang = "en") {
  const payload = {
    age: Number(formData.age),
    sex: formData.sex,
    height_cm: Number(formData.height_cm),
    weight_kg: Number(formData.weight_kg),
    high_bp: formData.high_bp,
    high_chol: formData.high_chol,
    smoker: formData.smoker,
    phys_activity: formData.phys_activity,
    gen_health: Number(formData.gen_health),
    already_diagnosed: formData.already_diagnosed,
    lang,
  };

  const isLocalLambda = API_URL.includes("localhost") || API_URL.includes("127.0.0.1");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(isLocalLambda ? payload : { body: JSON.stringify(payload) }),
  });

  if (!response.ok) {
    /* Try to parse an error body from the backend */
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      throw new Error("SERVER_ERROR");
    }

    /* Docker Lambda wraps everything in { statusCode, body } */
    if (errorBody.body) {
      const parsed = typeof errorBody.body === "string" ? JSON.parse(errorBody.body) : errorBody.body;
      return parsed; // BLOCK responses with message
    }

    throw new Error("SERVER_ERROR");
  }

  const data = await response.json();

  /*
   * Docker Lambda format: { statusCode: 200, body: "{...}" }
   * API Gateway format:   { status: "PASS", result: {...}, warnings: [] }
   */
  if (data.body !== undefined) {
    const parsed = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
    return parsed;
  }

  return data;
}
