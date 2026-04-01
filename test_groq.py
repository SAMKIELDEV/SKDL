import os
import sys
from groq import Groq
from dotenv import load_dotenv

# Load env from the bot directory
load_dotenv(dotenv_path='c:/Users/SAMKIEL/CODEX/SKDL/bot/.env')

api_key = os.environ.get("GROQ_API_KEY")
print(f"Testing Key: {api_key[:10]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("ERROR: GROQ_API_KEY not found in .env file.")
    sys.exit(1)

client = Groq(api_key=api_key)

try:
    print("Sending test request to Groq...")
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Say 'Groq is working!' if you can read this.",
            }
        ],
        model="llama-3.3-70b-versatile",
    )
    print("\n✅ SUCCESS!")
    print(f"Response: {chat_completion.choices[0].message.content}")
except Exception as e:
    print("\n❌ FAILED!")
    print(f"Error Details: {e}")
