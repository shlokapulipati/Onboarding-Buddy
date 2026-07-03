import React from "react";
import { Cpu } from "lucide-react";

interface SplashProps {
  showSplash: boolean;
}

export const Splash: React.FC<SplashProps> = ({ showSplash }) => {
  if (!showSplash) return null;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#131314",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      color: "#e3e3e3",
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1c",
        border: "1px solid #333537",
        borderRadius: "50%",
        width: "80px",
        height: "80px",
        color: "#4285f4",
        marginBottom: "24px",
        boxShadow: "0 0 40px rgba(66, 133, 244, 0.4)",
        animation: "pulse 2s infinite"
      }}>
        <Cpu size={40} />
      </div>
      <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
        Onboarding Buddy
      </h1>
      <p style={{ fontSize: "16px", color: "#8e918f" }}>
        Initializing Agent...
      </p>
    </div>
  );
};
