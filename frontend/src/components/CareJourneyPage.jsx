import { useState, useEffect, useRef } from "react";
import strings from "../i18n/strings";
import "./CareJourneyPage.css";

// ── Follow-up tracking (localStorage-backed, component-local) ──
// This is a NEW, independent piece of state (does not overlap with the
// existing `result` / `labResult` props), so it is kept local to this
// component with its own persistence rather than threading a new prop/
// setter through App.jsx - avoids creating a second parallel state
// system for data App.jsx already owns.
const FOLLOWUP_STORAGE_KEY = "sugarguard_followup_status";

function loadFollowUpStatus() {
  try {
    const raw = localStorage.getItem(FOLLOWUP_STORAGE_KEY);
    if (!raw) return { followUpDone: false, followUpDate: null };
    const parsed = JSON.parse(raw);
    return {
      followUpDone: Boolean(parsed.followUpDone),
      followUpDate: parsed.followUpDate || null,
    };
  } catch {
    return { followUpDone: false, followUpDate: null };
  }
}

function saveFollowUpStatus(status) {
  try {
    localStorage.setItem(FOLLOWUP_STORAGE_KEY, JSON.stringify(status));
  } catch {
    // localStorage may be unavailable (private browsing, storage full,
    // etc.) - fail silently rather than crashing the Care Journey page.
  }
}

