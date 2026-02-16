import time
import hashlib
from typing import Dict, Any, Optional

class ResponseCache:
    """
    Simple in-memory LRU-like cache for API responses.
    Prevents redundant LLM calls for identical queries.
    """
    
    def __init__(self, ttl_seconds: int = 3600, max_size: int = 1000):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds
        self.max_size = max_size

    def _generate_key(self, user_input: str, mode: str = "standard") -> str:
        """Generate a consistent hash key for the input."""
        # Safety check for None or non-string inputs
        ui = str(user_input or "").strip().lower()
        md = str(mode or "standard")
        normalized = f"{ui}|{md}"
        return hashlib.md5(normalized.encode()).hexdigest()

    def get(self, user_input: str, mode: str = "standard") -> Optional[Dict[str, Any]]:
        """Retrieve a cached response if valid."""
        key = self._generate_key(user_input, mode)
        entry = self._cache.get(key)
        
        if not entry:
            return None
            
        # Check TTL
        if time.time() - entry["timestamp"] > self.ttl_seconds:
            del self._cache[key]
            return None
            
        return entry["data"]

    def set(self, user_input: str, response_data: Dict[str, Any], mode: str = "standard"):
        """Cache a response."""
        # Evict if full (simple random eviction for MVP, or just clear old ones)
        if len(self._cache) >= self.max_size:
            # Remove oldest 10%
            keys_to_remove = list(self._cache.keys())[:int(self.max_size * 0.1)]
            for k in keys_to_remove:
                del self._cache[k]

        key = self._generate_key(user_input, mode)
        self._cache[key] = {
            "data": response_data,
            "timestamp": time.time()
        }

    def clear(self):
        """Clear the cache."""
        self._cache.clear()

# Global cache instance
response_cache = ResponseCache()
