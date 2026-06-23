export const sendMessageToAgent = async (prompt: string, userId: string, accessToken?: string) => {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Forward the access token if available to let the backend use Google Calendar API
      ...(accessToken && { "Authorization": `Bearer ${accessToken}` })
    },
    body: JSON.stringify({ prompt, userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to communicate with AI agent");
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  // Handle stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
};
