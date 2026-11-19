
import { LAB_TEST_IDS } from "./labRanges.js";

const THRESHOLDS = {
  [LAB_TEST_IDS.HBA1C]: 6.5,
  [LAB_TEST_IDS.FPG]: 126,
  [LAB_TEST_IDS.OGTT]: 200,
};

function isValidISODate(value) {
  if (typeof value !== "string") return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function normalizeResult(result) {
  if (!result || !Object.hasOwn(THRESHOLDS, result.testId)) {
    return null;
  }

  const value = Number(result.value);

  if (!Number.isFinite(value) || value <= 0) return null;
  if (!isValidISODate(result.date)) return null;

  return {
    testId: result.testId,
    value,
    date: result.date,
  };
}

function isAbnormal(result) {
  return result.value >= THRESHOLDS[result.testId];
}

function makeResult(status, message, nextStep) {
  return {
    status,
    message,
    nextStep,
    diagnosisMade: false,
  };
}

export function evaluateConfirmationPattern(results = [], options = {}) {
  const validResults = results
    .map(normalizeResult)
    .filter(Boolean);

  const usableResults = validResults.filter((item) => {
    return !(
      options.hba1cReliable === false &&
      item.testId === LAB_TEST_IDS.HBA1C
    );
  });

  if (options.hba1cReliable === false) {
    const hasGlucoseTest = usableResults.some(
      (item) => item.testId !== LAB_TEST_IDS.HBA1C
    );

    if (!hasGlucoseTest) {
      return makeResult(
        "hba1c_unreliable",
        "HbA1c may be unreliable. Discuss a suitable glucose-based test with a healthcare professional.",
        "glucose_test"
      );
    }
  }

  if (usableResults.length === 0) {
    return makeResult(
      "insufficient_data",
      "No eligible dated laboratory results are available for this review.",
      "add_eligible_test"
    );
  }

  const abnormalResults = usableResults.filter(isAbnormal);

  if (abnormalResults.length === 0) {
    return makeResult(
      "no_abnormal_pattern",
      "No above-threshold confirmation pattern was identified in the saved results. Discuss the reports with a healthcare professional.",
      "discuss_with_doctor"
    );
  }

  const allResultsAbnormal = usableResults.every(isAbnormal);

  const hasDifferentAbnormalTestTypes =
    new Set(abnormalResults.map((item) => item.testId)).size >= 2;

  const hasSameTestOnDifferentDates = abnormalResults.some(
    (first, index) =>
      abnormalResults.some(
        (second, secondIndex) =>
          secondIndex > index &&
          first.testId === second.testId &&
          first.date !== second.date
      )
  );

  if (
    allResultsAbnormal &&
    (hasDifferentAbnormalTestTypes || hasSameTestOnDifferentDates)
  ) {
    return makeResult(
      "confirmed_pattern",
      "Multiple above-threshold results were found. A healthcare professional must review and confirm the findings.",
      "doctor_confirmation"
    );
  }

  if (usableResults.length > 1) {
    return makeResult(
      "discordant",
      "The saved results do not agree. Discuss repeating the test that was above its threshold with a healthcare professional.",
      "repeat_above_threshold_test"
    );
  }

  return makeResult(
    "one_abnormal_result",
    "One above-threshold result was found. Discuss repeat or additional testing with a healthcare professional.",
    "additional_test"
  );
}
