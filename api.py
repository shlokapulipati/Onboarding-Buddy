import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

# Import your working skill!
from skills_dir.company_search import search_handbook

# Load .env file manually if it exists
if os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            if line.strip() and not line.startswith("#"):
                key, val = line.strip().split("=", 1)
                os.environ[key] = val.strip('"\'')

# Check for API Key
if "GEMINI_API_KEY" not in os.environ:
    print("[!] Error: GEMINI_API_KEY is missing.")
    sys.exit(1)

# Initialize FastAPI app
app = FastAPI()

# Allow React to talk to this API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your local React app to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI
client = genai.Client()
system_instruction = (
    "You are 'Buddy', an AI Onboarding Assistant for freshers. "
    "You MUST use the 'search_handbook' tool to find answers about company policies. "
    "You are allowed to answer basic, general questions that are not in the mock data directly using your own knowledge. "
    "However, if a question is difficult, complex, or requires sensitive company-specific information not found in the handbook, you must tell the fresher to contact HR."
)
config = types.GenerateContentConfig(
    system_instruction=system_instruction,
    temperature=0.2,
    tools=[search_handbook]
)

# Start a global chat session to remember conversation history
chat = client.chats.create(model="gemini-2.5-flash", config=config)

# Define what the incoming data from React looks like
class ChatRequest(BaseModel):
    message: str

# Create the endpoint that React will call
@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    try:
        response = chat.send_message(request.message)
        # Attempt to extract toolTriggered if Gemini used a tool
        tool_triggered = "none"
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    tool_triggered = part.function_call.name
        
        return {"response": response.text, "toolTriggered": tool_triggered}
    except Exception as e:
        return {"response": f"Sorry, I encountered a system error: {str(e)}", "toolTriggered": "none"}

# Endpoint for External Sources (MCP)
@app.get("/api/external-sources")
def get_external_sources():
    return {
        "status": "active",
        "billingType": "Enterprise Subscription",
        "sources": [
            {
                "name": "Model Context Protocol (MCP)",
                "url": "mcp://local",
                "cost": "$0.00 / query",
                "description": "Universal secure tool connector for AI capabilities."
            },
            {
                "name": "Kaggler HR Sync",
                "url": "https://api.hr.internal",
                "cost": "$0.02 / query",
                "description": "Company-wide internal directory access."
            }
        ]
    }