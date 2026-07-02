import os

def search_handbook(query: str) -> str:
    """
    Searches the company onboarding handbook and all related documentation for information.
    """
    data_dir = "mock-company-data"
    
    print(f"\n\033[1;33m[🔧 DEBUG] Agent called the tool! Searching in: {os.path.abspath(data_dir)}\033[0m")
    
    if not os.path.exists(data_dir):
        return "Error: Could not locate the company data directory."
        
    all_content = ""
    try:
        for filename in os.listdir(data_dir):
            file_path = os.path.join(data_dir, filename)
            if os.path.isfile(file_path):
                with open(file_path, "r", encoding="utf-8") as file:
                    all_content += f"\n--- Document: {filename} ---\n"
                    all_content += file.read()
                    
        print(f"\033[1;32m[🔧 DEBUG] SUCCESS: Read {len(all_content)} characters across multiple files.\033[0m")
        return f"Company Documentation Content:\n{all_content}"
    except Exception as e:
        print(f"\033[1;31m[🔧 DEBUG] FAILED to read files: {e}\033[0m")
        return "Error: Could not read the company handbooks."