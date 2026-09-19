import strings from "../i18n/strings";
import "./StatusTracker.css";

export default function StatusTracker({ currentStep, lang }) {
  const t = strings[lang];
  const steps = t.trackerSteps;

  return (
    <div className="status-tracker">
      <h3 className="st-title">{t.trackerTitle}</h3>
      <div className="st-steps">
        {steps.map((step, idx) => {
          let status = "upcoming";
          if (idx < currentStep) status = "done";
          else if (idx === currentStep) status = "current";

          return (
            <div key={idx} className={`st-step ${status}`}>
              <div className="st-dot">
                {status === "done" ? "✓" : idx + 1}
              </div>
              <span className="st-label">{step}</span>
              {idx < steps.length - 1 && <div className="st-line" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
