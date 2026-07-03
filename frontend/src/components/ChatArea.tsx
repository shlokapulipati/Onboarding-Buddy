import React from "react";
import { HelpCircle, Database, Cpu, RefreshCw, Send } from "lucide-react";
import { styles } from "./styles";
import { Message } from "../types";

interface ChatAreaProps {
  messages: Message[];
  userName: string;
  suggestions: { text: string; query: string }[];
  handleSuggestionClick: (query: string) => void;
  isLoading: boolean;
  chatEndRef: React.MutableRefObject<HTMLDivElement | null>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e?: React.FormEvent) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  userName,
  suggestions,
  handleSuggestionClick,
  isLoading,
  chatEndRef,
  input,
  setInput,
  handleSendMessage,
}) => {
  return (
    <>
      <div style={styles.chatBody}>
        {messages.length === 0 ? (
          <div style={styles.emptyGreetingContainer}>
            <h1 style={styles.gradientGreeting}>
              Hi {userName}, what's on your mind?
            </h1>

            {/* Interactive suggestion cards */}
            <div style={styles.suggestionsGrid}>
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(sug.query)}
                  style={styles.suggestionCard}
                  title="Click to run this query automatically"
                >
                  <p style={styles.suggestionText}>{sug.text}</p>
                  <div style={styles.suggestionIconContainer}>
                    <div style={styles.suggestionIconBadge}>
                      {idx === 0 ? (
                        <HelpCircle size={16} />
                      ) : (
                        <Database size={16} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={styles.bubbleRow}>
              {msg.role === "user" ? (
                <div style={styles.bubbleUser}>{msg.text}</div>
              ) : (
                <div style={styles.bubbleAssistant}>
                  {/* Bullet indicators for RAG triggered tools */}
                  {msg.toolTriggered && msg.toolTriggered !== "none" && (
                    <span style={styles.badge}>
                      <Cpu size={12} /> Tool Active: {msg.toolTriggered}
                    </span>
                  )}
                  <div style={{ whiteSpace: "pre-wrap", color: "#e3e3e3" }}>
                    {/* We replace simple markdown bullet syntax manually to maintain beautiful formatting */}
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Chat loading state */}
        {isLoading && (
          <div style={styles.loadingText}>
            <RefreshCw
              size={14}
              style={{ animation: "spin 1s linear infinite" }}
            />
            Buddy is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Rounded Chat Input panel */}
      <div style={styles.inputContainer}>
        <form onSubmit={handleSendMessage} style={styles.inputForm}>
          <input
            type="text"
            placeholder="Ask Onboarding Buddy..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={styles.mainInput}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              ...styles.sendBtn,
              opacity: !input.trim() || isLoading ? 0.4 : 1,
            }}
          >
            <Send size={18} />
          </button>
        </form>
        <p style={styles.disclaimerText}>
          Gemini for Onboarding Buddy can display inaccurate info. Check the Secure Company Drive for confirmation.
        </p>
      </div>
    </>
  );
};
