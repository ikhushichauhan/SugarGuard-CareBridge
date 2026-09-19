import { useState, useRef } from "react";
import strings from "../i18n/strings";
import { interpretLabValue } from "../utils/labRanges";
import { runOcr, OCR_STATUS } from "../utils/ocrClient";
import { extractLabCandidates } from "../utils/ocrTestMapper";
import "./LabReportPage.css";

// Supported manual lab tests. `labelKey` points at an i18n string in
// strings.js; `unit` is a fixed measurement unit (not translated, since
// "%" and "mg/dL" are the same across en/hi).
const TEST_OPTIONS = [
  { id: "hba1c", labelKey: "labTestHbA1c", unit: "%" },
  { id: "fpg", labelKey: "labTestFPG", unit: "mg/dL" },
  { id: "rbg", labelKey: "labTestRBG", unit: "mg/dL" },
  { id: "ogtt", labelKey: "labTestOGTT", unit: "mg/dL" },
];

export default function LabReportPage({ lang, onBackToHome, onAddToCarePassport }) {
  const t = strings[lang];

  const [testType, setTestType] = useState("");
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null); // { testId, value, unit, interpretation } | null
  const [addedToPassport, setAddedToPassport] = useState(false);

  // ── OCR-specific state (does not affect manual entry above) ──
  const [ocrStatus, setOcrStatus] = useState("idle"); // idle | processing | done | error
  const [ocrMessage, setOcrMessage] = useState(null);
  const [ocrCandidates, setOcrCandidates] = useState([]); // [{testId, value, unit, sourceLine}]
  const [ocrPopulated, setOcrPopulated] = useState(false); // true once a candidate has been applied to the form
  const fileInputRef = useRef(null);

  const selectedTest = TEST_OPTIONS.find((opt) => opt.id === testType) || null;

  const resetOcrState = () => {
    setOcrStatus("idle");
    setOcrMessage(null);
    setOcrCandidates([]);
    setOcrPopulated(false);
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetOcrState();
    setOcrStatus("processing");
    setOcrMessage(t.ocrProcessingMsg);

    const ocrResult = await runOcr(file);

    if (ocrResult.status !== OCR_STATUS.OK && ocrResult.status !== OCR_STATUS.LOW_CONFIDENCE) {
      // UNSUPPORTED_FILE / NO_TEXT_FOUND / ENGINE_ERROR - extraction did
      // not produce usable text. Existing manual form below remains fully
      // available and untouched.
      setOcrStatus("error");
      setOcrMessage(ocrResult.message || t.ocrGenericErrorMsg);
      return;
    }

    const { matches } = extractLabCandidates(ocrResult.rawText);

    if (matches.length === 0) {
      setOcrStatus("error");
      setOcrMessage(t.ocrNoSupportedTestFoundMsg);
      return;
    }

    setOcrCandidates(matches);
    setOcrStatus("done");
    setOcrMessage(
      ocrResult.status === OCR_STATUS.LOW_CONFIDENCE ? t.ocrLowConfidenceMsg : t.ocrReviewBeforeCheckingMsg
    );
  };

  // Applies ONE extracted candidate into the exact same testType/value
  // state the manual form uses. Values remain fully editable afterwards -
  // this does not lock or bypass the existing form in any way.
  const handleApplyCandidate = (candidate) => {
    setTestType(candidate.testId);
    setValue(String(candidate.value));
    setErrors({});
    setSubmitted(null);
    setAddedToPassport(false);
    setOcrPopulated(true);
  };

  const handleClearOcr = () => {
    resetOcrState();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTestChange = (e) => {
    setTestType(e.target.value);
    setErrors((prev) => ({ ...prev, testType: undefined }));
    setSubmitted(null); // changing the test invalidates any prior result
    setAddedToPassport(false);
    setOcrPopulated(false); // manual change counts as reviewed/edited
  };

  const handleValueChange = (e) => {
    setValue(e.target.value);
    setErrors((prev) => ({ ...prev, value: undefined }));
    setSubmitted(null);
    setAddedToPassport(false);
    setOcrPopulated(false); // manual change counts as reviewed/edited
  };

  const validate = () => {
    const e = {};

    if (!testType) {
      e.testType = t.labTestRequired;
    }

    if (value === "" || value === null || value === undefined) {
      e.value = t.labValueRequired;
    } else {
      const numeric = Number(value);
      if (Number.isNaN(numeric) || numeric <= 0) {
        e.value = t.labValueInvalid;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setAddedToPassport(false);
    if (!validate()) {
      setSubmitted(null);
      return;
    }

    setSubmitted({
      testId: testType,
      value,
      unit: selectedTest.unit,
      interpretation: interpretLabValue(testType, value),
    });
  };

  const handleAddToPassport = () => {
    if (!submitted || !onAddToCarePassport) return;

    const labData = {
      testId: submitted.testId,
      testLabelKey: selectedTest?.labelKey || "labTestHbA1c",
      value: submitted.value,
      unit: submitted.unit,
      interpretation: submitted.interpretation,
      date: new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date()),
    };

    setAddedToPassport(true);
    onAddToCarePassport(labData);
  };

  // "Back" clears the current check so the user can start over on this
  // same page, without leaving the Lab Checker entirely.
  const handleReset = () => {
    setTestType("");
    setValue("");
    setErrors({});
    setSubmitted(null);
    setAddedToPassport(false);
    resetOcrState();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="sg-lc-page">
      <div className="sg-lc-container">
        {/* ── Page Header ── */}
        <div className="sg-lc-header">
          <span className="sg-lc-badge">{t.labPageBadge}</span>
          <h1 className="sg-lc-title">{t.labPageTitle}</h1>
          <p className="sg-lc-sub">{t.labPageSub}</p>
        </div>

        {/* ── OCR Upload (optional) ── */}
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
                {ocrStatus === "processing" ? t.ocrProcessingMsg : t.ocrUploadPrompt}
              </span>
            </label>

            {ocrMessage && (
              <p className={`sg-lc-ocr-message ${ocrStatus === "error" ? "error" : ""}`}>
                {ocrMessage}
              </p>
            )}

            {ocrCandidates.length > 0 && (
              <div className="sg-lc-ocr-candidates">
                <p className="sg-lc-ocr-candidates-label">{t.ocrCandidatesLabel}</p>
                <div className="sg-lc-ocr-candidates-list">
                  {ocrCandidates.map((c, idx) => {
                    const opt = TEST_OPTIONS.find((o) => o.id === c.testId);
                    const isApplied = testType === c.testId && value === String(c.value);
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`sg-lc-ocr-candidate-chip ${isApplied ? "applied" : ""}`}
                        onClick={() => handleApplyCandidate(c)}
                      >
                        <span className="sg-lc-ocr-chip-test">{opt ? t[opt.labelKey] : c.testId}</span>
                        <span className="sg-lc-ocr-chip-value">
                          {c.value} {c.unit}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(ocrCandidates.length > 0 || ocrStatus === "error") && (
              <button type="button" className="sg-lc-ocr-clear-btn" onClick={handleClearOcr}>
                {t.ocrClearBtn}
              </button>
            )}
          </div>
        </div>

        {/* ── Manual Entry Form ── */}
        <form className="sg-lc-form-card" onSubmit={handleSubmit} noValidate>
          {ocrPopulated && (
            <div className="sg-lc-ocr-populated-badge">
              <span>{t.ocrPopulatedBadge}</span>
            </div>
          )}

          {/* Test selector */}
          <div className="sg-lc-field">
            <label htmlFor="lab-test-type" className="sg-lc-label">
              {t.labTestSelectLabel}
            </label>
            <select
              id="lab-test-type"
              className={`sg-lc-select ${errors.testType ? "error" : ""}`}
              value={testType}
              onChange={handleTestChange}
            >
              <option value="">{t.labTestSelectPlaceholder}</option>
              {TEST_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {t[opt.labelKey]}
                </option>
              ))}
            </select>
            {errors.testType && (
              <span className="sg-lc-error">{errors.testType}</span>
            )}
          </div>

          {/* Value + Unit */}
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
                className={`sg-lc-input ${errors.value ? "error" : ""}`}
                value={value}
                onChange={handleValueChange}
              />
              {errors.value && (
                <span className="sg-lc-error">{errors.value}</span>
              )}
            </div>

            <div className="sg-lc-field sg-lc-field-unit">
              <label className="sg-lc-label">{t.labUnitLabel}</label>
              <div className="sg-lc-unit-display" aria-live="polite">
                {selectedTest ? selectedTest.unit : "—"}
              </div>
            </div>
          </div>

          <button type="submit" className="sg-lc-submit-btn">
            {t.labCheckResultBtn}
          </button>
        </form>

        {/* ── Interpreted Result Area ── */}
        {submitted && submitted.interpretation && (
          <div
            className={`sg-lc-result-card tone-${submitted.interpretation.tone}`}
            role="status"
          >
            <div className="sg-lc-result-badge">
              {t[submitted.interpretation.labelKey]}
            </div>

            <div className="sg-lc-result-summary">
              <p className="sg-lc-result-intro">{t.labResultIntro}</p>
              <div className="sg-lc-result-row">
                <span className="sg-lc-result-key">
                  {t.labResultSubmittedTestLabel}
                </span>
                <span className="sg-lc-result-val">
                  {t[TEST_OPTIONS.find((o) => o.id === submitted.testId).labelKey]}
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
            </div>

            <p className="sg-lc-result-desc">
              {t[submitted.interpretation.descKey]}
            </p>

            {/* Shown for any range that isn't a plain "normal" result —
                covers prediabetes range, diabetes range, and the RBG
                diagnostic-flag case. Deliberately NOT shown for the RBG
                below-threshold case, since its own description already
                explains that no confirmation is being requested. */}
            {submitted.interpretation.tone !== "normal" &&
              submitted.interpretation.category !== "rbg-below-threshold" && (
                <p className="sg-lc-result-confirm">{t.labConfirmationNote}</p>
              )}

            <div className="sg-lc-result-footnotes">
              <p className="sg-lc-result-footnote">{t.labPregnancyNote}</p>
              <p className="sg-lc-result-footnote">{t.labToolDisclaimer}</p>
            </div>

            {/* ── Add to Care Passport CTA ── */}
            <div className="sg-lc-add-passport-wrap">
              <button
                type="button"
                className={`sg-lc-add-passport-btn ${addedToPassport ? "added" : ""}`}
                onClick={handleAddToPassport}
              >
                {addedToPassport ? t.addedToPassportMsg : t.addToPassportBtn}
              </button>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
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
