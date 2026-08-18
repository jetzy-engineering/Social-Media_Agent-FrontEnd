function MediaPicker({
  disabled,
  selectedCount,
  maxFiles,
  onFilesSelected
}) {
  function handleChange(event) {
    onFilesSelected(event.target.files);
    event.target.value = "";
  }

  return (
    <div className="media-picker">
      <input
        id="media-files"
        className="file-input"
        type="file"
        accept="image/*,video/*"
        multiple
        disabled={disabled}
        onChange={handleChange}
      />

      <label
        className={`file-picker-label${disabled ? " is-disabled" : ""}`}
        htmlFor="media-files"
      >
        <span>
          <span className="file-picker-title">Images and videos</span>
          <span className="file-picker-help">
            {selectedCount} of {maxFiles} selected
          </span>
        </span>

        <span className="pick-button">
          {disabled ? "Selection full" : "Choose files"}
        </span>
      </label>
    </div>
  );
}

export default MediaPicker;
