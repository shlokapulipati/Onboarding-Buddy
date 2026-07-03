import React from "react";
import { Plus, Search, MessageSquare, Terminal } from "lucide-react";
import { styles } from "./styles";
import { ChatSession } from "../types";

interface SidebarProps {
  view: "chat" | "cli";
  setView: React.Dispatch<React.SetStateAction<"chat" | "cli">>;
  userToken: string | null;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  setCurrentSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  view,
  setView,
  userToken,
  searchQuery,
  setSearchQuery,
  chatSessions,
  currentSessionId,
  setCurrentSessionId,
  setMessages,
}) => {
  if (view !== "chat") return null;

  const handleLoadSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  const filteredHistory = chatSessions.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside style={styles.sidebar}>
      <div>
        {/* New Chat pill */}
        <button
          onClick={() => {
            setMessages([]);
            setCurrentSessionId(null);
          }}
          style={styles.newChatBtn}
          title="Clear active chat messages"
        >
          <Plus size={18} style={{ color: "#4285f4" }} />
          New Chat
        </button>

        {/* Filter Search */}
        <div style={styles.searchContainer}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Scrollable history items */}
        {userToken ? (
          <>
            <div style={styles.recentHeader}>Recent</div>
            <div style={styles.recentList}>
              {filteredHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLoadSession(item.id)}
                  style={{
                    ...styles.recentItem,
                    backgroundColor:
                      currentSessionId === item.id
                        ? "rgba(255,255,255,0.05)"
                        : "transparent",
                  }}
                  title={item.snippet}
                >
                  <MessageSquare
                    size={14}
                    style={{ flexShrink: 0, color: "#8e918f" }}
                  />
                  {item.title}
                </button>
              ))}
              {filteredHistory.length === 0 && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8e918f",
                    padding: "8px",
                  }}
                >
                  No matches found.
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: "13px",
              color: "#8e918f",
              padding: "24px 16px",
              textAlign: "center",
              fontStyle: "italic",
              lineHeight: "1.5",
            }}
          >
            Recent chats are only available to signed-in users.
          </div>
        )}
      </div>

      {/* Dev CLI Navigation Button inside sidebar */}
      <button onClick={() => setView("cli")} style={styles.cliToggleBtn}>
        <Terminal size={14} />
        RUN DEV CLI TERMINAL
      </button>
    </aside>
  );
};
