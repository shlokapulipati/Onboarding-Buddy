export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  toolTriggered?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  snippet: string;
  messages: Message[];
}
