
/* global process */

import { extractLabCandidates, OCR_TEST_IDS } from "./ocrTestMapper.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
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

test("Reads mg/dL from report instead of hardcoding", () => {
  const matches = extractLabCandidates(
    "Fasting Blood Glucose: 110 mg/dL"
  );

  assert(matches[0].unit === "mg/dL", "Unit should be mg/dL");
  assert(
    matches[0].needsManualReview === false,
    "Should not require review"
  );
});

test("Converts mmol/L glucose to mg/dL", () => {
  const matches = extractLabCandidates(
    "Fasting Glucose: 7 mmol/L"
  );

  assert(
    Math.abs(matches[0].value - 126.1) < 0.2,
    "7 mmol/L should convert to about 126.1 mg/dL"
  );

  assert(
    matches[0].convertedFrom === "mmol/L",
    "Conversion source should be shown"
  );
});

test("Skips reference range and extracts actual result", () => {
  const matches = extractLabCandidates(
    "Fasting Glucose (70 - 100): 126 mg/dL"
  );

  assert(
    matches[0].value === 126,
    "Should extract 126, not 70 or 100"
  );
});

test("HbA1c outside 3-15 requires manual verification", () => {
  const matches = extractLabCandidates("HbA1c: 16%");

  assert(
    matches[0].needsManualReview === true,
    "16% should require review"
  );
});

test("HbA1c within supported range is accepted for review", () => {
  const matches = extractLabCandidates("HbA1c: 6.5%");

  assert(
    matches[0].needsManualReview === false,
    "6.5% should pass range validation"
  );
});

test("Glucose outside 20-800 requires manual verification", () => {
  const matches = extractLabCandidates(
    "Random Blood Glucose: 900 mg/dL"
  );

  assert(
    matches[0].needsManualReview === true,
    "900 should require review"
  );
});

test("PPBS is not mapped to OGTT", () => {
  const matches = extractLabCandidates(
    "Post Prandial Blood Sugar: 210 mg/dL"
  );

  assert(
    matches[0].testId === OCR_TEST_IDS.PPBS,
    "Should have PPBS test id"
  );

  assert(
    matches[0].testId !== OCR_TEST_IDS.OGTT,
    "Must not be OGTT"
  );
});

test("Missing unit requires manual review", () => {
  const matches = extractLabCandidates(
    "Fasting Blood Sugar: 126"
  );

  assert(
    matches[0].unit === null,
    "Unit should remain unknown"
  );

  assert(
    matches[0].needsManualReview === true,
    "Missing unit must require review"
  );
});

test("Does not interpret HbA1c as glucose", () => {
  const matches = extractLabCandidates("HbA1c: 6.8%");

  assert(
    matches[0].unit === "%",
    "HbA1c unit must remain percent"
  );

  assert(
    matches[0].value === 6.8,
    "HbA1c value should remain unchanged"
  );
});
