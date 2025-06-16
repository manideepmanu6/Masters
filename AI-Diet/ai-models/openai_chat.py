import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def chat_with_gpt(message):
    try:
        response = client.chat.completions.create(
            model="gpt-4",   # ✅ Using GPT-4 model
            messages=[
                {"role": "system", "content": "You are a highly professional AI dietitian and nutrition expert."},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=800   # Higher token limit for better meal plans
        )
        reply = response.choices[0].message.content.strip()
        return reply

    except Exception as e:
        print(f"❌ GPT Error:", e)
        return "❌ Sorry, AI is currently unavailable."
