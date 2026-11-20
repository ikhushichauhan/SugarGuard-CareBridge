
import { useRef, useState } from "react";
import strings from "../i18n/strings";
import { interpretLabValue } from "../utils/labRanges";
import { runOcr, OCR_STATUS } from "../utils/ocrClient";
import { extractLabCandidates } from "../utils/ocrTestMapper";
import "./LabReportPage.css";

const TEST_OPTIONS = [
  { id: "hba1c", labelKey: "labTestHbA1c", unit: "%" },
  { id: "fpg", labelKey: "labTestFPG", unit: "mg/dL" },
  { id: "rbg", labelKey: "labTestRBG", unit: "mg/dL" },
  { id: "ogtt", labelKey: "labTestOGTT", unit: "mg/dL" },
  { id: "ppbs", labelKey: "labTestPPBS", unit: "mg/dL" },
];

const GLUCOSE_TESTS = ["fpg", "rbg", "ogtt", "ppbs"];

const todayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isValidDate = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || "")) {
    return false;
  }

  const date = new Date(`${dateString}T00:00:00`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateString
  );
};

const isGlucoseTest = (testId) => GLUCOSE_TESTS.includes(testId);

const convertToMgDl = (value, unit) => {
  const numericValue = Number(value);

  if (unit === "mmol/L") {
    return Number((numericValue * 18.0182).toFixed(1));
  }

  return numericValue;
};

const getInterpretationTone = (interpretation) => {
  if (!interpretation) return "info";

  switch (interpretation.category) {
    case "normal":
      return "normal";

    case "prediabetes":
    case "non_diagnostic":
      return "warning";

    case "diabetes_range":
    case "diabetes-range":
      return "alert";

    case "manual_review":
      return "warning";

    default:
      return "info";
  }
};

const getInterpretationLabel = (interpretation, t) => {
  if (!interpretation) return t.labValueInvalid;

  if (interpretation.labelKey && t[interpretation.labelKey]) {
    return t[interpretation.labelKey];
  }

  return interpretation.label || t.labManualReviewLabel;
};

const getInterpretationMessage = (interpretation, t) => {
  if (!interpretation) return t.labValueInvalid;

  if (interpretation.descKey && t[interpretation.descKey]) {
    return t[interpretation.descKey];
  }

  return interpretation.message || t.labToolDisclaimer;
};

