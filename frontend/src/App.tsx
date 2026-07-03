import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Terminal,
  Database,
  Cpu,
  Trash,
  Folder,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Clock,
  LogOut
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  toolTriggered?: string;
  isCli?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  snippet: string;
  messages: Message[];
}

export default function App() {
  const [userToken, setUserToken] = useState<string | null>(() => localStorage.getItem("onboarding_token"));
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem("onboarding_email"));
  const [userDisplayName, setUserDisplayName] = useState<string | null>(() => localStorage.getItem("onboarding_username"));
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const userName = userDisplayName || (userEmail ? userEmail.split('@')[0] : "Guest");

  // Navigation & View State
  const [view, setView] = useState<"chat" | "cli">("chat");
  const [activeServer, setActiveServer] = useState<"express" | "fastapi">("fastapi");

  // Chat Interface State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // CLI Monospace Terminal Logs
  const [cliLogs, setCliLogs] = useState<Array<{ type: "user" | "system" | "buddy"; text: string }>>([
    { type: "system", text: "======================================================================" },
    { type: "system", text: "ONBOARDING AGENT TERMINAL v1.0.0 // SECURE LINK ACTIVE" },
    { type: "system", text: "======================================================================" },
    { type: "system", text: "Welcome to the Developer Terminal." },
    { type: "system", text: "Type 'help' to see local developer CLI commands, or write queries directly." },
    { type: "system", text: "----------------------------------------------------------------------" }
  ]);
  const [cliInput, setCliInput] = useState<string>("");

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load chat sessions specific to the logged-in user
  useEffect(() => {
    if (userEmail) {
      const userKey = `onboarding_chat_sessions_${userEmail}`;
      let saved = localStorage.getItem(userKey);
      
      // Migration: If this user has no specific chats yet, check if there are legacy generic chats
      if (!saved) {
        const legacySaved = localStorage.getItem("onboarding_chat_sessions");
        if (legacySaved) {
          saved = legacySaved;
          // Delete the legacy chats so they aren't inherited by the next person who signs up
          localStorage.removeItem("onboarding_chat_sessions");
          // Save them immediately to the new user's specific key
          localStorage.setItem(userKey, legacySaved);
        }
      }

      if (saved) {
        try {
          setChatSessions(JSON.parse(saved));
        } catch (e) {
          setChatSessions([]);
        }
      } else {
        setChatSessions([]);
      }
    } else {
      setChatSessions([]);
    }
  }, [userEmail]);

  useEffect(() => {
    if (messages.length === 0) return;
    
    let activeId = currentSessionId;
    if (!activeId) {
      activeId = Date.now().toString();
      setCurrentSessionId(activeId);
    }
    
    const firstUserMsg = messages.find(m => m.role === 'user');
    const titleText = firstUserMsg ? firstUserMsg.text : "New Chat";
    const title = titleText.length > 25 ? titleText.substring(0, 25) + "..." : titleText;
    
    const lastMsgText = messages[messages.length - 1].text;
    const snippet = lastMsgText.length > 40 ? lastMsgText.substring(0, 40) + "..." : lastMsgText;
    
    setChatSessions(prev => {
      const existingIdx = prev.findIndex(s => s.id === activeId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], messages, snippet };
        return updated;
      }
      return [{ id: activeId!, title, snippet, messages }, ...prev];
    });
  }, [messages, currentSessionId]);

  // Persist chat sessions to local storage
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(`onboarding_chat_sessions_${userEmail}`, JSON.stringify(chatSessions));
    }
  }, [chatSessions, userEmail]);

  // Refs for auto-scroll mechanics
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const cliEndRef = useRef<HTMLDivElement | null>(null);

  // Auto Scroll Effects
  useEffect(() => {
    if (view === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, view]);

  useEffect(() => {
    if (view === "cli") {
      cliEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [cliLogs, view]);

  // Handle Authentication submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!authEmail.trim() || !authPassword.trim() || (authMode === "signup" && !authUsername.trim())) {
      setAuthError("Please fill out all fields.");
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const savedUsersJson = localStorage.getItem("onboarding_users") || "[]";
      let savedUsers = JSON.parse(savedUsersJson);
      let matchedUser = null;
      
      if (authMode === "signup") {
        const existing = savedUsers.find((u: any) => u.email === authEmail);
        if (existing) {
          setAuthError("User with this email already exists.");
          return;
        }
        matchedUser = { email: authEmail, password: authPassword, username: authUsername };
        savedUsers.push(matchedUser);
        localStorage.setItem("onboarding_users", JSON.stringify(savedUsers));
      } else {
        matchedUser = savedUsers.find((u: any) => u.email === authEmail && u.password === authPassword);
        if (!matchedUser) {
          setAuthError("Invalid email or password.");
          return;
        }
      }
      
      const mockToken = "mock_token_" + Date.now();
      
      localStorage.setItem("onboarding_token", mockToken);
      localStorage.setItem("onboarding_email", matchedUser.email);
      localStorage.setItem("onboarding_username", matchedUser.username);
      
      setUserToken(mockToken);
      setUserEmail(matchedUser.email);
      setUserDisplayName(matchedUser.username);
      setAuthEmail("");
      setAuthPassword("");
      setAuthUsername("");
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError("Authentication error.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("onboarding_token");
    localStorage.removeItem("onboarding_email");
    localStorage.removeItem("onboarding_username");
    setUserToken(null);
    setUserEmail(null);
    setUserDisplayName(null);
    setMessages([]);
    setChatSessions([]);
    setCurrentSessionId(null);
    setCliLogs([
      { type: "system", text: "======================================================================" },
      { type: "system", text: "KAGGLER CORP // ONBOARDING AGENT TERMINAL v1.0.0 // SECURE LINK ACTIVE" },
      { type: "system", text: "======================================================================" },
      { type: "system", text: "Welcome to the Developer Terminal." },
      { type: "system", text: "Type 'help' to see local developer CLI commands, or write queries directly." },
      { type: "system", text: "----------------------------------------------------------------------" }
    ]);
  };

  // API caller mapping dynamically based on server selection
  const fetchAgentResponse = async (userMessage: string): Promise<{ response: string; toolTriggered?: string }> => {
    // Determine target URL:
    // "express" queries the relative /api/chat path (serving on port 3000 inside AI Studio proxy)
    // "fastapi" queries the direct local backend http://localhost:8000/api/chat
    const url = activeServer === "express" ? "/api/chat" : "http://localhost:8000/api/chat";

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`;
      }
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleSignOut();
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        response: data.response || "No reply from onboarding agent.",
        toolTriggered: data.toolTriggered || data.tool_triggered
      };
    } catch (err: any) {
      console.error("Fetch failure:", err);
      return {
        response: `⚠️ **[API Connection Failure]**\n\nCould not reach the onboarding server at \`${url}\`.\n\n` +
          `*Error details: ${err.message || err}*`,
        toolTriggered: "none"
      };
    }
  };

  // Chat Submission Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    // Append user bubble
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Call API
    const result = await fetchAgentResponse(query);

    // Append assistant bubble
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: result.response,
        timestamp: new Date(),
        toolTriggered: result.toolTriggered
      }
    ]);
    setIsLoading(false);
  };

  // CLI Command Submission Handler
  const handleCliCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim();
    if (!cmd) return;

    // Log the user typed command
    setCliLogs(prev => [...prev, { type: "user", text: cmd }]);
    setCliInput("");
    setIsLoading(true);

    const lowerCmd = cmd.toLowerCase();

    // 1. Process local static terminal commands immediately
    if (lowerCmd === "clear") {
      setCliLogs([]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === "help") {
      setCliLogs(prev => [
        ...prev,
        { type: "system", text: "======================================================================" },
        { type: "system", text: "MAPPED AGENT CLI ENDPOINTS:" },
        { type: "system", text: "  help              - Display this helper blueprint" },
        { type: "system", text: "  clear             - Clear previous logs on the terminal" },
        { type: "system", text: "  search <policy>   - Trigger local RAG lookup on all documents" },
        { type: "system", text: "  files             - Connect to File Manager and list company guidelines" },
        { type: "system", text: "  cat <filename>    - View specific file content in the terminal" },
        { type: "system", text: "  external          - Connect to free billing external sources" },
        { type: "system", text: "  drive             - Connect to external Drive / GitHub API" },
        { type: "system", text: "  update <step>     - Log progress milestone completion to Postgres" },
        { type: "system", text: "  [any other text]  - Forward text directly to Onboarding Buddy reasoning loop" },
        { type: "system", text: "======================================================================" }
      ]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === "files" || lowerCmd === "filemanager") {
      try {
        const baseUrl = activeServer === "express" ? "" : "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/files`, {
          headers: { "Authorization": `Bearer ${userToken}` }
        });
        const data = await res.json();
        let logText = "=== COMPANY FILE MANAGER (mock_company_data) ===\n";
        if (data.length === 0) {
          logText += "No files found.";
        } else {
          data.forEach((f: any) => {
            logText += `📄 File: ${f.filename} (${f.size})\n    Desc: ${f.description}\n\n`;
          });
          logText += "Tip: Type 'cat <filename>' to view file contents inside this terminal.";
        }
        setCliLogs(prev => [...prev, { type: "system", text: logText }]);
      } catch (err) {
        setCliLogs(prev => [...prev, { type: "system", text: "Error: Could not retrieve file manager list." }]);
      }
      setIsLoading(false);
      return;
    }

    if (lowerCmd.startsWith("cat ")) {
      const filename = cmd.slice(4).trim();
      try {
        const baseUrl = activeServer === "express" ? "" : "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/files/${filename}`, {
          headers: { "Authorization": `Bearer ${userToken}` }
        });
        const data = await res.json();
        if (data.error) {
          setCliLogs(prev => [...prev, { type: "system", text: `Error: ${data.error}` }]);
        } else {
          setCliLogs(prev => [
            ...prev,
            { type: "system", text: `=== FILE CONTENT: ${filename} ===\n\n${data.content}` }
          ]);
        }
      } catch (err) {
        setCliLogs(prev => [...prev, { type: "system", text: `Error reading file '${filename}'.` }]);
      }
      setIsLoading(false);
      return;
    }

    if (lowerCmd === "external") {
      try {
        const baseUrl = activeServer === "express" ? "" : "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/external-sources`, {
          headers: { "Authorization": `Bearer ${userToken}` }
        });
        const data = await res.json();
        let logText = `=== FREE EXTERNAL CONNECTIONS (Status: ${data.status.toUpperCase()}) ===\n`;
        logText += `Billing Class: ${data.billingType}\n\n`;
        data.sources.forEach((s: any) => {
          logText += `🔗 Source: ${s.name}\n   URL: ${s.url}\n   Cost: ${s.cost}\n   Desc: ${s.description}\n\n`;
        });
        setCliLogs(prev => [...prev, { type: "system", text: logText }]);
      } catch (err) {
        setCliLogs(prev => [...prev, { type: "system", text: "Error connecting to external directory lookup." }]);
      }
      setIsLoading(false);
      return;
    }

    // 2. Synthesize agent query based on CLI syntax shortcuts
    let apiQuery = cmd;
    if (lowerCmd.startsWith("search ")) {
      apiQuery = `Please search the company policy for: ${cmd.slice(7)}`;
    } else if (lowerCmd === "drive") {
      apiQuery = "Please check the external drive / fetch external drive files.";
    } else if (lowerCmd.startsWith("update ")) {
      apiQuery = `I have completed the milestone step: ${cmd.slice(7)}. Please update my onboarding progress.`;
    }

    // Connect to server
    const result = await fetchAgentResponse(apiQuery);

    // Format output with cyber-caps indicator
    let logOutput = result.response;
    if (result.toolTriggered && result.toolTriggered !== "none") {
      logOutput = `[SYSTEM TOOL EVENT: ${result.toolTriggered.toUpperCase()}]\n\n${logOutput}`;
    }

    setCliLogs(prev => [...prev, { type: "buddy", text: logOutput }]);
    setIsLoading(false);
  };

  const handleLoadSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  // Filter history based on search query
  const filteredHistory = chatSessions.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Suggestions from the Elegant Dark mock design
  const suggestions = [
    {
      text: "Summarize the remote work policy & office hours for new hires",
      query: "Please search the company policy for office hours and cafeteria lunch hours."
    },
    {
      text: "Check my onboarding progress milestone in the PostgreSQL database",
      query: "Please search the company policy for mandatory onboarding milestones and steps."
    }
  ];

  const handleSuggestionClick = async (queryText: string) => {
    if (isLoading) return;
    setInput("");
    
    // Append user bubble
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Call API
    const result = await fetchAgentResponse(queryText);

    // Append assistant bubble
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: result.response,
        timestamp: new Date(),
        toolTriggered: result.toolTriggered
      }
    ]);
    setIsLoading(false);
  };

  // -----------------------------------------------------------------
  // Inline Styles (Strictly conforming to "no external CSS libraries")
  // -----------------------------------------------------------------
  const styles = {
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

  if (showSplash) {
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
  }

  return (
    <div style={styles.container}>
      {/* Auth Modal overlay */}
      {showAuthModal && (
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
                  textAlign: "center"
                }}
              >
                {authMode === "signin" ? "Sign In" : "Register Account"}
              </button>
              
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
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
      )}

      {/* 1. LEFT SIDEBAR (Available in Chat companion mode) */}
      {view === "chat" && (
        <aside style={styles.sidebar}>
          <div>
            {/* New Chat pill */}
            <button
              onClick={() => { setMessages([]); setCurrentSessionId(null); }}
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
                        backgroundColor: currentSessionId === item.id ? "rgba(255,255,255,0.05)" : "transparent"
                      }}
                      title={item.snippet}
                    >
                      <MessageSquare size={14} style={{ flexShrink: 0, color: "#8e918f" }} />
                      {item.title}
                    </button>
                  ))}
                  {filteredHistory.length === 0 && (
                    <div style={{ fontSize: "12px", color: "#8e918f", padding: "8px" }}>
                      No matches found.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ fontSize: "13px", color: "#8e918f", padding: "24px 16px", textAlign: "center", fontStyle: "italic", lineHeight: "1.5" }}>
                Recent chats are only available to signed-in users.
              </div>
            )}
          </div>

          {/* Dev CLI Navigation Button inside sidebar */}
          <button
            onClick={() => setView("cli")}
            style={styles.cliToggleBtn}
          >
            <Terminal size={14} />
            RUN DEV CLI TERMINAL
          </button>
        </aside>
      )}

      {/* 2. MAIN APPLICATION CONTENT */}
      <main style={styles.mainPanel}>
        {/* HEADER AREA */}
        <header style={styles.header}>
          <div style={styles.headerTitle}>
            <Cpu size={20} style={{ color: view === "cli" ? "#39ff14" : "#4285f4" }} />
            <span>Autonomous Onboarding Buddy</span>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* Active Server Configuration Control Panel */}
            <div style={styles.serverControl}>
              <Database size={12} style={{ color: "#8e918f" }} />
              <span>Host: </span>
              <strong style={{ color: activeServer === "express" ? "#4285f4" : "#39ff14" }}>
                {activeServer === "express" ? "Express (Port 3000)" : "FastAPI (Port 8000)"}
              </strong>
              <button
                onClick={() => setActiveServer(prev => prev === "express" ? "fastapi" : "express")}
                style={styles.serverToggle}
                title="Toggle between sandbox Express endpoint and local FastAPI"
              >
                Toggle Host
              </button>
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
                  cursor: "pointer"
                }}
              >
                <MessageSquare size={14} />
                Switch to Chat UI
              </button>
            )}

            {/* Auth/Sign Out Buttons */}
            {!userToken ? (
              <button
                onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }}
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
                  boxShadow: "0 2px 8px rgba(66, 133, 244, 0.3)"
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
                  cursor: "pointer"
                }}
                title="Sign out of your onboarding session"
              >
                <LogOut size={14} style={{ color: "#d96570" }} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </header>

        {/* 2A. CHAT CLONE INTERFACE */}
        {view === "chat" ? (
          <>
            <div style={styles.chatBody}>
              {messages.length === 0 ? (
                <div style={styles.emptyGreetingContainer}>
                  <h1 style={styles.gradientGreeting}>Hi {userName}, what's on your mind?</h1>
                  
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
                            {idx === 0 ? <HelpCircle size={16} /> : <Database size={16} />}
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
                  <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
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
                    opacity: !input.trim() || isLoading ? 0.4 : 1
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
        ) : (
          /* 2B. MONOSPACE HACKER TERMINAL CLI */
          <div style={styles.terminalContainer}>
            <div style={styles.terminalHeader}>
              <div style={styles.terminalTitle}>
                <Terminal size={16} />
                <span>KAGGLER-OS TERMINAL SHELL // ACTIVE_SESSION</span>
              </div>
              <div style={{ color: "#39ff14", fontSize: "11px", opacity: 0.8 }}>
                <Clock size={11} style={{ display: "inline", marginRight: "4px" }} />
                {userName.toUpperCase()} // UTC_LINKED
              </div>
            </div>

            {/* Scrollable CLI Logs */}
            <div style={styles.terminalLogs}>
              {cliLogs.map((log, i) => (
                <div
                  key={i}
                  style={
                    log.type === "system"
                      ? styles.terminalLineSystem
                      : log.type === "user"
                      ? styles.terminalLineUser
                      : styles.terminalLineBuddy
                  }
                >
                  {log.type === "user" ? `Fresher > ${log.text}` : log.text}
                </div>
              ))}

              {/* Monospace Scanning state */}
              {isLoading && (
                <div style={{ color: "#39ff14", animation: "pulse 1.5s infinite" }}>
                  &gt; SCANNING SECURE PAYLOADS / RESOLVING AGENT INTELLIGENCE...
                </div>
              )}
              <div ref={cliEndRef} />
            </div>

            {/* CLI bottom inline entry block */}
            <form onSubmit={handleCliCommand} style={styles.terminalInputRow}>
              <span style={styles.terminalLabel}>Fresher &gt;</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                disabled={isLoading}
                autoFocus
                style={styles.terminalInput}
                placeholder="type help, search, update, or ask anything..."
              />
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
