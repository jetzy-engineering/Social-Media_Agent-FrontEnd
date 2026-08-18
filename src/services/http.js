const agentServerUrl = import.meta.env.VITE_AGENT_SERVER_URL?.replace(
  /\/+$/,
  ""
);

if (!agentServerUrl) {
  throw new Error(
    "VITE_AGENT_SERVER_URL is missing. Copy .env.example to .env and set the agent server URL."
  );
}

export function buildAgentServerUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${agentServerUrl}${normalizedPath}`;
}

export async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();

    throw new Error(
      text || `Expected JSON but received HTTP ${response.status}.`
    );
  }

  return response.json();
}
