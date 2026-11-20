
import { LAB_TEST_IDS } from "./labRanges.js";

export const OCR_TEST_IDS = Object.freeze({
  ...LAB_TEST_IDS,
});

const GLUCOSE_CONVERSION_FACTOR = 18.0182;

// Recognizes supported lab-test names.
// PPBS is deliberately checked separately from OGTT.
const TEST_PATTERNS = [
  {
    testId: OCR_TEST_IDS.HBA1C,
    pattern:
      /\b(?:hba1c|hb\s*a1c|hemoglobin\s*a1c|glycated\s*hemoglobin|glycosylated\s*hemoglobin)\b/i,
    unit: "%",
  },
  {
    testId: OCR_TEST_IDS.OGTT,
    pattern:
      /\b(?:ogtt|oral\s+glucose\s+tolerance(?:\s+test)?)\b/i,
    unit: "mg/dL",
  },
  {
    testId: OCR_TEST_IDS.PPBS,
    pattern:
      /\b(?:ppbs|post[\s-]*prandial(?:\s+blood)?(?:\s+sugar| glucose)?|post\s+meal\s+(?:blood\s+)?(?:glucose|sugar))\b/i,
    unit: "mg/dL",
  },
  {
    testId: OCR_TEST_IDS.FPG,
    pattern:
      /\b(?:fpg|fbs|fasting\s+(?:plasma\s+)?(?:blood\s+)?(?:glucose|sugar)|fasting\s+glucose)\b/i,
    unit: "mg/dL",
  },
  {
    testId: OCR_TEST_IDS.RBG,
    pattern:
      /\b(?:rbg|rbs|random\s+(?:blood\s+)?(?:glucose|sugar)|random\s+blood\s+glucose)\b/i,
    unit: "mg/dL",
  },
];

const UNIT_PATTERN = /(?:mg\s*\/\s*d[l1]|mmol\s*\/\s*l|%)/i;

// Matches common reference intervals such as:
// (70-100), [70 - 100], 70 to 100
const REFERENCE_RANGE_PATTERN =
  /(?:\[|\()?\s*\d+(?:\.\d+)?\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?\s*(?:\]|\))?/gi;

const NUMBER_PATTERN = /-?\d+(?:\.\d+)?/g;

const normalizeSpaces = (text) =>
  String(text ?? "").replace(/\s+/g, " ").trim();

export function normalizeUnit(rawUnit) {
  if (!rawUnit) {
    return null;
  }

  const unit = String(rawUnit)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/1/g, "l");

  if (unit === "%" || unit === "percent") {
    return "%";
  }

  if (unit === "mg/dl") {
    return "mg/dL";
  }

  if (unit === "mmol/l") {
    return "mmol/L";
  }

  return null;
}

function extractUnit(text) {
  const match = String(text ?? "").match(UNIT_PATTERN);

  return match ? normalizeUnit(match[0]) : null;
}

function removeReferenceRanges(text) {
  return String(text ?? "").replace(REFERENCE_RANGE_PATTERN, " ");
}

function getNumbers(text) {
  return (String(text ?? "").match(NUMBER_PATTERN) || [])
    .map(Number)
    .filter(Number.isFinite);
}

function extractMeasurement(text) {
  const cleanedText = removeReferenceRanges(text);
  const unit = extractUnit(cleanedText);
  const numbers = getNumbers(cleanedText);

  if (numbers.length === 0) {
    return null;
  }

  // Use the last numeric value after removing reference intervals.
  // This avoids selecting the lower or upper reference limit.
  const value = numbers[numbers.length - 1];

  return {
    value,
    unit,
  };
}

