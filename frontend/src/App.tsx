import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { Message, ChatSession } from "./types";
import { Splash } from "./components/Splash";
import { AuthModal } from "./components/AuthModal";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ChatArea } from "./components/ChatArea";
import { TerminalCli } from "./components/TerminalCli";
import { styles } from "./components/styles";

export default function App() {
  // Initialization State
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Authentication State
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserToken(user.uid);
        setUserEmail(user.email);
        setUserDisplayName(user.displayName);
      } else {
        setUserToken(null);
        setUserEmail(null);
        setUserDisplayName(null);
        setChatSessions([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const userName = userDisplayName || (userEmail ? userEmail.split('@')[0] : "Guest");

  // Navigation & View State
  const [view, setView] = useState<"chat" | "cli">("chat");

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
  ]);
  const [cliInput, setCliInput] = useState<string>("");

  // History & Session State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load chat sessions specific to the logged-in user from Firestore
  useEffect(() => {
    async function loadChats() {
      if (userEmail) {
        try {
          const docRef = doc(db, "chatSessions", userEmail);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setChatSessions(docSnap.data().sessions || []);
          } else {
            // Migration: check local storage just in case
            const userKey = `onboarding_chat_sessions_${userEmail}`;
            let saved = localStorage.getItem(userKey);
            if (!saved) saved = localStorage.getItem("onboarding_chat_sessions");
            
            if (saved) {
              const parsed = JSON.parse(saved);
              setChatSessions(parsed);
              // Save to Firestore
              await setDoc(docRef, { sessions: parsed });
              localStorage.removeItem("onboarding_chat_sessions");
              localStorage.removeItem(userKey);
            } else {
              setChatSessions([]);
            }
          }
        } catch (e) {
          console.error("Error loading chats:", e);
        }
      } else {
        setChatSessions([]);
      }
    }
    loadChats();
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
      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], messages, snippet };
      } else {
        updated = [{ id: activeId!, title, snippet, messages }, ...prev];
      }
      
      // Save synchronously to Firestore
      if (userEmail) {
        setDoc(doc(db, "chatSessions", userEmail), { sessions: updated }).catch(console.error);
      }
      
      return updated;
    });
  }, [messages, currentSessionId]);

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // API caller mapping dynamically based on server selection
  const fetchAgentResponse = async (userMessage: string): Promise<{ response: string; toolTriggered?: string }> => {
    // queries the direct local backend http://localhost:8000/api/chat
    const url = "http://localhost:8000/api/chat";

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
        const baseUrl = "http://localhost:8000";
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
        const baseUrl = "http://localhost:8000";
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
        const baseUrl = "http://localhost:8000";
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

  if (showSplash) {
    return <Splash showSplash={showSplash} />;
  }

  return (
    <div style={styles.container}>
      {/* Auth Modal overlay */}
      <AuthModal
        showModal={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* 1. LEFT SIDEBAR (Available in Chat companion mode) */}
      <Sidebar
        view={view}
        setView={setView}
        userToken={userToken}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        setMessages={setMessages}
      />

      {/* 2. MAIN APPLICATION CONTENT */}
      <main style={styles.mainPanel}>
        {/* HEADER AREA */}
        <Header
          view={view}
          setView={setView}
          userToken={userToken}
          setShowAuthModal={setShowAuthModal}
          handleSignOut={handleSignOut}
        />

        {/* 2A. CHAT CLONE INTERFACE */}
        {view === "chat" ? (
          <ChatArea
            messages={messages}
            userName={userName}
            suggestions={suggestions}
            handleSuggestionClick={handleSuggestionClick}
            isLoading={isLoading}
            chatEndRef={chatEndRef}
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
          />
        ) : (
          /* 2B. MONOSPACE HACKER TERMINAL CLI */
          <TerminalCli
            userName={userName}
            cliLogs={cliLogs}
            isLoading={isLoading}
            cliEndRef={cliEndRef}
            cliInput={cliInput}
            setCliInput={setCliInput}
            handleCliCommand={handleCliCommand}
          />
        )}
      </main>
    </div>
  );
}
