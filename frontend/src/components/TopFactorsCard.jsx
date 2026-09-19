import strings from "../i18n/strings";
import "./TopFactorsCard.css";

export default function TopFactorsCard({ factors, lang }) {
  const t = strings[lang];

  if (!factors || factors.length === 0) return null;

  return (
    <div className="factors-card">
      <h3 className="fc-title">{t.factorsTitle}</h3>

      <ul className="fc-list">
        {factors.map((f, idx) => (
          <li key={idx} className={`fc-item ${f.direction}`}>
            <span className="fc-arrow" aria-hidden="true">
              {f.direction === "increased" ? "↑" : "↓"}
            </span>
            <div className="fc-content">
              <span className="fc-name">
                {t.factorNames[f.feature] || f.feature}
              </span>
              <span className="fc-dir">
                {f.direction === "increased"
                  ? t.directionIncreased
                  : t.directionDecreased}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className="fc-disclaimer">{t.factorsDisclaimer}</p>
    </div>
  );
}
