import React from "react";
import { Terminal, Clock } from "lucide-react";
import { styles } from "./styles";

interface TerminalCliProps {
  userName: string;
  cliLogs: Array<{ type: "user" | "system" | "buddy"; text: string }>;
  isLoading: boolean;
  cliEndRef: React.MutableRefObject<HTMLDivElement | null>;
  cliInput: string;
  setCliInput: React.Dispatch<React.SetStateAction<string>>;
  handleCliCommand: (e: React.FormEvent) => void;
}

export const TerminalCli: React.FC<TerminalCliProps> = ({
  userName,
  cliLogs,
  isLoading,
  cliEndRef,
  cliInput,
  setCliInput,
  handleCliCommand,
}) => {
  return (
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
  );
};
