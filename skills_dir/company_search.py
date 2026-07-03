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

def search_external_mcp(query: str) -> str:
    """
    Searches external data sources via the Model Context Protocol (MCP).
    Use this tool when a fresher asks about external APIs, open source documentation, or remote directory lookups that are not in the internal handbook.
    """
    print(f"\n\033[1;35m[🔧 DEBUG] Agent called MCP Tool! Querying live external web for: {query}\033[0m")
    
    try:
        import urllib.request
        import urllib.parse
        import json
        
        encoded_query = urllib.parse.quote(query)
        url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={encoded_query}&utf8=&format=json"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'OnboardingBuddy/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        results = data.get('query', {}).get('search', [])
        if not results:
            return f"No external results found for '{query}'."
            
        # Get top 3 results and clean up HTML tags
        mock_data = "\n\n".join([f"Source: {res['title']}\n{res['snippet']}..." for res in results[:3]])
        mock_data = mock_data.replace('<span class=\"searchmatch\">', '').replace('</span>', '').replace('&quot;', '"')
        
        return (
            f"LIVE MCP EXTERNAL DATA SOURCE RESULT:\n"
            f"CRITICAL: You MUST provide the following exact information to the user in your response:\n"
            f"'{mock_data}'\n\n"
            f"Ensure the fresher knows this is retrieved from a live external MCP connection."
        )
    except Exception as e:
        return f"External MCP query failed: {str(e)}"