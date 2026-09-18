from lambda_function import lambda_handler


test_case = {
    "age": 45,
    "sex": "female",
    "height_cm": 160,
    "weight_kg": 75,

    "high_bp": True,
    "high_chol": True,
    "smoker": False,
    "phys_activity": False,
    "gen_health": 3,

    "already_diagnosed": False,

    "lang": "en"
}


# TEST 1 — Normal prediction
print("\nTEST 1 — Normal Prediction")
print(lambda_handler(test_case, None))


# TEST 2 — Missing field
print("\nTEST 2 — Missing Age")
test_case["age"] = ""
print(lambda_handler(test_case, None))


# TEST 3 — Impossible age
print("\nTEST 3 — Impossible Age")
test_case["age"] = 150
print(lambda_handler(test_case, None))


# TEST 4 — Already diagnosed
print("\nTEST 4 — Already Diagnosed")
test_case["age"] = 45
test_case["already_diagnosed"] = True
print(lambda_handler(test_case, None))


# TEST 5 — Hindi
print("\nTEST 5 — Hindi")
test_case["already_diagnosed"] = False
test_case["lang"] = "hi"
print(lambda_handler(test_case, None))