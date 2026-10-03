import json

log_path = r"C:\Users\ahsan\.gemini\antigravity-ide\brain\5c4205b6-ebf1-4e4c-af67-16bd8af30356\.system_generated\logs\transcript.jsonl"

# Read recent lines
with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in transcript: {len(lines)}")
# Find checkpoint 6 or recent turn
recent_chars = 0
for l in lines[-100:]:
    recent_chars += len(l)

print(f"Last 100 steps chars: {recent_chars:,} (~{int(recent_chars/3.5):,} tokens)")
