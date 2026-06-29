"use client";

import { useState } from "react";
import { sendMessageToAgent } from "@/lib/api/agent-client";
import { useAuth } from "@/hooks/useAuth";

import { Loader2, Sparkles } from "lucide-react";

export const AgentNudge = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    setError("");
    setResponse("");

    try {
      // In a real app, you would securely retrieve and pass the Google OAuth access token
      // Currently passing an empty string as a placeholder.
      const aiResponse = await sendMessageToAgent(prompt, user.uid, "user_access_token_placeholder");
      setResponse(aiResponse);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 memphis-card shadow-none">
      <div className="flex items-center gap-2 mb-4 text-[var(--memphis-pink)]">
        <Sparkles className="w-5 h-5 flex-shrink-0" />
        <h3 className="font-semibold font-display text-sm sm:text-base">VibeShift AI</h3>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Schedule my React task for tomorrow..."
          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-none px-4 py-3 min-h-[48px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] focus:shadow-none transition-all font-body text-[14px] w-full"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading || !prompt.trim()}
          className="memphis-btn disabled:opacity-50 min-h-[48px] py-3 px-6 w-full sm:w-auto flex items-center justify-center font-bold tracking-wide"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ask AI"}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-[var(--memphis-red)] text-[12px] sm:text-[13px] font-medium font-body">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 sm:p-5 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-none text-[var(--text-secondary)] text-[13px] sm:text-[14px] leading-relaxed font-mono italic ai-streaming break-words w-full overflow-hidden">
          {response}
        </div>
      )}
    </div>
  );
};
