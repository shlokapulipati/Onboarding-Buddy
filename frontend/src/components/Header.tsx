import React from "react";
import { Cpu, Database, MessageSquare, Plus, LogOut } from "lucide-react";
import { styles } from "./styles";

interface HeaderProps {
  view: "chat" | "cli";
  setView: React.Dispatch<React.SetStateAction<"chat" | "cli">>;
  userToken: string | null;
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  setView,
  userToken,
  setShowAuthModal,
  handleSignOut,
}) => {
  return (
    <header style={styles.header}>
      <div style={styles.headerTitle}>
        <Cpu
          size={20}
          style={{ color: view === "cli" ? "#39ff14" : "#4285f4" }}
        />
        <span>Autonomous Onboarding Buddy</span>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Active Server Configuration Control Panel */}
        <div style={styles.serverControl}>
          <Database size={12} style={{ color: "#8e918f" }} />
          <span>Host: </span>
          <strong style={{ color: "#39ff14" }}>FastAPI</strong>
        </div>

        {/* Toggle button when in CLI mode */}
        {view === "cli" && (
          <button
            onClick={() => setView("chat")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#4285f4",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <MessageSquare size={14} />
            Switch to Chat UI
          </button>
        )}

        {/* Auth/Sign Out Buttons */}
        {!userToken ? (
          <button
            onClick={() => {
              setShowAuthModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#4285f4",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "6px 16px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(66, 133, 244, 0.3)",
            }}
            title="Sign up for better features"
          >
            <Plus size={14} />
            <span>Sign Up for Better Features</span>
          </button>
        ) : (
          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#1e1f20",
              color: "#e3e3e3",
              border: "1px solid #333537",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            title="Sign out of your onboarding session"
          >
            <LogOut size={14} style={{ color: "#d96570" }} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
