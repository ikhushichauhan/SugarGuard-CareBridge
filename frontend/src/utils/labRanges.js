// ═══════════════════════════════════════════════════════════════════════
// SugarGuard CareBridge — Manual Lab Report Checker: reference-range logic
// ═══════════════════════════════════════════════════════════════════════
//
// Reference ranges (non-pregnant adults):
//   HbA1c              < 5.7%        Normal
//                       5.7 – 6.4%   Prediabetes range
//                       ≥ 6.5%       Diabetes range
//
//   Fasting Glucose     < 100 mg/dL  Normal
//                       100 – 125    Prediabetes range
//                       ≥ 126 mg/dL  Diabetes range
//
//   2-hour OGTT         < 140 mg/dL  Normal
//                       140 – 199    Prediabetes range
//                       ≥ 200 mg/dL  Diabetes range
//
//   Random Glucose      < 200 mg/dL  Not diagnostic on its own
//                       ≥ 200 mg/dL  Diagnostic-range flag (with symptoms)
//
// IMPORTANT: This module classifies a single numeric value against
// published reference ranges. It never diagnoses anyone and never returns
// wording like "you have diabetes" — see the `category` / `tone` values
// below and how the UI renders them. All human-readable copy lives in
// src/i18n/strings.js; this file only returns i18n *keys*, not text, so
// it has zero React/i18n dependencies and can be unit-tested directly.

export const LAB_TEST_IDS = {
  HBA1C: "hba1c",
  FPG: "fpg",
  RBG: "rbg",
  OGTT: "ogtt",
};

// Categories a classification can resolve to. Intentionally does NOT
// include anything like "diabetic" / "has diabetes" — these are range
// labels, not diagnoses.
export const LAB_CATEGORY = {
  NORMAL: "normal",
  PREDIABETES: "prediabetes",
  DIABETES_RANGE: "diabetes-range",
  RBG_BELOW_THRESHOLD: "rbg-below-threshold",
  RBG_DIAGNOSTIC_FLAG: "rbg-diagnostic-flag",
};

/**
 * Classify a value against a standard three-band range (used by HbA1c,
 * Fasting Glucose, and OGTT). Boundaries are inclusive on the lower end
 * of each band: a value exactly equal to `prediabetesFrom` or
 * `diabetesFrom` falls into the higher band, matching how the published
 * ranges are written (e.g. "100–125 mg/dL" prediabetes, "≥126" diabetes).
 */
function classifyThreeBand(value, prediabetesFrom, diabetesFrom) {
  if (value < prediabetesFrom) {
    return {
      category: LAB_CATEGORY.NORMAL,
      tone: "normal",
      labelKey: "labCategoryNormalLabel",
      descKey: "labCategoryNormalDesc",
    };
  }
  if (value < diabetesFrom) {
    return {
      category: LAB_CATEGORY.PREDIABETES,
      tone: "warning",
      labelKey: "labCategoryPrediabetesLabel",
      descKey: "labCategoryPrediabetesDesc",
    };
  }
  return {
    category: LAB_CATEGORY.DIABETES_RANGE,
    tone: "alert",
    labelKey: "labCategoryDiabetesLabel",
    descKey: "labCategoryDiabetesDesc",
  };
}

/**
 * Random Blood Glucose is handled separately: it is only ever
 * diagnostically meaningful at/above 200 mg/dL, and even then only
 * alongside classic symptoms — so it never gets a "Normal" /
 * "Prediabetes" label the way the other three tests do.
 */
function classifyRandomGlucose(value) {
  if (value < 200) {
    return {
      category: LAB_CATEGORY.RBG_BELOW_THRESHOLD,
      tone: "info",
      labelKey: "labRbgBelowLabel",
      descKey: "labRbgBelowDesc",
    };
  }
  return {
    category: LAB_CATEGORY.RBG_DIAGNOSTIC_FLAG,
    tone: "alert",
    labelKey: "labRbgAboveLabel",
    descKey: "labRbgAboveDesc",
  };
}

/**
 * Interpret a single manually-entered lab value against published
 * reference ranges for non-pregnant adults.
 *
 * @param {string} testId - one of LAB_TEST_IDS values
 * @param {number|string} rawValue - the entered value
 * @returns {{category:string,tone:string,labelKey:string,descKey:string}|null}
 *   Returns null if the test id is unrecognized or the value isn't a
 *   finite number — callers should validate input before calling this,
 *   but this function fails safe rather than throwing.
 */
export function interpretLabValue(testId, rawValue) {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return null;

  switch (testId) {
    case LAB_TEST_IDS.HBA1C:
      return classifyThreeBand(value, 5.7, 6.5);
    case LAB_TEST_IDS.FPG:
      return classifyThreeBand(value, 100, 126);
    case LAB_TEST_IDS.OGTT:
      return classifyThreeBand(value, 140, 200);
    case LAB_TEST_IDS.RBG:
      return classifyRandomGlucose(value);
    default:
      return null;
  }
}
