/* global process */
import { evaluateConfirmationPattern } from "./confirmationEngine.js";

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
    process.exitCode = 1;
  }
}

test("HbA1c 6.5 is above threshold", () => {
  const result = evaluateConfirmationPattern([
    { testId: "hba1c", value: 6.5, date: "2026-11-10" },
  ]);
  assert(result.status === "one_abnormal_result", "6.5 boundary");
});

test("HbA1c 6.49 is below threshold", () => {
  const result = evaluateConfirmationPattern([
    { testId: "hba1c", value: 6.49, date: "2026-11-10" },
  ]);
  assert(result.status === "no_abnormal_pattern", "6.49 boundary");
});

test("FPG 126 is above threshold", () => {
  const result = evaluateConfirmationPattern([
    { testId: "fpg", value: 126, date: "2026-11-10" },
  ]);
  assert(result.status === "one_abnormal_result", "126 boundary");
});

test("FPG 125.9 is below threshold", () => {
  const result = evaluateConfirmationPattern([
    { testId: "fpg", value: 125.9, date: "2026-11-10" },
  ]);
  assert(result.status === "no_abnormal_pattern", "125.9 boundary");
});

test("OGTT 200 is above threshold", () => {
  const result = evaluateConfirmationPattern([
    { testId: "ogtt", value: 200, date: "2026-11-10" },
  ]);
  assert(result.status === "one_abnormal_result", "200 boundary");
});

test("Discordant pair asks for repeat test", () => {
  const result = evaluateConfirmationPattern([
    { testId: "hba1c", value: 6.8, date: "2026-11-10" },
    { testId: "fpg", value: 110, date: "2026-11-10" },
  ]);
  assert(result.status === "discordant", "Discordant results");
});

test("Two abnormal tests return doctor confirmation", () => {
  const result = evaluateConfirmationPattern([
    { testId: "hba1c", value: 6.8, date: "2026-11-10" },
    { testId: "fpg", value: 130, date: "2026-11-17" },
  ]);
  assert(result.status === "confirmed_pattern", "Two abnormal results");
  assert(result.diagnosisMade === false, "Must not diagnose");
});

test("Same test abnormal on two different dates", () => {
  const result = evaluateConfirmationPattern([
    { testId: "fpg", value: 130, date: "2026-11-10" },
    { testId: "fpg", value: 132, date: "2026-11-17" },
  ]);
  assert(result.status === "confirmed_pattern", "Repeat abnormal result");
});

test("Unreliable HbA1c asks for glucose test", () => {
  const result = evaluateConfirmationPattern(
    [{ testId: "hba1c", value: 7.1, date: "2026-11-10" }],
    { hba1cReliable: false }
  );
  assert(result.status === "hba1c_unreliable", "HbA1c reliability");
});
