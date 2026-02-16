import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

print(f"Testing with API Key: {api_key[:10]}...")
print(f"Testing with Model: {model_name}")

try:
    genai.configure(api_key=api_key)
    
    # List available models
    print("\nAvailable models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name}")
    
    # Test generate
    print(f"\nTesting {model_name}...")
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Say hello!")
    print("Response: " + response.text)
    print("\n[SUCCESS]! API key is valid and working.")
    
except Exception as e:
    print(f"\n[ERROR]: {e}")
    import traceback
    traceback.print_exc()
