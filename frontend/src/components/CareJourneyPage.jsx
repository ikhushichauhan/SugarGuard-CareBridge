import strings from "../i18n/strings";
import "./CareJourneyPage.css";

export default function CareJourneyPage({ result, labResult, lang, onBackToResult, onBackToHome }) {
  const t = strings[lang];
  const isElevated = result?.prediction === 1;
  const bmi = result?.bmi || "--";
  const factors = result?.top_factors || [];

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

            {/* Step 4 (Follow-up Done - pending clinical follow-up) */}
            <div className="sg-cjc-step">
              <div className="sg-cjc-circle">4</div>
              <div className="sg-cjc-text">
                <span className="sg-cjc-name">{t.trackerSteps[3]}</span>
                <span className="sg-cjc-status">Final</span>
              </div>
            </div>
          </div>
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
