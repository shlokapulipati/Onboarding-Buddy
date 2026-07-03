import React, { useState } from "react";
import { Cpu, AlertCircle } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

interface AuthModalProps {
  showModal: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ showModal, onClose }) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authError, setAuthError] = useState("");

  if (!showModal) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!authEmail.trim() || !authPassword.trim() || (authMode === "signup" && !authUsername.trim())) {
      setAuthError("Please fill out all fields.");
      return;
    }
    
    try {
      if (authMode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(userCredential.user, { displayName: authUsername });
        // The onAuthStateChanged listener will handle setting the state globally
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
      
      setAuthEmail("");
      setAuthPassword("");
      setAuthUsername("");
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMsg = "Authentication failed. Please try again.";
      if (err.code === "auth/email-already-in-use") errorMsg = "Email is already registered.";
      if (err.code === "auth/invalid-credential") errorMsg = "Invalid email or password.";
      if (err.code === "auth/weak-password") errorMsg = "Password should be at least 6 characters.";
      setAuthError(errorMsg);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "#1e1f20",
        border: "1px solid #333537",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1a1c",
            border: "1px solid #333537",
            borderRadius: "50%",
            width: "56px",
            height: "56px",
            color: "#4285f4",
            marginBottom: "16px"
          }}>
            <Cpu size={28} />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
            Onboarding Buddy
          </h1>
          <p style={{ fontSize: "14px", color: "#8e918f" }}>
            Autonomous Developer Agent Login
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {authError && (
            <div style={{
              backgroundColor: "rgba(217, 101, 112, 0.1)",
              border: "1px solid #d96570",
              color: "#d96570",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {authMode === "signup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", color: "#c4c7c5", fontWeight: 500 }}>Username</label>
              <input
                type="text"
                placeholder="developer_name"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                required
                style={{
                  backgroundColor: "#131314",
                  border: "1px solid #333537",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#ffffff",
                  outline: "none"
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#c4c7c5", fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              placeholder="developer@company.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
              style={{
                backgroundColor: "#131314",
                border: "1px solid #333537",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "14px",
                color: "#ffffff",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#c4c7c5", fontWeight: 500 }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
              style={{
                backgroundColor: "#131314",
                border: "1px solid #333537",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "14px",
                color: "#ffffff",
                outline: "none"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!authEmail || !authPassword || (authMode === "signup" && !authUsername)}
            style={{
              backgroundImage: "linear-gradient(to right, #4285f4, #9b72cb)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "8px",
              textAlign: "center",
              opacity: (!authEmail || !authPassword || (authMode === "signup" && !authUsername)) ? 0.5 : 1
            }}
          >
            {authMode === "signin" ? "Sign In" : "Register Account"}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              color: "#8e918f",
              border: "1px solid #333537",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "14px",
              cursor: "pointer",
              marginTop: "4px"
            }}
          >
            Cancel
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px" }}>
          <span style={{ color: "#8e918f" }}>
            {authMode === "signin" ? "New here?" : "Already have an account?"}
          </span>{" "}
          <button
            onClick={() => {
              setAuthMode(prev => prev === "signin" ? "signup" : "signin");
              setAuthError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#4285f4",
              fontWeight: 500,
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline"
            }}
          >
            {authMode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};
