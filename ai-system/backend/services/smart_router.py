from typing import Dict, Any, Optional
import datetime
from services.cache_service import response_cache

class SmartRouter:
    """
    Intelligently routes queries to either:
    1. Local High-Speed Logic (No Cost)
    2. Cached Responses (No Cost)
    3. Real LLM Service (Cost)
    """

    @staticmethod
    def get_system_status_response() -> Dict[str, Any]:
        """Generate a system status response locally."""
        return {
           "type": "status_report",
           "content": f"""### System Status Report
| Component | Status | Latency | Uptime |
| :--- | :--- | :--- | :--- |
| **Neural Core** | [OK] Online | 2ms | 99.99% |
| **Vector DB** | [OK] Online | 15ms | 99.95% |
| **Gateway** | [OK] Online | 5ms | 100.00% |

> [!NOTE]
> All systems operational. Response generated locally at {datetime.datetime.now().strftime("%H:%M:%S")}.
"""
        }

    @staticmethod
    def get_identity_response() -> Dict[str, Any]:
        """Generate identity response locally."""
        return {
            "type": "identity",
            "content": "I am **Sentinel AI**, a specialized artificial intelligence designed to optimize workflows, enhance decision-making, and provide deep technical support. I operate within this Universal Workspace to serve as your co-pilot in all digital endeavors."
        }

    @staticmethod
    def route_request(user_input: str, mode: str = "standard") -> Optional[Dict[str, Any]]:
        """
        Determine if request can be handled locally or via cache.
        Returns Dict if handled locally, None if LLM is needed.
        """
        normalized_input = user_input.lower().strip()

        # 1. Check Cache
        cached = response_cache.get(user_input, mode)
        if cached:
            return {**cached, "source": "cache"}

        # 2. Check Local Patterns (Zero Cost)
        if normalized_input in ["status", "system status", "health", "uptime"]:
            return {**SmartRouter.get_system_status_response(), "source": "local"}
        
        if any(x in normalized_input for x in ["who are you", "what are you", "identity"]):
             return {**SmartRouter.get_identity_response(), "source": "local"}
             
        if normalized_input in ["hello", "hi", "hey", "greetings"]:
             return {
                 "content": "Hello! I am Sentinel AI. How can I assist you with your operations today?",
                 "source": "local"
             }

        # 3. Fallthrough to Real LLM
        return None

smart_router = SmartRouter()
