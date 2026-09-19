import "./LanguageToggle.css";

export default function LanguageToggle({ lang, onToggle, label }) {
  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${lang === "en" ? "Hindi" : "English"}`}
    >
      <span className="lang-globe" aria-hidden="true">🌐</span>
      <span>{label}</span>
    </button>
  );
}
