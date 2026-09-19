import strings from "../i18n/strings";
import "./ResultPage.css";

export default function ResultPage({ result, warnings, lang, onContinueToJourney, onNewScreening }) {
  const t = strings[lang];
  const isElevated = result?.prediction === 1;
  const bmi = result?.bmi || "--";
  const factors = result?.top_factors || [];

  return (
    <div className="sg-result-page">
      <div className="sg-res-container">
        {/* ── Page Header ── */}
        <div className="sg-res-header">
          <div className="sg-res-badge-wrap">
            <span className="sg-res-badge">Assessment Complete</span>
          </div>
          <h1 className="sg-res-title">{t.resultPageTitle}</h1>
          <p className="sg-res-sub">{t.resultPageSub}</p>
        </div>

        {/* ── Warnings Banner (If present) ── */}
        {warnings && warnings.length > 0 && (
          <div className="sg-res-warning-banner" role="alert">
            <div className="sg-wb-head">
              <span className="sg-wb-icon">⚠</span>
              <strong>{t.warningsTitle}</strong>
            </div>
            <ul className="sg-wb-list">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Main Result Card ── */}
        <div className={`sg-main-result-card ${isElevated ? "elevated" : "lower"}`}>
          <div className="sg-mrc-badge-pill">
            <span className="sg-mrc-dot"></span>
            <span>{isElevated ? t.resultBadgeElevated : t.resultBadgeLower}</span>
          </div>

          <h2 className="sg-mrc-headline">
            {isElevated ? t.elevatedResult : t.lowerResult}
          </h2>

          <p className="sg-mrc-disclaimer">{t.resultCardDisclaimer}</p>

          <div className="sg-mrc-divider"></div>

          <div className="sg-mrc-bmi-pill">
            <span className="sg-bmi-label">{t.bmiLabel}:</span>
            <span className="sg-bmi-val">{bmi}</span>
            <span className="sg-bmi-unit">{t.bmiUnit}</span>
          </div>
        </div>

        {/* ── Top Factors Grid: What Influenced Your Result ── */}
        <div className="sg-factors-section">
          <div className="sg-factors-head">
            <h3 className="sg-factors-title">{t.factorsTitle}</h3>
            <p className="sg-factors-sub">{t.factorsSubtitle}</p>
          </div>

          <div className="sg-factors-grid">
            {factors.map((f, idx) => {
              const isInc = f.direction === "increased";
              return (
                <div key={idx} className={`sg-factor-chip ${isInc ? "increased" : "decreased"}`}>
                  <div className="sg-fc-top">
                    <span className="sg-fc-num">#{idx + 1}</span>
                    <span className="sg-fc-arrow">{isInc ? "↑" : "↓"}</span>
                  </div>
                  <h4 className="sg-fc-name">{t.factorNames[f.feature] || f.feature}</h4>
                  <span className="sg-fc-dir-label">
                    {isInc ? t.directionIncreased : t.directionDecreased}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="sg-factors-note">{t.factorsDisclaimer}</p>
        </div>

        {/* ── What to do next Card ── */}
        <div className="sg-next-card">
          <div className="sg-next-icon">💡</div>
          <div className="sg-next-text">
            <h4>{t.whatToDoTitle}</h4>
            <p>{t.whatToDoDesc}</p>
          </div>
        </div>

        {/* ── Status Tracker ── */}
        <div className="sg-tracker-card">
          <h4 className="sg-tc-title">Screening Journey</h4>
          <div className="sg-tc-steps">
            <div className="sg-tc-step done">
              <div className="sg-tc-dot">✓</div>
              <span className="sg-tc-label">{t.trackerSteps[0]}</span>
            </div>
            <div className="sg-tc-line done"></div>
            <div className="sg-tc-step current">
              <div className="sg-tc-dot">●</div>
              <span className="sg-tc-label">{t.trackerSteps[1]}</span>
            </div>
            <div className="sg-tc-line"></div>
            <div className="sg-tc-step">
              <div className="sg-tc-dot">3</div>
              <span className="sg-tc-label">{t.trackerSteps[2]}</span>
            </div>
            <div className="sg-tc-line"></div>
            <div className="sg-tc-step">
              <div className="sg-tc-dot">4</div>
              <span className="sg-tc-label">{t.trackerSteps[3]}</span>
            </div>
          </div>
        </div>

        {/* ── Primary Action Buttons ── */}
        <div className="sg-res-actions">
          <button
            type="button"
            className="sg-hero-cta-btn large"
            onClick={onContinueToJourney}
          >
            <span>{t.continueToNextStep}</span>
          </button>
          <button
            type="button"
            className="sg-secondary-btn"
            onClick={onNewScreening}
          >
            {t.startNewScreening}
          </button>
        </div>
      </div>
    </div>
  );
}
