import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

try:
    genai.configure(api_key=api_key)
    with open("available_models.txt", "w") as f:
        f.write("Available models that support generateContent:\\n")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\\n")
    print("Models saved to available_models.txt")
except Exception as e:
    print(f"ERROR: {e}")
