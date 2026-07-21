import { useEffect, useRef, useState } from "react";
import jetzyLogo from "./assets/jetzy-logo.png";

export default function SocialMediaAgent() {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "agent",
      text: "Welcome to the Jetzy Social Media Agent. What would you like to post?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const conversationEndRef = useRef(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  function handleFileSelection(event) {
    const files = Array.from(event.target.files || []);

    const preparedFiles = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setSelectedFiles((currentFiles) => [
      ...currentFiles,
      ...preparedFiles,
    ]);

    // Allows the same file to be selected again later.
    event.target.value = "";
  }

  function removeSelectedFile(fileId) {
    setSelectedFiles((currentFiles) => {
      const fileToRemove = currentFiles.find(
        (selectedFile) => selectedFile.id === fileId
      );

      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }

      return currentFiles.filter(
        (selectedFile) => selectedFile.id !== fileId
      );
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if ((!trimmedMessage && selectedFiles.length === 0) || isLoading) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmedMessage || "Media uploaded",
      media: selectedFiles.map((selectedFile) => ({
        type: selectedFile.type,
        previewUrl: selectedFile.previewUrl,
        name: selectedFile.file.name,
      })),
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      /*
        Your backend currently expects public media URLs.

        Before sending files to /api/chat, upload them to Cloudinary,
        Firebase Storage, S3, or another storage service, then construct:

        mediaItems = [
          {
            type: "image",
            url: "https://public-image-url.com/image.jpg"
          }
        ];
      */

      const mediaItems = [];

      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          mediaItems,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            responseData.message ||
            "The request failed."
        );
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "agent",
          text:
            responseData.response ||
            responseData.message ||
            "The request was completed.",
        },
      ]);

      selectedFiles.forEach((selectedFile) => {
        URL.revokeObjectURL(selectedFile.previewUrl);
      });

      setSelectedFiles([]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "agent",
          text: `Something went wrong: ${error.message}`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <img
          src={jetzyLogo}
          alt="Jetzy"
          style={styles.logo}
        />

        <div>
          <h1 style={styles.title}>Social Media Agent</h1>
          <p style={styles.subtitle}>
            Create and publish social media content with AI
          </p>
        </div>
      </header>

      <main style={styles.chatContainer}>
        <section style={styles.conversation}>
          {messages.map((chatMessage) => (
            <div
              key={chatMessage.id}
              style={{
                ...styles.messageRow,
                justifyContent:
                  chatMessage.role === "user"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  ...(chatMessage.role === "user"
                    ? styles.userBubble
                    : styles.agentBubble),
                  ...(chatMessage.isError
                    ? styles.errorBubble
                    : {}),
                }}
              >
                {chatMessage.text && (
                  <p style={styles.messageText}>
                    {chatMessage.text}
                  </p>
                )}

                {chatMessage.media?.length > 0 && (
                  <div style={styles.messageMediaGrid}>
                    {chatMessage.media.map((mediaItem) =>
                      mediaItem.type === "video" ? (
                        <video
                          key={mediaItem.previewUrl}
                          src={mediaItem.previewUrl}
                          controls
                          style={styles.messageMedia}
                        />
                      ) : (
                        <img
                          key={mediaItem.previewUrl}
                          src={mediaItem.previewUrl}
                          alt={mediaItem.name}
                          style={styles.messageMedia}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={styles.messageRow}>
              <div
                style={{
                  ...styles.messageBubble,
                  ...styles.agentBubble,
                }}
              >
                <p style={styles.messageText}>Thinking...</p>
              </div>
            </div>
          )}

          <div ref={conversationEndRef} />
        </section>

        <section style={styles.inputSection}>
          {selectedFiles.length > 0 && (
            <div style={styles.previewArea}>
              {selectedFiles.map((selectedFile) => (
                <div
                  key={selectedFile.id}
                  style={styles.previewCard}
                >
                  {selectedFile.type === "video" ? (
                    <video
                      src={selectedFile.previewUrl}
                      style={styles.previewMedia}
                    />
                  ) : (
                    <img
                      src={selectedFile.previewUrl}
                      alt={selectedFile.file.name}
                      style={styles.previewMedia}
                    />
                  )}

                  <button
                    type="button"
                    aria-label={`Remove ${selectedFile.file.name}`}
                    onClick={() =>
                      removeSelectedFile(selectedFile.id)
                    }
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.inputBar}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelection}
              style={{ display: "none" }}
            />

            <button
              type="button"
              aria-label="Upload images or videos"
              onClick={() => fileInputRef.current?.click()}
              style={styles.attachButton}
            >
              +
            </button>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell the agent what you want to post..."
              rows={1}
              style={styles.textarea}
            />

            <button
              type="submit"
              disabled={
                isLoading ||
                (!message.trim() && selectedFiles.length === 0)
              }
              style={{
                ...styles.sendButton,
                opacity:
                  isLoading ||
                  (!message.trim() && selectedFiles.length === 0)
                    ? 0.5
                    : 1,
              }}
            >
              Send
            </button>
          </form>

          <p style={styles.disclaimer}>
            Review generated content before publishing it.
          </p>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
    color: "#172033",
    fontFamily:
      'Inter, Arial, Helvetica, sans-serif',
  },

  header: {
    height: "86px",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e4e8ef",
    boxSizing: "border-box",
  },

  logo: {
    width: "52px",
    height: "52px",
    objectFit: "contain",
  },

  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#6a7280",
    fontSize: "13px",
  },

  chatContainer: {
    maxWidth: "960px",
    height: "calc(100vh - 86px)",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },

  conversation: {
    flex: 1,
    overflowY: "auto",
    padding: "32px 20px 20px",
  },

  messageRow: {
    width: "100%",
    display: "flex",
    marginBottom: "18px",
  },

  messageBubble: {
    maxWidth: "72%",
    padding: "14px 17px",
    borderRadius: "20px",
    boxSizing: "border-box",
    boxShadow: "0 3px 12px rgba(20, 30, 50, 0.06)",
  },

  userBubble: {
    backgroundColor: "#172033",
    color: "#ffffff",
    borderBottomRightRadius: "6px",
  },

  agentBubble: {
    backgroundColor: "#ffffff",
    color: "#172033",
    border: "1px solid #e4e8ef",
    borderBottomLeftRadius: "6px",
  },

  errorBubble: {
    backgroundColor: "#fff1f1",
    border: "1px solid #ffc9c9",
    color: "#a61b1b",
  },

  messageText: {
    margin: 0,
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },

  messageMediaGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "8px",
    marginTop: "12px",
  },

  messageMedia: {
    width: "100%",
    maxHeight: "230px",
    borderRadius: "12px",
    objectFit: "cover",
  },

  inputSection: {
    padding: "12px 20px 20px",
  },

  previewArea: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    padding: "0 4px 12px",
  },

  previewCard: {
    width: "78px",
    height: "78px",
    position: "relative",
    flexShrink: 0,
  },

  previewMedia: {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    objectFit: "cover",
    border: "1px solid #dce1e8",
  },

  removeButton: {
    width: "24px",
    height: "24px",
    position: "absolute",
    top: "-7px",
    right: "-7px",
    border: "none",
    borderRadius: "50%",
    backgroundColor: "#172033",
    color: "#ffffff",
    fontSize: "18px",
    lineHeight: "20px",
    cursor: "pointer",
  },

  inputBar: {
    minHeight: "64px",
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    padding: "10px",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #dce1e8",
    boxShadow: "0 8px 28px rgba(20, 30, 50, 0.1)",
  },

  attachButton: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    borderRadius: "50%",
    border: "1px solid #dce1e8",
    backgroundColor: "#f6f8fb",
    color: "#172033",
    fontSize: "26px",
    cursor: "pointer",
  },

  textarea: {
    flex: 1,
    minHeight: "42px",
    maxHeight: "150px",
    padding: "10px 4px",
    border: "none",
    outline: "none",
    resize: "none",
    backgroundColor: "transparent",
    color: "#172033",
    fontFamily: "inherit",
    fontSize: "15px",
    lineHeight: 1.4,
    boxSizing: "border-box",
  },

  sendButton: {
    height: "42px",
    padding: "0 20px",
    border: "none",
    borderRadius: "21px",
    backgroundColor: "#172033",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },

  disclaimer: {
    margin: "10px 0 0",
    textAlign: "center",
    color: "#7a8392",
    fontSize: "12px",
  },
};