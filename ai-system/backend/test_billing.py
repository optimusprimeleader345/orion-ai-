import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Say 'Billing upgrade successful!' in exactly 4 words")
    print("SUCCESS! Billing is working!")
    print(f"Response: {response.text}")
    print("\nYour upgraded quota is active. You now have 1500 free requests/day!")
except Exception as e:
    error_str = str(e)
    if "429" in error_str or "quota" in error_str.lower():
        print("QUOTA STILL LIMITED - Billing may not be enabled yet")
        print("Please check Google AI Studio billing settings")
    else:
        print(f"ERROR: {error_str}")
