export const styles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: "#e3e3e3",
      backgroundColor: "#131314",
      overflow: "hidden"
    },
    // Sidebar Style
    sidebar: {
      width: "288px",
      backgroundColor: "#1e1f20",
      borderRight: "1px solid #333537",
      display: "flex",
      flexDirection: "column" as const,
      padding: "16px",
      justifyContent: "space-between"
    },
    newChatBtn: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: "#1a1a1c",
      color: "#e3e3e3",
      border: "1px solid #333537",
      borderRadius: "9999px",
      padding: "12px 18px",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "background-color 0.2s, border-color 0.2s",
      width: "100%",
      marginBottom: "24px"
    },
    searchContainer: {
      position: "relative" as const,
      marginBottom: "24px"
    },
    searchInput: {
      width: "100%",
      boxSizing: "border-box" as const,
      backgroundColor: "#131314",
      border: "1px solid #333537",
      borderRadius: "8px",
      padding: "10px 12px 10px 38px",
      color: "#e3e3e3",
      fontSize: "13px",
      outline: "none"
    },
    searchIcon: {
      position: "absolute" as const,
      left: "12px",
      top: "12px",
      color: "#8e918f"
    },
    recentHeader: {
      fontSize: "11px",
      fontWeight: 600,
      color: "#8e918f",
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      marginBottom: "12px",
      paddingLeft: "4px"
    },
    recentList: {
      flex: 1,
      overflowY: "auto" as const,
      display: "flex",
      flexDirection: "column" as const,
      gap: "4px",
      paddingRight: "4px"
    },
    recentItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      backgroundColor: "transparent",
      border: "none",
      textAlign: "left" as const,
      color: "#c4c7c5",
      fontSize: "13px",
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
      transition: "background-color 0.2s"
    },
    cliToggleBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      color: "#00ff41",
      border: "1px solid #00ff41",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "12px",
      fontWeight: 600,
      fontFamily: "monospace",
      cursor: "pointer",
      width: "100%",
      marginTop: "16px",
      textShadow: "0 0 4px rgba(0, 255, 65, 0.4)",
      transition: "background-color 0.2s"
    },

    // Main Panel Style
    mainPanel: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      backgroundColor: "#131314"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 24px",
      borderBottom: "1px solid #333537"
    },
    headerTitle: {
      fontSize: "16px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    serverControl: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#1e1f20",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      border: "1px solid #333537"
    },
    serverToggle: {
      backgroundColor: "#131314",
      color: "#c4c7c5",
      border: "1px solid #333537",
      padding: "4px 8px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: 500
    },
    // Main Chat Body Style
    chatBody: {
      flex: 1,
      overflowY: "auto" as const,
      padding: "32px 24px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "24px"
    },
    emptyGreetingContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      maxWidth: "768px",
      margin: "0 auto",
      width: "100%"
    },
    gradientGreeting: {
      fontSize: "48px",
      fontWeight: 500,
      letterSpacing: "-0.03em",
      backgroundImage: "linear-gradient(to right, #4285f4, #9b72cb, #d96570)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "32px",
      textAlign: "left" as const,
      width: "100%",
      lineHeight: "1.2",
      paddingBottom: "8px"
    },
    suggestionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
      width: "100%",
      marginBottom: "40px"
    },
    suggestionCard: {
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
      borderRadius: "12px",
      backgroundColor: "#1e1f20",
      padding: "20px",
      border: "1px solid transparent",
      cursor: "pointer",
      textAlign: "left" as const,
      transition: "border-color 0.2s, transform 0.1s",
    },
    suggestionText: {
      fontSize: "14px",
      lineHeight: 1.5,
      color: "#c4c7c5"
    },
    suggestionIconContainer: {
      marginTop: "16px",
      display: "flex",
      justifyContent: "flex-end"
    },
    suggestionIconBadge: {
      borderRadius: "50%",
      backgroundColor: "#131314",
      padding: "8px",
      color: "#8e918f"
    },
    bubbleRow: {
      display: "flex",
      width: "100%",
      maxWidth: "768px",
      margin: "0 auto",
      flexDirection: "column" as const
    },
    bubbleUser: {
      alignSelf: "flex-end",
      backgroundColor: "#2c2d2f",
      color: "#e3e3e3",
      borderRadius: "18px 18px 4px 18px",
      padding: "12px 18px",
      maxWidth: "75%",
      fontSize: "14px",
      lineHeight: 1.5,
      boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
    },
    bubbleAssistant: {
      alignSelf: "flex-start",
      backgroundColor: "transparent",
      color: "#e3e3e3",
      padding: "12px 0px",
      maxWidth: "100%",
      fontSize: "15px",
      lineHeight: 1.6,
      display: "flex",
      flexDirection: "column" as const,
      gap: "10px"
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "11px",
      backgroundColor: "#1e1f20",
      color: "#4285f4",
      padding: "4px 10px",
      borderRadius: "6px",
      border: "1px solid #333537",
      alignSelf: "flex-start"
    },
    // Input Bar Area
    inputContainer: {
      padding: "16px 24px 12px 24px",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center"
    },
    inputForm: {
      width: "100%",
      maxWidth: "768px",
      display: "flex",
      alignItems: "center",
      backgroundColor: "#1e1f20",
      border: "1px solid transparent",
      borderRadius: "9999px",
      padding: "6px 12px 6px 24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)"
    },
    mainInput: {
      flex: 1,
      backgroundColor: "transparent",
      border: "none",
      color: "#e3e3e3",
      fontSize: "16px",
      outline: "none",
      padding: "10px 0"
    },
    sendBtn: {
      backgroundColor: "#4285f4",
      border: "none",
      color: "#ffffff",
      cursor: "pointer",
      padding: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      marginLeft: "8px",
      transition: "background-color 0.2s"
    },
    disclaimerText: {
      marginTop: "12px",
      textAlign: "center" as const,
      fontSize: "10px",
      color: "#5f6368"
    },
    loadingText: {
      color: "#8e918f",
      fontSize: "13px",
      fontStyle: "italic",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      alignSelf: "flex-start",
      maxWidth: "768px",
      margin: "0 auto",
      width: "100%"
    },
    // Monospace Terminal UI
    terminalContainer: {
      flex: 1,
      backgroundColor: "#000000",
      fontFamily: "'Courier New', Courier, monospace",
      padding: "20px",
      display: "flex",
      flexDirection: "column" as const,
      border: "1px solid #39ff14",
      margin: "12px",
      borderRadius: "8px",
      boxShadow: "0 0 15px rgba(57, 255, 20, 0.15)",
      overflow: "hidden"
    },
    terminalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #39ff14",
      paddingBottom: "10px",
      marginBottom: "15px"
    },
    terminalTitle: {
      color: "#39ff14",
      fontSize: "14px",
      fontWeight: "bold",
      textShadow: "0 0 5px #39ff14",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    terminalLogs: {
      flex: 1,
      overflowY: "auto" as const,
      display: "flex",
      flexDirection: "column" as const,
      gap: "10px",
      fontSize: "13px",
      lineHeight: 1.4,
      paddingBottom: "12px"
    },
    terminalLineSystem: {
      color: "#39ff14",
      opacity: 0.8,
      whiteSpace: "pre-wrap" as const
    },
    terminalLineUser: {
      color: "#ffffff",
      whiteSpace: "pre-wrap" as const
    },
    terminalLineBuddy: {
      color: "#00ff00",
      backgroundColor: "rgba(0, 255, 0, 0.03)",
      borderLeft: "2px solid #00ff00",
      paddingLeft: "8px",
      whiteSpace: "pre-wrap" as const
    },
    terminalInputRow: {
      display: "flex",
      alignItems: "center",
      borderTop: "1px solid #39ff14",
      paddingTop: "10px",
      gap: "8px"
    },
    terminalLabel: {
      color: "#39ff14",
      fontWeight: "bold",
      fontSize: "14px",
      whiteSpace: "nowrap" as const
    },
    terminalInput: {
      flex: 1,
      backgroundColor: "transparent",
      border: "none",
      color: "#39ff14",
      outline: "none",
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: "14px",
      caretColor: "#39ff14"
    }
  };
