function ResultPanel({ response, error }) {
  if (!response && !error) {
    return null;
  }

  return (
    <section className="result-panel" aria-live="polite">
      {response && <p className="response-text">{response}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}

export default ResultPanel;
