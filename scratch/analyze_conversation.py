import json

log_full = r"C:\Users\ahsan\.gemini\antigravity-ide\brain\5c4205b6-ebf1-4e4c-af67-16bd8af30356\.system_generated\logs\transcript_full.jsonl"

total_chars = 0
total_words = 0
user_messages = 0
model_responses = 0
tool_calls_count = 0
step_count = 0

with open(log_full, 'r', encoding='utf-8') as f:
    for line in f:
        step_count += 1
        total_chars += len(line)
        total_words += len(line.split())
        try:
            data = json.loads(line)
            m_type = data.get("type", "")
            if m_type == "USER_INPUT":
                user_messages += 1
            elif m_type == "PLANNER_RESPONSE":
                model_responses += 1
            if "tool_calls" in data and data["tool_calls"]:
                tool_calls_count += len(data["tool_calls"])
        except Exception:
            pass

# Typical token estimate for code + English text + JSON structures is ~3.5 to 4 characters per token
est_tokens_low = total_chars / 4.0
est_tokens_high = total_chars / 3.3

print(f"Total steps: {step_count}")
print(f"User messages: {user_messages}")
print(f"Model responses: {model_responses}")
print(f"Tool calls made: {tool_calls_count}")
print(f"Total characters: {total_chars:,}")
print(f"Total words: {total_words:,}")
print(f"Estimated cumulative conversation tokens: ~{int(est_tokens_low):,} to ~{int(est_tokens_high):,} tokens (~{round((est_tokens_low + est_tokens_high)/2 / 1000):,}k tokens)")
