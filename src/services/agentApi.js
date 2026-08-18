import { buildAgentServerUrl, readJsonResponse } from "./http.js";

export async function sendAgentRequest({ message, mediaItems }) {
  const response = await fetch(buildAgentServerUrl("/agent"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      mediaItems
    })
  });

  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      data.errorMessage ||
        data.error ||
        `Agent request failed with status ${response.status}.`
    );
  }

  return {
    agentResponse:
      data.agentResponse ||
      "The backend completed the request but returned no response text."
  };
}
