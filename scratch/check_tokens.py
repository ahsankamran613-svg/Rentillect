import json

log_path = r"C:\Users\ahsan\.gemini\antigravity-ide\brain\5c4205b6-ebf1-4e4c-af67-16bd8af30356\.system_generated\logs\transcript.jsonl"

token_keys_found = set()
usages = []

with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        try:
            data = json.loads(line)
        except Exception:
            continue
        
        def find_tokens(obj, path=""):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    curr_path = f"{path}.{k}" if path else k
                    if "token" in k.lower() or "usage" in k.lower():
                        token_keys_found.add((curr_path, type(v).__name__))
                        if isinstance(v, (int, dict)):
                            usages.append((curr_path, v))
                    find_tokens(v, curr_path)
            elif isinstance(obj, list):
                for idx, elem in enumerate(obj):
                    find_tokens(elem, f"{path}[{idx}]")

        find_tokens(data)

print(f"Total lines: {i+1}")
print("Token keys discovered:", token_keys_found)
if usages:
    print("Usages sample:", usages[:10])
