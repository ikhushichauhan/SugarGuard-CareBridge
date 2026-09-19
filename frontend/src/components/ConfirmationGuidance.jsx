import strings from "../i18n/strings";
import "./ConfirmationGuidance.css";

export default function ConfirmationGuidance({ isElevated, lang }) {
  const t = strings[lang];
  const points = isElevated ? t.guidanceElevated : t.guidanceLower;

  return (
    <div className="guidance-card">
      <h3 className="gc-title">{t.guidanceTitle}</h3>
      <ul className="gc-list">
        {points.map((point, idx) => (
          <li key={idx} className="gc-item">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
