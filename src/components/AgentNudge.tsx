"use client";

import { useState } from "react";
import { sendMessageToAgent } from "@/lib/api/agent-client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
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
    <div className="w-full max-w-lg mx-auto p-4 glass-card shadow-none">
      <div className="flex items-center gap-2 mb-4 text-[var(--accent-primary)]">
        <Sparkles className="w-5 h-5" />
        <h3 className="font-semibold font-display">VibeShift AI</h3>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Schedule my React task for tomorrow..."
          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-none px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] focus:shadow-none transition-all font-body text-[13px]"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading || !prompt.trim()}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ask AI"}
        </button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[var(--color-danger)] text-[12px] font-medium font-body">
          {error}
        </motion.div>
      )}

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-none text-[var(--text-secondary)] text-[13px] leading-relaxed font-mono italic ai-streaming"
        >
          {response}
        </motion.div>
      )}
    </div>
  );
};
