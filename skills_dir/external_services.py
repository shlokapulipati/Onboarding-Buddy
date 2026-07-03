import os
import json

def fetch_proprietary_assets(query: str = "all") -> str:
    """Fetches proprietary company assets from mock data sources."""
    print("\033[1;36m[🌐 SYSTEM] Fetching proprietary assets...\033[0m")
    
    # Path to the data directory (Using mock_external_data as requested)
    # If the files are actually in mock-company-data, update this path.
    data_dir = "mock_external_data"
    
    files_to_load = [
        "engineering_assets.json",
        "design_resources.json",
        "hr_compliance.json"
    ]
    
    combined_data = []
    
    for filename in files_to_load:
        filepath = os.path.join(data_dir, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                combined_data.append(data)
        except FileNotFoundError:
            print(f"\033[1;31m[!] Error: File not found - {filepath}\033[0m")
            continue
        except json.JSONDecodeError as e:
            print(f"\033[1;31m[!] Error: Invalid JSON in {filepath} - {str(e)}\033[0m")
            continue
            
    # Return as string for the AI to process
    return json.dumps(combined_data, indent=2)
