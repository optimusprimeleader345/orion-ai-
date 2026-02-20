
import asyncio
import httpx
import json

async def test_mlvoca():
    print("Testing MLVoca API (Ollama Format)...")
    url = "https://mlvoca.com/api/generate"
    payload = {
        "model": "tinyllama",
        "prompt": "Hello, explain Python in one sentence.",
        "stream": False
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            print("API Response received successfully!")
            print(f"Model used: {data.get('model')}")
            print(f"Response text: {data.get('response')}")
    except Exception as e:
        print(f"API Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_mlvoca())
