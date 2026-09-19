import json
import joblib
import pandas as pd

from reliability_gate import check


model = joblib.load("model_8field.pkl")
scaler = joblib.load("scaler_8field.pkl")

with open("coefficients_8field.json") as f:
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


def lambda_handler(event, context):

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
            "body": json.dumps(gate_result)
        }

    if gate_result["status"] == "EXIT":
        return {
            "statusCode": 200,
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
        "body": json.dumps(response)
    }