REQUIRED_FIELDS = [
    "age",
    "sex",
    "height_cm",
    "weight_kg",
    "high_bp",
    "high_chol",
    "smoker",
    "phys_activity",
    "gen_health",
    "already_diagnosed",
]

AGE_BUCKETS = [
    (18, 24, 1),
    (25, 29, 2),
    (30, 34, 3),
    (35, 39, 4),
    (40, 44, 5),
    (45, 49, 6),
    (50, 54, 7),
    (55, 59, 8),
    (60, 64, 9),
    (65, 69, 10),
    (70, 74, 11),
    (75, 79, 12),
    (80, 120, 13),
]

MESSAGES = {
    "en": {
        "missing": "Some required information is missing. Please complete all fields.",
        "bad_age": "Please enter a valid age between 18 and 120.",
        "bad_height": "Please enter a valid height between 100 and 250 cm.",
        "bad_weight": "Please enter a valid weight between 20 and 300 kg.",
        "bad_sex": "Please select a valid sex.",
        "bad_gen_health": "Please select a valid general health rating.",
        "extreme_bmi": (
            "Your calculated BMI ({bmi}) is unusual. "
            "Please double-check your height and weight."
        ),
        "already_diagnosed": (
            "This tool is designed for people who have not been diagnosed "
            "with diabetes. Please continue care with your healthcare provider."
        ),
    },

    "hi": {
        "missing": "कुछ ज़रूरी जानकारी छूट गई है। कृपया सभी फ़ील्ड भरें।",
        "bad_age": "कृपया 18 से 120 के बीच सही उम्र दर्ज करें।",
        "bad_height": "कृपया 100 से 250 सेमी के बीच सही लंबाई दर्ज करें।",
        "bad_weight": "कृपया 20 से 300 किग्रा के बीच सही वज़न दर्ज करें।",
        "bad_sex": "कृपया सही लिंग चुनें।",
        "bad_gen_health": "कृपया एक मान्य सामान्य स्वास्थ्य रेटिंग चुनें।",
        "extreme_bmi": (
            "आपका गणना किया गया BMI ({bmi}) असामान्य लग रहा है। "
            "कृपया लंबाई और वज़न दोबारा जांचें।"
        ),
        "already_diagnosed": (
            "यह टूल उन लोगों के लिए है जिन्हें मधुमेह का निदान नहीं हुआ है। "
            "कृपया अपने मौजूदा डॉक्टर के साथ देखभाल जारी रखें।"
        ),
    },
}


def age_to_bucket(age):
    for low, high, bucket in AGE_BUCKETS:
        if low <= age <= high:
            return bucket

    return None


def check(payload, lang="en"):

    if lang not in MESSAGES:
        lang = "en"

    messages = MESSAGES[lang]

    # -----------------------------
    # 1. Required fields
    # -----------------------------
    missing = [
        field
        for field in REQUIRED_FIELDS
        if field not in payload or payload[field] in (None, "")
    ]

    if missing:
        return {
            "status": "BLOCK",
            "reason": "missing_fields",
            "missing": missing,
            "message": messages["missing"],
        }

    # -----------------------------
    # 2. Type / value validation
    # -----------------------------
    try:
        age = int(payload["age"])
        height_cm = float(payload["height_cm"])
        weight_kg = float(payload["weight_kg"])
        gen_health = int(payload["gen_health"])
    except (ValueError, TypeError):
        return {
            "status": "BLOCK",
            "reason": "invalid_numeric_value",
            "message": messages["missing"],
        }

    sex = str(payload["sex"]).lower()

    if sex not in ("male", "female"):
        return {
            "status": "BLOCK",
            "reason": "invalid_sex",
            "message": messages["bad_sex"],
        }

    # -----------------------------
    # 3. Age
    # -----------------------------
    if not 18 <= age <= 120:
        return {
            "status": "BLOCK",
            "reason": "implausible_age",
            "message": messages["bad_age"],
        }

    # -----------------------------
    # 4. Height
    # -----------------------------
    if not 100 <= height_cm <= 250:
        return {
            "status": "BLOCK",
            "reason": "implausible_height",
            "message": messages["bad_height"],
        }

    # -----------------------------
    # 5. Weight
    # -----------------------------
    if not 20 <= weight_kg <= 300:
        return {
            "status": "BLOCK",
            "reason": "implausible_weight",
            "message": messages["bad_weight"],
        }

    # -----------------------------
    # 6. Already diagnosed
    # -----------------------------
    if bool(payload["already_diagnosed"]):
        return {
            "status": "EXIT",
            "reason": "already_diagnosed",
            "message": messages["already_diagnosed"],
        }

    # -----------------------------
    # 7. General health
    # -----------------------------
    if gen_health not in (1, 2, 3, 4, 5):
        return {
            "status": "BLOCK",
            "reason": "invalid_gen_health",
            "message": messages["bad_gen_health"],
        }

    # -----------------------------
    # 8. Calculate BMI
    # -----------------------------
    bmi = round(
        weight_kg / ((height_cm / 100) ** 2),
        1
    )

    warnings = []

    if bmi < 12 or bmi > 80:
        warnings.append(
            messages["extreme_bmi"].format(bmi=bmi)
        )

    # -----------------------------
    # 9. Age bucket
    # -----------------------------
    age_bucket = age_to_bucket(age)

    if age_bucket is None:
        return {
            "status": "BLOCK",
            "reason": "age_bucket_failed",
            "message": messages["bad_age"],
        }

    # -----------------------------
    # 10. Model-ready features
    # -----------------------------
    features = {
        "Age": age_bucket,
        "Sex": 1 if sex == "male" else 0,
        "BMI": bmi,
        "HighBP": 1 if bool(payload["high_bp"]) else 0,
        "HighChol": 1 if bool(payload["high_chol"]) else 0,
        "Smoker": 1 if bool(payload["smoker"]) else 0,
        "PhysActivity": 1 if bool(payload["phys_activity"]) else 0,
        "GenHlth": gen_health,
    }

    # -----------------------------
    # 11. Final result
    # -----------------------------
    if warnings:
        return {
            "status": "WARN",
            "warnings": warnings,
            "features": features,
        }

    return {
        "status": "PASS",
        "features": features,
    }