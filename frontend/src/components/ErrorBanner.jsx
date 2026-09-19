import "./ErrorBanner.css";

export default function ErrorBanner({ title, message, onRetry, retryLabel }) {
  return (
    <div className="error-banner" role="alert">
      {title && <h3 className="eb-title">{title}</h3>}
      <p className="eb-message">{message}</p>
      {onRetry && (
        <button type="button" className="eb-retry" onClick={onRetry}>
          {retryLabel || "Try Again"}
        </button>
      )}
    </div>
  );
}