function formatDisplayDate(isoDateStr) {
  if (!isoDateStr) return "";
  const d = new Date(`${isoDateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDateStr;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function CareJourneyPage({ result, labResult, lang, onBackToResult, onBackToHome }) {
  const t = strings[lang];
  const isElevated = result?.prediction === 1;
  const bmi = result?.bmi || "--";
  const factors = result?.top_factors || [];

  const [followUp, setFollowUp] = useState(() => loadFollowUpStatus());
  const [showConfirmMsg, setShowConfirmMsg] = useState(false);
  const confirmTimeoutRef = useRef(null);

  useEffect(() => {
    // Clean up any pending auto-dismiss timer on unmount.
    return () => {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    };
  }, []);

  const handleMarkFollowUpDone = () => {
    const todayIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const newStatus = { followUpDone: true, followUpDate: todayIso };
    setFollowUp(newStatus);
    saveFollowUpStatus(newStatus);

    setShowConfirmMsg(true);
    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    confirmTimeoutRef.current = setTimeout(() => setShowConfirmMsg(false), 4000);
  };

  const handleMarkIncomplete = () => {
    const resetStatus = { followUpDone: false, followUpDate: null };
    setFollowUp(resetStatus);
    saveFollowUpStatus(resetStatus);
    setShowConfirmMsg(false);
    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
  };

  // Formatted date string
  const todayStr = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sg-journey-page">
      <div className="sg-jp-container">
        {/* ── Page Header ── */}
        <div className="sg-jp-header no-print">
          {result && (
            <button type="button" className="sg-back-btn" onClick={onBackToResult}>
              <span className="sg-back-arrow">←</span>
              <span>{t.backToResultBtn}</span>
            </button>
          )}
          <h1 className="sg-jp-title">{t.journeyPageTitle}</h1>
          <p className="sg-jp-sub">{t.journeyPageSub}</p>
        </div>

        {/* ── 1. Main Guidance Card ── */}
        <div className="sg-guidance-card no-print">
          <span className="sg-gc-tag">{t.guidanceCardTag}</span>
          <h2 className="sg-gc-title">{t.guidanceCardTitle}</h2>
          <p className="sg-gc-body">{t.guidanceCardBody}</p>
        </div>

        {/* ── 2. Confirmation Passport (Printable Summary) ── */}
        <div className="sg-passport-section" id="confirmation-passport">
          <div className="sg-passport-head no-print">
            <div>
              <h3 className="sg-pass-heading">{t.passportHeading}</h3>
              <p className="sg-pass-sub">{t.passportSub}</p>
            </div>
            <button
              type="button"
              className="sg-download-btn"
              onClick={handlePrint}
            >
              <span>{t.downloadPassportBtn}</span>
            </button>
          </div>

          {/* Printable Passport Paper Card */}
          <div className="sg-passport-card">
            <div className="sg-pp-watermark">CONFIRMATION PASSPORT</div>

            {/* Passport Header */}
            <div className="sg-pp-header">
              <div className="sg-pp-brand">
                <span className="sg-pp-logo">SugarGuard CareBridge</span>
                <span className="sg-pp-tag">Screening-to-Confirmation Summary</span>
              </div>
              <div className="sg-pp-meta">
                <span className="sg-pp-date-label">{t.passportDateLabel}:</span>
                <span className="sg-pp-date-val">{todayStr}</span>
              </div>
            </div>

            <div className="sg-pp-divider"></div>

            {/* Passport Summary Table */}
            <div className="sg-pp-body">
              {result && (
                <div className="sg-pp-metrics-grid">
                  <div className="sg-pp-metric">
                    <span className="sg-ppm-label">{t.passportIndicationLabel}</span>
                    <span className={`sg-ppm-val ${isElevated ? "elevated" : "lower"}`}>
                      {isElevated ? t.elevatedResult : t.lowerResult}
                    </span>
                  </div>
                  <div className="sg-pp-metric">
                    <span className="sg-ppm-label">{t.passportBmiLabel}</span>
                    <span className="sg-ppm-val">{bmi} kg/m²</span>
                  </div>
                </div>
              )}

              {/* Factors list if screening result exists */}
              {factors.length > 0 && (
                <div className="sg-pp-factors">
                  <h4 className="sg-ppf-title">{t.passportFactorsLabel}</h4>
                  <ul className="sg-ppf-list">
                    {factors.map((f, idx) => {
                      const isInc = f.direction === "increased";
                      return (
                        <li key={idx} className="sg-ppf-item">
                          <span className="sg-ppf-bullet">•</span>
                          <span className="sg-ppf-name">
                            {t.factorNames[f.feature] || f.feature}
                          </span>
                          <span className={`sg-ppf-dir ${isInc ? "inc" : "dec"}`}>
                            {isInc ? "↑ Elevated signal" : "↓ Lower signal"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Lab Results section (Step 3) inside Passport card */}
              {labResult && (
                <div className="sg-pp-lab-section">
                  <h4 className="sg-ppf-title">{t.passportLabSectionTitle}</h4>
                  <div className="sg-pp-lab-card">
                    <div className="sg-pp-lab-grid">
                      <div className="sg-pp-lab-item">
                        <span className="sg-pp-lab-label">{t.passportLabTestLabel}:</span>
                        <span className="sg-pp-lab-val">
                          {t[labResult.testLabelKey] || labResult.testId}
                        </span>
                      </div>
                      <div className="sg-pp-lab-item">
                        <span className="sg-pp-lab-label">{t.passportLabValueLabel}:</span>
                        <span className="sg-pp-lab-val">
                          {labResult.value} {labResult.unit}
                        </span>
                      </div>
                      <div className="sg-pp-lab-item">
                        <span className="sg-pp-lab-label">{t.passportLabInterpretationLabel}:</span>
                        <span className={`sg-pp-lab-badge tone-${labResult.interpretation?.tone}`}>
                          {t[labResult.interpretation?.labelKey]}
                        </span>
                      </div>
                      <div className="sg-pp-lab-item">
                        <span className="sg-pp-lab-label">{t.passportLabDateLabel}:</span>
                        <span className="sg-pp-lab-val">{labResult.date}</span>
                      </div>
                    </div>
                    {labResult.interpretation?.descKey && (
                      <div className="sg-pp-lab-desc">
                        <strong>{t.passportLabExplanationLabel}: </strong>
                        <span>{t[labResult.interpretation.descKey]}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Follow-up Status section (Step 4) inside Passport card */}
              {followUp.followUpDone && (
                <div className="sg-pp-followup-section">
                  <h4 className="sg-ppf-title">{t.passportFollowUpTitle}</h4>
                  <div className="sg-pp-lab-card">
                    <div className="sg-pp-lab-grid">
                      <div className="sg-pp-lab-item">
                        <span className="sg-pp-lab-label">{t.passportFollowUpStatusLabel}:</span>
                        <span className="sg-pp-lab-val">{t.passportFollowUpStatusDone}</span>
                      </div>
                      <div className="sg-pp-lab-item">
                        <span className="sg-pp-lab-label">{t.passportFollowUpDateLabel}:</span>
                        <span className="sg-pp-lab-val">{formatDisplayDate(followUp.followUpDate)}</span>
                      </div>
                    </div>
                    <div className="sg-pp-lab-desc">
                      <span>{t.passportFollowUpDisclaimer}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Discussion prompt box for clinical visit */}
              <div className="sg-pp-prompts">
                <strong>Recommended for Clinical Discussion:</strong>
                <p>
                  Please present this screening summary to your healthcare professional to discuss whether confirmatory testing (such as fasting blood glucose or HbA1c) is appropriate.
                </p>
              </div>
            </div>

            {/* Passport Footnote */}
            <div className="sg-pp-footer">
              <p>{t.passportFootnote}</p>
            </div>
          </div>
        </div>

        {/* ── 3. Care Journey Timeline ── */}
        <div className="sg-care-journey-card no-print">
          <h3 className="sg-cjc-title">{t.careJourneyTitle}</h3>
          <div className="sg-cjc-timeline">
            {/* Step 1 */}
            <div className={`sg-cjc-step ${result ? "done" : ""}`}>
              <div className="sg-cjc-circle">{result ? "✓" : "1"}</div>
              <div className="sg-cjc-text">
                <span className="sg-cjc-name">{t.trackerSteps[0]}</span>
                <span className="sg-cjc-status">{result ? "Complete" : "Optional"}</span>
              </div>
            </div>
            <div className={`sg-cjc-line ${result ? "done" : ""}`}></div>

            {/* Step 2 */}
            <div className={`sg-cjc-step ${result ? "done" : "current"}`}>
              <div className="sg-cjc-circle">{result ? "✓" : "●"}</div>
              <div className="sg-cjc-text">
                <span className="sg-cjc-name">{t.trackerSteps[1]}</span>
                <span className="sg-cjc-status">{result ? "Complete" : "Active Step"}</span>
              </div>
            </div>
            <div className={`sg-cjc-line ${result || labResult ? "done" : ""}`}></div>

            {/* Step 3 (Lab Result Checked) */}
            <div className={`sg-cjc-step ${labResult ? "done" : result ? "current" : ""}`}>
              <div className="sg-cjc-circle">{labResult ? "✓" : result ? "●" : "3"}</div>
              <div className="sg-cjc-text">
                <span className="sg-cjc-name">{t.trackerSteps[2]}</span>
                <span className="sg-cjc-status">{labResult ? "Complete" : result ? "Active Step" : "Next"}</span>
              </div>
            </div>
            <div className={`sg-cjc-line ${labResult ? "done" : ""}`}></div>

            {/* Step 4 (Follow-up Done) */}
            <div className={`sg-cjc-step ${followUp.followUpDone ? "done" : labResult ? "current" : ""}`}>
              <div className="sg-cjc-circle">{followUp.followUpDone ? "✓" : labResult ? "●" : "4"}</div>
              <div className="sg-cjc-text">
                <span className="sg-cjc-name">{t.trackerSteps[3]}</span>
                <span className="sg-cjc-status">
                  {followUp.followUpDone
                    ? `${t.followUpCompletedOn} ${formatDisplayDate(followUp.followUpDate)}`
                    : labResult
                    ? t.followUpStatusActive
                    : t.followUpStatusFinal}
                </span>

                {labResult && !followUp.followUpDone && (
                  <button
                    type="button"
                    className="sg-followup-btn no-print"
                    onClick={handleMarkFollowUpDone}
                  >
                    {t.followUpDoneBtn}
                  </button>
                )}

                {followUp.followUpDone && (
                  <button
                    type="button"
                    className="sg-followup-undo-link no-print"
                    onClick={handleMarkIncomplete}
                  >
                    {t.followUpMarkIncomplete}
                  </button>
                )}
              </div>
            </div>
          </div>

          {showConfirmMsg && (
            <div className="sg-followup-confirm-msg no-print">
              <span>✓ {t.followUpConfirmedMsg}</span>
            </div>
          )}
        </div>

        {/* ── 4. What to Discuss Before Your Visit ── */}
        <div className="sg-discuss-card no-print">
          <div className="sg-dc-header">
            <div>
              <h3 className="sg-dc-title">{t.whatToDiscussTitle}</h3>
              <p className="sg-dc-sub">{t.whatToDiscussSub}</p>
            </div>
          </div>

          <div className="sg-dc-grid">
            <div className="sg-dc-item">
              <span className="sg-dc-num">1</span>
              <p>{t.discussPoint1}</p>
            </div>
            <div className="sg-dc-item">
              <span className="sg-dc-num">2</span>
              <p>{t.discussPoint2}</p>
            </div>
            <div className="sg-dc-item">
              <span className="sg-dc-num">3</span>
              <p>{t.discussPoint3}</p>
            </div>
            <div className="sg-dc-item">
              <span className="sg-dc-num">4</span>
              <p>{t.discussPoint4}</p>
            </div>
          </div>
        </div>

        {/* ── 5. Bottom Actions ── */}
        <div className="sg-jp-actions no-print">
          <button
            type="button"
            className="sg-hero-cta-btn large"
            onClick={handlePrint}
          >
            <span>{t.downloadPassportBtn}</span>
          </button>
          <div className="sg-jp-action-links">
            {result && (
              <button
                type="button"
                className="sg-secondary-btn"
                onClick={onBackToResult}
              >
                {t.backToResultBtn}
              </button>
            )}
            <button
              type="button"
              className="sg-secondary-btn"
              onClick={onBackToHome}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