export function validateValue(testId, value, unit) {
  const numericValue = Number(value);

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(numericValue) ||
    numericValue <= 0
  ) {
    return {
      valid: false,
      reason: "invalid_value",
    };
  }

  if (testId === OCR_TEST_IDS.HBA1C) {
    if (unit !== "%" || numericValue < 3 || numericValue > 15) {
      return {
        valid: false,
        reason: "implausible_hba1c_value",
      };
    }

    return {
      valid: true,
      reason: null,
    };
  }

  const glucoseTestIds = [
    OCR_TEST_IDS.FPG,
    OCR_TEST_IDS.RBG,
    OCR_TEST_IDS.OGTT,
    OCR_TEST_IDS.PPBS,
  ];

  if (!glucoseTestIds.includes(testId)) {
    return {
      valid: false,
      reason: "unsupported_test",
    };
  }

  if (!["mg/dL", "mmol/L"].includes(unit)) {
    return {
      valid: false,
      reason: "missing_or_unsupported_unit",
    };
  }

  const valueInMgDl =
    unit === "mmol/L"
      ? numericValue * GLUCOSE_CONVERSION_FACTOR
      : numericValue;

  if (valueInMgDl < 20 || valueInMgDl > 800) {
    return {
      valid: false,
      reason: "implausible_glucose_value",
    };
  }

  return {
    valid: true,
    reason: null,
  };
}

function createCandidate(testId, measurement, sourceText) {
  const originalValue = measurement.value;
  const originalUnit = measurement.unit;

  let value = originalValue;
  let unit = originalUnit;
  let convertedFrom = null;

  // Convert mmol/L to mg/dL only once.
  // Preserve the original OCR value and unit for display and verification.
  if (
    testId !== OCR_TEST_IDS.HBA1C &&
    originalUnit === "mmol/L"
  ) {
    value = Number(
      (originalValue * GLUCOSE_CONVERSION_FACTOR).toFixed(1)
    );

    unit = "mg/dL";
    convertedFrom = "mmol/L";
  }

  const validation = validateValue(testId, originalValue, originalUnit);

  const needsManualReview =
    !originalUnit || !validation.valid;

  return {
    testId,
    value,
    unit,
    originalValue,
    originalUnit,
    convertedFrom,
    needsManualReview,
    validationReason: validation.reason,
    sourceText: normalizeSpaces(sourceText),
  };
}

function findTest(line) {
  return TEST_PATTERNS.find(({ pattern }) => pattern.test(line)) || null;
}

function getMeasurementAfterLabel(line, pattern) {
  const match = pattern.exec(line);

  if (!match) {
    return null;
  }

  const textAfterLabel = line.slice(match.index + match[0].length);

  return extractMeasurement(textAfterLabel);
}

function isStandaloneResultLine(line) {
  const cleaned = normalizeSpaces(removeReferenceRanges(line));

  if (!cleaned) {
    return false;
  }

  // Avoid taking values from another named test or unrelated report field.
  if (findTest(cleaned)) {
    return false;
  }

  if (
    /\b(?:age|date|patient|doctor|sample|report|reference|normal|range)\b/i.test(
      cleaned
    )
  ) {
    return false;
  }

  return getNumbers(cleaned).length > 0;
}

export function extractLabCandidates(ocrText) {
  if (typeof ocrText !== "string" || !ocrText.trim()) {
    return [];
  }

  const lines = ocrText
    .split(/\r?\n/)
    .map(normalizeSpaces)
    .filter(Boolean);

  const candidates = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const test = findTest(line);

    if (!test) {
      continue;
    }

    let measurement = getMeasurementAfterLabel(line, test.pattern);
    let sourceText = line;

    // Support reports where the test name and result are on separate lines.
    // Only accept a simple standalone result line.
    if (
      !measurement &&
      index + 1 < lines.length &&
      isStandaloneResultLine(lines[index + 1])
    ) {
      measurement = extractMeasurement(lines[index + 1]);
      sourceText = `${line} ${lines[index + 1]}`;
      index += 1;
    }

    if (!measurement) {
      continue;
    }

    const candidate = createCandidate(
      test.testId,
      measurement,
      sourceText
    );

    candidates.push(candidate);
  }

  return candidates;
}
