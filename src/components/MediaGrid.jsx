function MediaGrid({ media, disabled, onRemove }) {
  if (media.length === 0) {
    return null;
  }

  return (
    <div className="media-grid">
      {media.map((item) => (
        <article className="media-card" key={item.id}>
          {item.kind === "video" ? (
            <video
              className="media-preview"
              src={item.previewUrl}
              controls
              preload="metadata"
            />
          ) : (
            <img
              className="media-preview"
              src={item.previewUrl}
              alt={item.file.name}
            />
          )}

          <button
            className="remove-media-button"
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            aria-label={`Remove ${item.file.name}`}
          >
            ×
          </button>

          <footer className="media-card-footer">
            <span className="media-file-name" title={item.file.name}>
              {item.file.name}
            </span>
          </footer>
        </article>
      ))}
    </div>
  );
}

export default MediaGrid;
