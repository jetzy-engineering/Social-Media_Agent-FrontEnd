function StatusPanel({ statusText, response, error }) {
  if (!statusText && !response && !error) {
    return null;
  }

  return (
    <section className="status-panel" aria-live="polite">
      {statusText && <p className="status-line">{statusText}</p>}
      {response && <p className="response-text">{response}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}

export default StatusPanel;
