/* global process */
import {
  LAB_TEST_IDS,
  LAB_CATEGORY,
  interpretLabValue,
} from "./labRanges.js";

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

test("HbA1c 6.5 is diabetes range", () => {
  const result = interpretLabValue(LAB_TEST_IDS.HBA1C, 6.5);
  assert(result.category === LAB_CATEGORY.DIABETES_RANGE, "6.5 boundary");
});

test("FPG 126 is diabetes range", () => {
  const result = interpretLabValue(LAB_TEST_IDS.FPG, 126);
  assert(result.category === LAB_CATEGORY.DIABETES_RANGE, "126 boundary");
});

test("OGTT 200 is diabetes range", () => {
  const result = interpretLabValue(LAB_TEST_IDS.OGTT, 200);
  assert(result.category === LAB_CATEGORY.DIABETES_RANGE, "200 boundary");
});

test("PPBS requires manual review", () => {
  const result = interpretLabValue(LAB_TEST_IDS.PPBS, 210);
  assert(result.category === LAB_CATEGORY.MANUAL_REVIEW, "PPBS must not use OGTT ranges");
});

test("Invalid values return null", () => {
  assert(interpretLabValue(LAB_TEST_IDS.FPG, "abc") === null, "Invalid number");
});

test("Unknown test ID returns null", () => {
  assert(interpretLabValue("unknown", 120) === null, "Unknown test");
});
