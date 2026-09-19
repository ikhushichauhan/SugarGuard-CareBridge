import strings from "../i18n/strings";
import "./ResultCard.css";

export default function ResultCard({ result, lang }) {
  const t = strings[lang];
  const isElevated = result.prediction === 1;

  return (
    <div className={`result-card ${isElevated ? "elevated" : "lower"}`}>
      <h2 className="rc-title">{t.resultTitle}</h2>

      <div className="rc-badge">
        <span className="rc-icon" aria-hidden="true">
          {isElevated ? "⚠" : "✓"}
        </span>
        <span className="rc-label">
          {isElevated ? t.elevated : t.lower}
        </span>
      </div>

      <div className="rc-bmi">
        <span className="rc-bmi-label">{t.bmiLabel}</span>
        <span className="rc-bmi-value">{result.bmi}</span>
      </div>

      <p className="rc-disclaimer">{t.resultDisclaimer}</p>
    </div>
  );
}
