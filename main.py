import os
import sys
# pyrefly: ignore [missing-import]
from google import genai
from google.genai import types

# Import the skill we created
from skills_dir.company_search import search_handbook

def main():
    # 1. Check for the API Key
    if "GEMINI_API_KEY" not in os.environ:
        print("[!] Error: GEMINI_API_KEY is missing.")
        print("Set it in your terminal: export GEMINI_API_KEY='YOUR_API_KEY'")
        sys.exit(1)

    # 2. Initialize the AI Client
    client = genai.Client()

    # 3. Define the Agent's Persona
    system_instruction = (
        "You are 'Buddy', an AI Onboarding Assistant for freshers. "
        "You MUST use the 'search_handbook' tool to find answers about company policies. "
        "Be welcoming, clear, and professional. If the tool doesn't have the answer, tell them to ask HR."
    )
    # 4. Equip the Agent with the Skill
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.2,
        tools=[search_handbook] # This tells Gemini it can use your Python function!
    )

    # 5. Start the CLI Loop
    print("\n" + "="*50)
    print(" 🚀 Welcome to the Autonomous Onboarding CLI ")
    print("="*50)
    print("Type your question below, or type 'exit' to quit.\n")
    chat = client.chats.create(model="gemini-2.5-flash", config=config)

    while True:
        try:
            # Get user input
            user_input = input("\033[1;36mFresher > \033[0m").strip()
            
            if user_input.lower() in ["exit", "quit"]:
                print("\nGoodbye! Good luck with your onboarding.")
                break
            if not user_input:
                continue

            # Send to the Agent
            response = chat.send_message(user_input)
            
            # Print the Agent's response
            print(f"\n\033[1;32mBuddy (Agent) > \033[0m{response.text}\n")
            print("-" * 50)

        except KeyboardInterrupt:
            print("\nSession ended.")
            break
            
        # 🌟 NEW: Catch temporary server overloads or rate limits gracefully
        except Exception as e:
            error_str = str(e)
            if "503" in error_str or "UNAVAILABLE" in error_str:
                print("\n\033[1;31mBuddy (Agent) > \033[0m[System Note: The server is experiencing high traffic. Retrying in a second...]")
                import time
                time.sleep(2)
                try:
                    # Retry once automatically
                    response = chat.send_message(user_input)
                    print(f"\n\033[1;32mBuddy (Agent) > \033[0m{response.text}\n")
                    print("-" * 50)
                except Exception:
                    print("\n\033[1;31mBuddy (Agent) > \033[0mI'm experiencing a high load right now. Please ask your question once more!")
                    print("-" * 50)
            else:
                print(f"\n[!] An error occurred: {e}\n")

if __name__ == "__main__":
    main()