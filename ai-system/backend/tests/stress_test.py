import requests
import time
import concurrent.futures

BASE_URL = "http://127.0.0.1:8000"
ENDPOINT = "/api/stream"

def send_request(i):
    payload = {
        "user_input": f"Test message {i}",
        "request_id": f"test-{i}"
    }
    try:
        response = requests.post(f"{BASE_URL}{ENDPOINT}", json=payload)
        return response.status_code
    except Exception as e:
        return str(e)

def stress_test():
    print(f"🚀 Starting Stress Test on {BASE_URL}{ENDPOINT}")
    print("Sending 25 requests (Limit is 20/min)...")
    
    start_time = time.time()
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(send_request, i) for i in range(25)]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())

    duration = time.time() - start_time
    
    success_count = results.count(200)
    blocked_count = results.count(429)
    
    print(f"\n📊 Test Results ({duration:.2f}s):")
    print(f"✅ Successful Requests: {success_count}")
    print(f"🛑 Blocked (Rate Limit): {blocked_count}")
    
    if blocked_count > 0:
        print("\n✅ Security System Active: Rate Limiter is blocking excess traffic.")
    else:
        print("\n❌ Warning: No requests were blocked. Rate limiter might be inactive or limit too high.")

if __name__ == "__main__":
    stress_test()
