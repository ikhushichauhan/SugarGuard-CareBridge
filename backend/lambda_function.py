import os
import json
import joblib
import pandas as pd

from reliability_gate import check

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "model_8field.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler_8field.pkl"))

with open(os.path.join(BASE_DIR, "coefficients_8field.json")) as f:
    _coef_data = json.load(f)
COEF_MAP = {c["feature"]: c["coefficient"] for c in _coef_data["coefficients"]}


FEATURE_ORDER = [
    "Age",
    "Sex",
    "BMI",
    "HighBP",
    "HighChol",
    "Smoker",
    "PhysActivity",
    "GenHlth"
]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
}


def get_top_factors(scaled_values, top_n=3):
    contributions = []
    for idx, name in enumerate(FEATURE_ORDER):
        contribution = COEF_MAP[name] * scaled_values[0][idx]
        direction = "increased" if contribution > 0 else "decreased"
        contributions.append((abs(contribution), name, direction))
    contributions.sort(reverse=True)
    return [{"feature": name, "direction": direction} for _, name, direction in contributions[:top_n]]


def predict(features):

    values = pd.DataFrame(
        [[features[name] for name in FEATURE_ORDER]],
        columns=FEATURE_ORDER
    )

    scaled_values = scaler.transform(values)

    prediction = model.predict(scaled_values)[0]

    if prediction == 1:
        result = "Elevated screening risk"
    else:
        result = "Lower screening risk"

    top_factors = get_top_factors(scaled_values)

    return {
        "prediction": int(prediction),
        "result": result,
        "bmi": features["BMI"],
        "top_factors": top_factors
    }


def _get_http_method(event):
    # Covers both REST API (v1) and HTTP API (v2) event shapes, plus
    # a plain local test event that sets "httpMethod" directly.
    if not isinstance(event, dict):
        return None
    if "httpMethod" in event:
        return event["httpMethod"]
    return event.get("requestContext", {}).get("http", {}).get("method")


def lambda_handler(event, context):

    # Handle CORS preflight request
    if _get_http_method(event) == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": ""
        }

    # Local testing
    if isinstance(event, dict) and "body" in event:
        try:
            payload = json.loads(event["body"])
        except (TypeError, json.JSONDecodeError):
            payload = event
    else:
        payload = event

    lang = payload.get("lang", "en")

    gate_result = check(payload, lang)

    if gate_result["status"] == "BLOCK":
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps(gate_result)
        }

    if gate_result["status"] == "EXIT":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(gate_result)
        }

    result = predict(gate_result["features"])

    response = {
        "status": gate_result["status"],
        "result": result,
        "warnings": gate_result.get("warnings", [])
    }

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(response)
    }