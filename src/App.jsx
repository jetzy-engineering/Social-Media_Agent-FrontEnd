import { useState } from "react";
import "./App.css";
import MediaPicker from "./components/MediaPicker.jsx";
import MediaGrid from "./components/MediaGrid.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import { sendAgentRequest } from "./services/agentApi.js";
import {
  deleteCloudinaryResources,
  uploadFilesToCloudinary
} from "./services/cloudinaryApi.js";
import {
  createSelectedMedia,
  revokeMediaPreview,
  revokeMediaPreviews,
  validateFiles
} from "./utils/media.js";

const MAX_FILES = Number(import.meta.env.VITE_MAX_FILES || 20);
const MAX_FILE_SIZE_MB = Number(
  import.meta.env.VITE_MAX_FILE_SIZE_MB || 250
);

function App() {
  const [message, setMessage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [agentResponse, setAgentResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleFilesSelected(fileList) {
    const files = Array.from(fileList || []);

    try {
      validateFiles(files, {
        currentCount: selectedMedia.length,
        maxFiles: MAX_FILES,
        maxFileSizeMb: MAX_FILE_SIZE_MB
      });

      setSelectedMedia((current) => [
        ...current,
        ...createSelectedMedia(files)
      ]);

      setError("");
    } catch (selectionError) {
      setError(selectionError.message);
    }
  }

  function removeSelectedMedia(id) {
    setSelectedMedia((current) => {
      const item = current.find((media) => media.id === id);

      if (item) {
        revokeMediaPreview(item);
      }

      return current.filter((media) => media.id !== id);
    });
  }

  function clearSelectedMedia() {
    revokeMediaPreviews(selectedMedia);
    setSelectedMedia([]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage && selectedMedia.length === 0) {
      setError("Enter a message or select at least one image or video.");
      return;
    }

    setError("");
    setAgentResponse("");
    setIsLoading(true);

    let uploadedResources = [];

    try {
      if (selectedMedia.length > 0) {
        uploadedResources = await uploadFilesToCloudinary(
          selectedMedia.map((item) => item.file)
        );
      }

      const mediaItems = uploadedResources.map((resource) => ({
        type: resource.resourceType === "video" ? "video" : "image",
        url: resource.secureUrl
      }));

      const result = await sendAgentRequest({
        message: trimmedMessage,
        mediaItems
      });

      setAgentResponse(result.agentResponse);
      setMessage("");
      clearSelectedMedia();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.message || "Something went wrong.");
    } finally {
      if (uploadedResources.length > 0) {
        try {
          await deleteCloudinaryResources(
            uploadedResources.map((resource) => ({
              publicId: resource.publicId,
              resourceType: resource.resourceType
            }))
          );
        } catch (cleanupError) {
          console.error("Cloudinary cleanup failed:", cleanupError);
          setError((current) =>
            current
              ? `${current} Temporary media cleanup also failed.`
              : "Temporary media cleanup failed."
          );
        }
      }

      setIsLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <p className="brand-label">JETZY</p>
          <h1>Social Media Agent</h1>
          <p className="subtitle">
            Enter a posting instruction and attach images or videos.
          </p>
        </div>
      </header>

      <main className="app-main">
        <form className="agent-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="message">
            Instruction or caption
          </label>

          <textarea
            id="message"
            className="message-input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Example: Post these images to Instagram with a short travel caption."
            disabled={isLoading}
          />

          <MediaPicker
            disabled={isLoading || selectedMedia.length >= MAX_FILES}
            selectedCount={selectedMedia.length}
            maxFiles={MAX_FILES}
            onFilesSelected={handleFilesSelected}
          />

          <MediaGrid
            media={selectedMedia}
            disabled={isLoading}
            onRemove={removeSelectedMedia}
          />

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={clearSelectedMedia}
              disabled={isLoading || selectedMedia.length === 0}
            >
              Clear media
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Working..." : "Send to agent"}
            </button>
          </div>
        </form>

        <ResultPanel
          response={agentResponse}
          error={error}
        />
      </main>
    </div>
  );
}

export default App;
