import strings from "../i18n/strings";
import "./WarningsBanner.css";

export default function WarningsBanner({ warnings, lang }) {
  const t = strings[lang];

  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="warnings-banner" role="alert">
      <h3 className="wb-title">{t.warningsTitle}</h3>
      <ul className="wb-list">
        {warnings.map((w, idx) => (
          <li key={idx}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
