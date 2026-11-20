
export const LAB_TEST_IDS = {
  HBA1C: "hba1c",
  FPG: "fpg",
  RBG: "rbg",
  OGTT: "ogtt",
  PPBS: "ppbs",
};

export const LAB_CATEGORY = {
  NORMAL: "normal",
  PREDIABETES: "prediabetes",
  DIABETES_RANGE: "diabetes_range",
  NON_DIAGNOSTIC: "non_diagnostic",
  MANUAL_REVIEW: "manual_review",
};

const LAB_RANGES = {
  [LAB_TEST_IDS.HBA1C]: {
    name: "HbA1c",
    unit: "%",
    thresholds: {
      normal: 5.7,
      prediabetes: 6.5,
    },
  },

  [LAB_TEST_IDS.FPG]: {
    name: "Fasting Plasma Glucose",
    unit: "mg/dL",
    thresholds: {
      normal: 100,
      prediabetes: 126,
    },
  },

  [LAB_TEST_IDS.OGTT]: {
    name: "Oral Glucose Tolerance Test",
    unit: "mg/dL",
    thresholds: {
      normal: 140,
      prediabetes: 200,
    },
  },
};

const isValidNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0;
};

const createResult = ({
  testId,
  value,
  category,
  label,
  message,
  unit,
}) => ({
  testId,
  testName: LAB_RANGES[testId]?.name || testId.toUpperCase(),
  value,
  unit,
  category,
  label,
  message,
});

export const interpretLabValue = (testId, inputValue) => {
  // Unknown test ID
  if (!Object.values(LAB_TEST_IDS).includes(testId)) {
    return null;
  }

  // Invalid or missing value
  if (!isValidNumber(inputValue)) {
    return null;
  }

  const value = Number(inputValue);

  // PPBS is not equivalent to OGTT.
  // It requires manual clinical review.
  if (testId === LAB_TEST_IDS.PPBS) {
    return createResult({
      testId,
      value,
      unit: "mg/dL",
      category: LAB_CATEGORY.MANUAL_REVIEW,
      label: "Manual review required",
      message:
        "PPBS should not be interpreted using OGTT thresholds. A healthcare professional must review this result in its clinical context.",
    });
  }

  // Random Blood Glucose is not diagnostic on its own.
  if (testId === LAB_TEST_IDS.RBG) {
    if (value >= 200) {
      return createResult({
        testId,
        value,
        unit: "mg/dL",
        category: LAB_CATEGORY.NON_DIAGNOSTIC,
        label: "Clinical evaluation recommended",
        message:
          "Random blood glucose is 200 mg/dL or higher. This may require prompt clinical evaluation, especially when symptoms are present. This result alone does not confirm diabetes.",
      });
    }

    return createResult({
      testId,
      value,
      unit: "mg/dL",
      category: LAB_CATEGORY.NON_DIAGNOSTIC,
      label: "Non-diagnostic result",
      message:
        "Random blood glucose cannot be used alone to confirm or rule out diabetes. A healthcare professional may recommend appropriate follow-up testing.",
    });
  }

  const range = LAB_RANGES[testId];

  if (!range) {
    return null;
  }

  const { normal, prediabetes } = range.thresholds;

  // Normal range
  if (value < normal) {
    return createResult({
      testId,
      value,
      unit: range.unit,
      category: LAB_CATEGORY.NORMAL,
      label: "Within normal range",
      message:
        "This value is below the threshold commonly used for the diabetes risk categories. Discuss your result with a healthcare professional.",
    });
  }

  // Prediabetes range
  if (value < prediabetes) {
    return createResult({
      testId,
      value,
      unit: range.unit,
      category: LAB_CATEGORY.PREDIABETES,
      label: "Prediabetes range",
      message:
        "This value falls in the commonly used prediabetes range. Consult a healthcare professional for assessment and follow-up.",
    });
  }

  // Diabetes range
  return createResult({
    testId,
    value,
    unit: range.unit,
    category: LAB_CATEGORY.DIABETES_RANGE,
    label: "Diabetes range",
    message:
      "This value falls in the diabetes range. Doctor confirmation is required; this result alone does not establish a diagnosis.",
  });
};
