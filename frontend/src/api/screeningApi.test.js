import { localFallbackPredict } from "./screeningApi.js";

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message}\n  Expected: ${JSON.stringify(expected)}\n  Actual:   ${JSON.stringify(actual)}`);
  }
}

function runTests() {
  console.log("Running localFallbackPredict unit tests...");

  // Test 1: Normal PASS prediction
  const normalPayload = {
    age: 45,
    sex: "male",
    height_cm: 175,
    weight_kg: 90,
    high_bp: true,
    high_chol: false,
    smoker: false,
    phys_activity: true,
    gen_health: 3,
    already_diagnosed: false,
  };
  const res1 = localFallbackPredict(normalPayload, "en");
  assertEqual(res1.status, "PASS", "Normal screening should return PASS");
  assertEqual(res1.result.prediction, 0, "45yo male with 29.4 BMI should be prediction 0 (Lower risk)");
  assertEqual(res1.result.bmi, 29.4, "BMI should calculate to 29.4");

  // Test 2: Implausible Age BLOCK
  const badAgePayload = { ...normalPayload, age: 10 };
  const res2 = localFallbackPredict(badAgePayload, "en");
  assertEqual(res2.status, "BLOCK", "Age < 18 should BLOCK");
  assertEqual(res2.reason, "implausible_age", "Reason should be implausible_age");

  // Test 3: Already Diagnosed EXIT
  const diagPayload = { ...normalPayload, already_diagnosed: true };
  const res3 = localFallbackPredict(diagPayload, "en");
  assertEqual(res3.status, "EXIT", "Already diagnosed should return EXIT");

  // Test 4: Elevated Risk PASS
  const highRiskPayload = {
    age: 65,
    sex: "female",
    height_cm: 160,
    weight_kg: 95,
    high_bp: true,
    high_chol: true,
    smoker: true,
    phys_activity: false,
    gen_health: 5,
    already_diagnosed: false,
  };
  const res4 = localFallbackPredict(highRiskPayload, "en");
  assertEqual(res4.status, "PASS", "High risk payload should return PASS");
  assertEqual(res4.result.prediction, 1, "High risk payload should have prediction = 1");

  console.log("✅ All localFallbackPredict unit tests passed!");
}

runTests();
