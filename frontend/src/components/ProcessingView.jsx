import strings from "../i18n/strings";
import "./ProcessingView.css";

export default function ProcessingView({ lang }) {
  const t = strings[lang];

  return (
    <div className="sg-processing-page">
      <div className="sg-processing-card">
        {/* Animated medical radar pulse */}
        <div className="sg-proc-pulse-wrap">
          <div className="sg-proc-pulse"></div>
          <div className="sg-proc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>

        <h2 className="sg-proc-title">{t.analyzingTitle}</h2>
        <p className="sg-proc-sub">{t.analyzingSubtitle}</p>

        {/* Progress Checklist */}
        <div className="sg-proc-checklist">
          <div className="sg-proc-item done">
            <span className="sg-proc-check">✓</span>
            <span>{t.analyzingStep1}</span>
          </div>
          <div className="sg-proc-item done">
            <span className="sg-proc-check">✓</span>
            <span>{t.analyzingStep2}</span>
          </div>
          <div className="sg-proc-item running">
            <span className="sg-proc-spinner"></span>
            <span>{t.analyzingStep3}</span>
          </div>
        </div>

        <div className="sg-proc-bar-wrap">
          <div className="sg-proc-bar-fill"></div>
        </div>
      </div>
    </div>
  );
}
