import sys
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Say hello!")
    print("SUCCESS")
    print(response.text)
except Exception as e:
    print("FAILED")
    print(str(e))
    sys.exit(1)