export default function LabReportPage({
  lang,
  onBackToHome,
  onAddToCarePassport,
}) {
  const t = strings[lang] || strings.en;

  const [testType, setTestType] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [reportDate, setReportDate] = useState(todayISO());

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [addedToPassport, setAddedToPassport] = useState(false);

  const [ocrStatus, setOcrStatus] = useState("idle");
  const [ocrMessage, setOcrMessage] = useState("");
  const [ocrCandidates, setOcrCandidates] = useState([]);
  const [ocrPopulated, setOcrPopulated] = useState(false);
  const [ocrVerified, setOcrVerified] = useState(false);
  const [, setOcrNeedsManualReview] = useState(false);
  const [ocrOriginal, setOcrOriginal] = useState(null);

  const fileInputRef = useRef(null);

  const selectedTest = TEST_OPTIONS.find(
    (item) => item.id === testType
  );

  const isConvertedOcrValue =
    Boolean(ocrOriginal?.convertedFrom) &&
    ocrPopulated;

  const resetResult = () => {
    setSubmitted(null);
    setAddedToPassport(false);
    setErrors({});
  };

  const resetOcrState = () => {
    setOcrStatus("idle");
    setOcrMessage("");
    setOcrCandidates([]);
    setOcrPopulated(false);
    setOcrVerified(false);
    setOcrNeedsManualReview(false);
    setOcrOriginal(null);
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    resetOcrState();
    resetResult();

    setOcrStatus("processing");
    setOcrMessage(t.ocrProcessingMsg);

    try {
      const result = await runOcr(file);

      if (
        result.status !== OCR_STATUS.OK &&
        result.status !== OCR_STATUS.LOW_CONFIDENCE
      ) {
        setOcrStatus("error");
        setOcrMessage(result.message || t.ocrGenericErrorMsg);
        return;
      }

      // extractLabCandidates returns an array directly.
      const candidates = extractLabCandidates(result.rawText);

      if (!candidates.length) {
        setOcrStatus("error");
        setOcrMessage(t.ocrNoSupportedTestFoundMsg);
        return;
      }

      const lowConfidence =
        result.status === OCR_STATUS.LOW_CONFIDENCE;

      const safeCandidates = candidates.map((candidate) => ({
        ...candidate,
        needsManualReview:
          Boolean(candidate.needsManualReview) || lowConfidence,
      }));

      setOcrCandidates(safeCandidates);
      setOcrStatus("done");

      setOcrMessage(
        lowConfidence
          ? t.ocrLowConfidenceMsg
          : t.ocrReviewBeforeCheckingMsg
      );
    } catch (error) {
      console.error("OCR processing failed:", error);

      setOcrStatus("error");
      setOcrMessage(t.ocrGenericErrorMsg);
    }
  };

  const handleApplyCandidate = (candidate) => {
    const option = TEST_OPTIONS.find(
      (item) => item.id === candidate.testId
    );

    if (!option) return;

    setTestType(candidate.testId);
    setValue(String(candidate.value));

    // Never assume a missing OCR unit.
    // A converted mmol/L candidate is already stored in mg/dL.
    setUnit(candidate.unit || "");

    // The OCR text does not reliably provide the report date.
    // Ask the user to enter the actual date.
    setReportDate("");

    setOcrPopulated(true);
    setOcrVerified(false);

    setOcrNeedsManualReview(
      Boolean(candidate.needsManualReview) ||
      !candidate.unit ||
      !candidate.value
    );

    setOcrOriginal({
      originalValue: candidate.originalValue ?? candidate.value,
      originalUnit: candidate.originalUnit ?? candidate.unit ?? "",
      convertedFrom: candidate.convertedFrom || null,
      sourceLine: candidate.sourceText || "",
    });

    resetResult();
  };

  const handleTestChange = (event) => {
    const nextTest = event.target.value;

    const option = TEST_OPTIONS.find(
      (item) => item.id === nextTest
    );

    setTestType(nextTest);
    setUnit(option?.unit || "");

    setOcrPopulated(false);
    setOcrVerified(false);
    setOcrNeedsManualReview(false);
    setOcrOriginal(null);

    resetResult();
  };

  const handleValueChange = (event) => {
    setValue(event.target.value);
    resetResult();
  };

  const handleUnitChange = (event) => {
    setUnit(event.target.value);
    resetResult();
  };

  const handleDateChange = (event) => {
    setReportDate(event.target.value);
    resetResult();
  };

  const validate = () => {
    const nextErrors = {};
    const numericValue = Number(value);

    if (!testType) {
      nextErrors.testType = t.labTestRequired;
    }

    if (
      value === "" ||
      !Number.isFinite(numericValue) ||
      numericValue <= 0
    ) {
      nextErrors.value = t.labValueInvalid;
    }

    if (
      !isValidDate(reportDate) ||
      reportDate > todayISO()
    ) {
      nextErrors.date = t.labDateRequired;
    }

    if (selectedTest && !unit) {
      nextErrors.unit = t.labUnitRequired;
    }

    if (
      selectedTest &&
      isGlucoseTest(testType) &&
      !["mg/dL", "mmol/L"].includes(unit)
    ) {
      nextErrors.unit = t.labUnitRequired;
    }

    if (ocrPopulated && !ocrVerified) {
      nextErrors.ocr = t.ocrMustVerify;
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setAddedToPassport(false);

    if (!validate()) {
      setSubmitted(null);
      return;
    }

    // A converted OCR candidate is already in mg/dL.
    // Its unit is locked to mg/dL in the UI.
    const finalValue =
      testType === "hba1c"
        ? Number(value)
        : convertToMgDl(value, unit);

    const finalUnit =
      testType === "hba1c" ? "%" : "mg/dL";

    const interpretation = interpretLabValue(
      testType,
      finalValue
    );

    if (!interpretation) {
      setErrors({
        value: t.labValueInvalid,
      });
      setSubmitted(null);
      return;
    }

    setSubmitted({
      testId: testType,
      value: finalValue,
      unit: finalUnit,
      interpretation,
      dateISO: reportDate,
      original: ocrOriginal,
      verified: ocrPopulated ? ocrVerified : true,
    });
  };

  const handleAddToPassport = () => {
    if (!submitted || !onAddToCarePassport) return;

    const option = TEST_OPTIONS.find(
      (item) => item.id === submitted.testId
    );

    const formattedDate = new Intl.DateTimeFormat(
      lang === "hi" ? "hi-IN" : "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(`${submitted.dateISO}T00:00:00`));

    const labData = {
      testId: submitted.testId,
      testLabelKey: option?.labelKey || "labTestHbA1c",
      value: submitted.value,
      unit: submitted.unit,
      interpretation: submitted.interpretation,
      dateISO: submitted.dateISO,
      date: formattedDate,
      originalValue: submitted.original?.originalValue ?? null,
      originalUnit: submitted.original?.originalUnit ?? null,
      convertedFrom: submitted.original?.convertedFrom ?? null,
      sourceLine: submitted.original?.sourceLine ?? null,
      manuallyVerified: submitted.verified,
    };

    onAddToCarePassport(labData);
    setAddedToPassport(true);
  };

  const handleReset = () => {
    setTestType("");
    setValue("");
    setUnit("");
    setReportDate(todayISO());

    setSubmitted(null);
    setAddedToPassport(false);
    setErrors({});

    resetOcrState();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayedTest = submitted
    ? TEST_OPTIONS.find(
        (item) => item.id === submitted.testId
      )
    : null;

  const resultTone = submitted
    ? getInterpretationTone(submitted.interpretation)
    : "info";

  return (
    <div className="sg-lc-page">
      <div className="sg-lc-container">
        <div className="sg-lc-header">
          <span className="sg-lc-badge">{t.labPageBadge}</span>
          <h1 className="sg-lc-title">{t.labPageTitle}</h1>
          <p className="sg-lc-sub">{t.labPageSub}</p>
        </div>

        {/* OCR upload section */}
        <div className="sg-lc-ocr-card">
          <div className="sg-lc-ocr-head">
            <span className="sg-lc-ocr-badge">{t.ocrBadge}</span>
            <h3 className="sg-lc-ocr-title">{t.ocrUploadTitle}</h3>
            <p className="sg-lc-ocr-sub">{t.ocrUploadSub}</p>
          </div>

          <div className="sg-lc-ocr-body">
            <label className="sg-lc-ocr-dropzone">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelected}
                disabled={ocrStatus === "processing"}
              />

              <span className="sg-lc-ocr-dropzone-text">
                {ocrStatus === "processing"
                  ? t.ocrProcessingMsg
                  : t.ocrUploadPrompt}
              </span>
            </label>

            {ocrMessage && (
              <p
                className={`sg-lc-ocr-message ${
                  ocrStatus === "error" ? "error" : ""
                }`}
                role="status"
              >
                {ocrMessage}
              </p>
            )}

            {ocrCandidates.length > 0 && (
              <div className="sg-lc-ocr-candidates">
                <p className="sg-lc-ocr-candidates-label">
                  {t.ocrCandidatesLabel}
                </p>

                <div className="sg-lc-ocr-candidates-list">
                  {ocrCandidates.map((candidate, index) => {
                    const option = TEST_OPTIONS.find(
                      (item) => item.id === candidate.testId
                    );

                    const applied =
                      testType === candidate.testId &&
                      value === String(candidate.value);

                    return (
                      <button
                        key={`${candidate.testId}-${index}`}
                        type="button"
                        className={`sg-lc-ocr-candidate-chip ${
                          applied ? "applied" : ""
                        }`}
                        onClick={() =>
                          handleApplyCandidate(candidate)
                        }
                      >
                        <span className="sg-lc-ocr-chip-test">
                          {option
                            ? t[option.labelKey]
                            : candidate.testId}
                        </span>

                        <span className="sg-lc-ocr-chip-value">
                          {candidate.value}{" "}
                          {candidate.unit || t.labUnitUnknown}
                        </span>

                        {candidate.needsManualReview && (
                          <span className="sg-lc-review-flag">
                            {t.labManualReviewLabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(ocrCandidates.length > 0 ||
              ocrStatus === "error") && (
              <button
                type="button"
                className="sg-lc-ocr-clear-btn"
                onClick={() => {
                  resetOcrState();

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                {t.ocrClearBtn}
              </button>
            )}
          </div>
        </div>

        {/* Lab report form */}
        <form
          className="sg-lc-form-card"
          onSubmit={handleSubmit}
          noValidate
        >
          {ocrPopulated && (
            <div className="sg-lc-ocr-populated-badge">
              {t.ocrPopulatedBadge}
            </div>
          )}

          <div className="sg-lc-field">
            <label
              htmlFor="lab-test-type"
              className="sg-lc-label"
            >
              {t.labTestSelectLabel}
            </label>

            <select
              id="lab-test-type"
              className={`sg-lc-select ${
                errors.testType ? "error" : ""
              }`}
              value={testType}
              onChange={handleTestChange}
            >
              <option value="">
                {t.labTestSelectPlaceholder}
              </option>

              {TEST_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {t[option.labelKey]}
                </option>
              ))}
            </select>

            {errors.testType && (
              <span className="sg-lc-error">
                {errors.testType}
              </span>
            )}
          </div>

          <div className="sg-lc-row">
            <div className="sg-lc-field sg-lc-field-value">
              <label htmlFor="lab-value" className="sg-lc-label">
                {t.labValueLabel}
              </label>

              <input
                id="lab-value"
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                placeholder={t.labValuePlaceholder}
                className={`sg-lc-input ${
                  errors.value ? "error" : ""
                }`}
                value={value}
                onChange={handleValueChange}
              />

              {errors.value && (
                <span className="sg-lc-error">
                  {errors.value}
                </span>
              )}
            </div>

            <div className="sg-lc-field sg-lc-field-unit">
              <label htmlFor="lab-unit" className="sg-lc-label">
                {t.labUnitLabel}
              </label>

              {selectedTest &&
                isGlucoseTest(testType) &&
                (ocrPopulated && isConvertedOcrValue) ? (
                  <div className="sg-lc-unit-display">
                    mg/dL
                  </div>
                ) : selectedTest &&
                  isGlucoseTest(testType) &&
                  (ocrPopulated || !unit) ? (
                  <select
                    id="lab-unit"
                    className={`sg-lc-select ${
                      errors.unit ? "error" : ""
                    }`}
                    value={unit}
                    onChange={handleUnitChange}
                  >
                    <option value="">
                      {t.labUnitRequired}
                    </option>
                    <option value="mg/dL">mg/dL</option>
                    <option value="mmol/L">mmol/L</option>
                  </select>
                ) : selectedTest ? (
                  <div className="sg-lc-unit-display">
                    {selectedTest.unit}
                  </div>
                ) : (
                  <div className="sg-lc-unit-display">—</div>
                )}

              {errors.unit && (
                <span className="sg-lc-error">
                  {errors.unit}
                </span>
              )}
            </div>
          </div>

          <div className="sg-lc-field">
            <label
              htmlFor="lab-report-date"
              className="sg-lc-label"
            >
              {t.labReportDateLabel}
            </label>

            <input
              id="lab-report-date"
              type="date"
              max={todayISO()}
              className={`sg-lc-input ${
                errors.date ? "error" : ""
              }`}
              value={reportDate}
              onChange={handleDateChange}
            />

            {errors.date && (
              <span className="sg-lc-error">
                {errors.date}
              </span>
            )}
          </div>

          {/* OCR verification */}
          {ocrPopulated && (
            <div className="sg-lc-review-panel">
              <p>{t.ocrManualVerificationPrompt}</p>

              {ocrOriginal && (
                <div className="sg-lc-original-value">
                  <p>
                    <strong>
                      {t.ocrOriginalValueLabel}:{" "}
                    </strong>
                    {ocrOriginal.originalValue}{" "}
                    {ocrOriginal.originalUnit ||
                      t.labUnitUnknown}
                  </p>

                  {ocrOriginal.convertedFrom && (
                    <p>
                      <strong>
                        {t.ocrConvertedValueLabel}:{" "}
                      </strong>
                      {value} {unit}
                    </p>
                  )}

                  {ocrOriginal.sourceLine && (
                    <p>
                      <strong>
                        {t.ocrManualVerificationPrompt}:{" "}
                      </strong>
                      {ocrOriginal.sourceLine}
                    </p>
                  )}
                </div>
              )}

              <label className="sg-lc-verify-check">
                <input
                  type="checkbox"
                  checked={ocrVerified}
                  onChange={(event) => {
                    setOcrVerified(event.target.checked);

                    setErrors((previous) => ({
                      ...previous,
                      ocr: undefined,
                    }));
                  }}
                />

                <span>{t.ocrConfirmValueCheckbox}</span>
              </label>

              {errors.ocr && (
                <span className="sg-lc-error">
                  {errors.ocr}
                </span>
              )}
            </div>
          )}

          <button type="submit" className="sg-lc-submit-btn">
            {t.labCheckResultBtn}
          </button>
        </form>

        {/* Interpretation result */}
        {submitted && (
          <div
            className={`sg-lc-result-card tone-${resultTone}`}
            role="status"
          >
            <div className="sg-lc-result-badge">
              {getInterpretationLabel(
                submitted.interpretation,
                t
              )}
            </div>

            <div className="sg-lc-result-summary">
              <p className="sg-lc-result-intro">
                {t.labResultIntro}
              </p>

              <div className="sg-lc-result-row">
                <span className="sg-lc-result-key">
                  {t.labResultSubmittedTestLabel}
                </span>

                <span className="sg-lc-result-val">
                  {displayedTest
                    ? t[displayedTest.labelKey]
                    : submitted.testId}
                </span>
              </div>

              <div className="sg-lc-result-row">
                <span className="sg-lc-result-key">
                  {t.labResultSubmittedValueLabel}
                </span>

                <span className="sg-lc-result-val">
                  {submitted.value} {submitted.unit}
                </span>
              </div>

              <div className="sg-lc-result-row">
                <span className="sg-lc-result-key">
                  {t.labReportDateLabel}
                </span>

                <span className="sg-lc-result-val">
                  {submitted.dateISO}
                </span>
              </div>
            </div>

            <p className="sg-lc-result-desc">
              {getInterpretationMessage(
                submitted.interpretation,
                t
              )}
            </p>

            {submitted.interpretation.category !== "normal" && (
              <p className="sg-lc-result-confirm">
                {t.labConfirmationNote}
              </p>
            )}

            {submitted.original?.convertedFrom && (
              <p className="sg-lc-result-confirm">
                {t.ocrOriginalValueLabel}:{" "}
                {submitted.original.originalValue}{" "}
                {submitted.original.originalUnit}.{" "}
                {t.ocrConvertedValueLabel}:{" "}
                {submitted.value} {submitted.unit}.
              </p>
            )}

            <div className="sg-lc-result-footnotes">
              <p className="sg-lc-result-footnote">
                {t.labPregnancyNote}
              </p>

              <p className="sg-lc-result-footnote">
                {t.labToolDisclaimer}
              </p>
            </div>

            <div className="sg-lc-add-passport-wrap">
              <button
                type="button"
                className={`sg-lc-add-passport-btn ${
                  addedToPassport ? "added" : ""
                }`}
                onClick={handleAddToPassport}
                disabled={addedToPassport}
              >
                {addedToPassport
                  ? t.addedToPassportMsg
                  : t.addToPassportBtn}
              </button>
            </div>
          </div>
        )}

        {/* Page actions */}
        <div className="sg-lc-actions">
          <button
            type="button"
            className="sg-lc-back-btn"
            onClick={handleReset}
          >
            <span className="sg-lc-back-arrow">←</span>
            <span>{t.labBackBtn}</span>
          </button>

          <button
            type="button"
            className="sg-lc-home-btn"
            onClick={onBackToHome}
          >
            {t.labHomeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
