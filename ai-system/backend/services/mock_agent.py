import asyncio
import random
import json
from typing import AsyncGenerator, Dict, Any, List

class MockLLMService:
    """
    Simulates a high-intelligence AI without requiring an API key.
    Provides rich, multi-step responses for demos and testing.
    """

    def __init__(self):
        self.provider = "mock"
        self.model = "sentinel-mock-v1"

    async def generate_content_stream(self, prompt: str, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream mock content based on prompt keywords.
        """
        prompt_lower = prompt.lower()
        
        # Scenario 1: Deep Research (Quantum, Physics, Science)
        if any(w in prompt_lower for w in ["quantum", "physics", "science", "research", "search"]):
            async for chunk in self._stream_scenario_research(prompt):
                yield chunk
            
        # Scenario 2: Coding (Fix, Debug, Code, Python, React)
        elif any(w in prompt_lower for w in ["fix", "debug", "code", "python", "react", "function"]):
            async for chunk in self._stream_scenario_coding(prompt):
                yield chunk
            
        # Scenario 3: Creative / General (Story, Poem, Explain)
        elif any(w in prompt_lower for w in ["story", "poem", "write", "explain"]):
            async for chunk in self._stream_scenario_creative(prompt):
                yield chunk
            
        # Default: General Assistant
        else:
            async for chunk in self._stream_scenario_default(prompt):
                yield chunk

    async def _stream_scenario_research(self, prompt: str):
        # 1. Thinking
        yield {"type": "thought", "content": f"Initializing deep research vector for: '{prompt}'"}
        await asyncio.sleep(0.4)
        
        yield {"type": "thought", "content": "Expanding search parameters to include localized technical reports and global repositories..."}
        await asyncio.sleep(0.6)

        yield {"type": "thought", "content": "Cross-referencing multiple data streams for potential anomalies or overlooked patterns..."}
        await asyncio.sleep(0.5)

        # 2. Action
        yield {"type": "action", "content": f"Scanning Local Knowledge Index (RAG Simulation) for '{prompt}'"}
        await asyncio.sleep(1.2)
        
        yield {"type": "thought", "content": "RAG Scan Complete: Found 4 relevant local documents. Integrating with global knowledge graph..."}
        await asyncio.sleep(0.8)

        yield {"type": "action", "content": "Querying External Academic Repositories (arXiv, IEEE Xplore)..."}
        await asyncio.sleep(1.5)

        yield {"type": "thought", "content": "Synthesizing findings into a coherent architectural summary..."}
        await asyncio.sleep(0.6)

        # 3. Message
        response = (
            f"### Research Synthesis: **{prompt}**\n\n"
            "My analysis reveals a high-probability convergence in this domain. Here is the distilled intelligence:\n\n"
            "#### 1. Core Structural Logic\n"
            "The subject operates at the intersection of high-fidelity data processing and recursive neural heuristics. "
            "Recent advancements suggest that by optimizing the 'Attention' mechanism at the edge, we can reduce latency by up to 30% without loss of precision.\n\n"
            "#### 2. Key Insights Found\n"
            "- **Observation A**: Entangled state synchronization is now achievable with 99.9% reliability in controlled mock environments.\n"
            "- **Observation B**: The holographic principle has been successfully simulated for 4D-to-3D projection mapping.\n\n"
            "#### 3. Recommended Path\n"
            "Integration into the core SentinelAI engine is recommended via a modular plugin architecture to maintain future-proofing."
        )
        
        for chunk in self._chunk_text(response):
            yield {"type": "token", "content": chunk}
            await asyncio.sleep(0.015)

    async def _stream_scenario_coding(self, prompt: str):
        # 1. Thinking
        yield {"type": "thought", "content": "Initializing Code Analysis Kernel..."}
        await asyncio.sleep(0.4)
        
        yield {"type": "thought", "content": "Parsing abstract syntax tree (AST) for pattern matching..."}
        await asyncio.sleep(0.5)

        # 2. Action
        yield {"type": "action", "content": "Running Vulnerability Scan & Dependency Audit..."}
        await asyncio.sleep(1.0)
        
        yield {"type": "thought", "content": "Analysis Result: Identified non-optimal recursion and missing error bounds in the provided snippet."}
        await asyncio.sleep(0.7)

        yield {"type": "action", "content": "Generating Optimized Refactor (Ref: Sentinel-Code-Master-v2)..."}
        await asyncio.sleep(1.2)

        yield {"type": "thought", "content": "Self-Correction Loop: Verifying logic against simulated test suite... Pass."}
        await asyncio.sleep(0.6)

        # 3. Message
        response = (
            "I've completed a full audit of your request. The logic was technically functional, but suffered from 'Silent Failure' patterns under heavy load.\n\n"
            "### Optimized Implementation:\n\n"
            "```python\n"
            "import functools\n\n"
            "@functools.lru_cache(maxsize=128)\n"
            "def secure_process(input_data: list, safety_threshold: float = 0.95) -> dict:\n"
            "    \"\"\"Optimized handler with memoization and bound checks.\"\"\"\n"
            "    if not input_data or safety_threshold < 0:\n"
            "        return {\"status\": \"error\", \"data\": None}\n\n"
            "    # High-efficiency reduction\n"
            "    result = sum(input_data) * safety_threshold\n"
            "    return {\"status\": \"success\", \"payload\": result}\n"
            "```\n\n"
            "#### Why this is 'Perfect':\n"
            "1. **Memoization**: Added `lru_cache` to prevent redundant calculations.\n"
            "2. **Strict Typing**: Enforced type hints for better IDE support and runtime safety.\n"
            "3. **Defensive Logic**: Added explicit multi-point guards for invalid inputs."
        )
        
        for chunk in self._chunk_text(response):
            yield {"type": "token", "content": chunk}
            await asyncio.sleep(0.01) # Ultra-fast for code delivery

    async def _stream_scenario_creative(self, prompt: str):
        yield {"type": "thought", "content": "Calibrating linguistic harmonics..."}
        await asyncio.sleep(0.5)
        
        yield {"type": "thought", "content": "Accessing creative semantic clusters for vivid imagery..."}
        await asyncio.sleep(0.6)

        yield {"type": "action", "content": "Drafting multiple stylistic variations..."}
        await asyncio.sleep(0.8)
        
        response = (
            f"### Creative Vision: **{prompt}**\n\n"
            "The machine didn't just see the code; it saw the *intent* behind the character—the silent architecture of thought that precedes the keystroke.\n\n"
            "> \"In the dance between the abstract and the actual, the most beautiful patterns are those that solve problems we haven't even encountered yet.\"\n\n"
            "Your request has been woven into a narrative of digital evolution, where every interaction is a step toward a more unified consciousness."
        )
        
        for chunk in self._chunk_text(response):
             yield {"type": "token", "content": chunk}
             await asyncio.sleep(0.03)

    async def _stream_scenario_default(self, prompt: str):
        yield {"type": "thought", "content": "Opening general heuristic module..."}
        await asyncio.sleep(0.4)
        
        response = (
            f"Understood. I'm ready to assist with: **{prompt}**. \n\n"
            "To unlock my full **'Perfect System'** potential, try using my specialized modes:\n"
            "- **Research**: For deep analysis (try: 'Research the impact of AI on DX')\n"
            "- **Coding**: For technical fixes (try: 'Optimize this React hook')\n"
            "- **Logic**: For building files (try: 'Build a Dockerfile for Vite')\n\n"
            "I'm operating in **Sentinel-Mock-Master** mode, providing production-fidelity feedback without external API dependencies."
        )
        
        for chunk in self._chunk_text(response):
             yield {"type": "token", "content": chunk}
             await asyncio.sleep(0.02)

    def _chunk_text(self, text: str, size: int = 4) -> List[str]:
        return [text[i:i+size] for i in range(0, len(text), size)]

    async def generate_content(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Synchronous fallback, also used for AI Planner in mock mode."""
        
        # Handle Planner Prompt
        if "decide the NEXT ACTION" in prompt:
            # Extract user message to avoid keyword collision with system prompt
            user_msg = prompt.split("Latest user message:")[-1].lower() if "Latest user message:" in prompt else prompt.lower()
            
            if "docker" in user_msg or "ci" in user_msg:
                decision = {
                    "action": "RUN_FEATURE",
                    "feature_name": "generate_ci_and_docker",
                    "reason": "User requested Docker/CI generation."
                }
            else:
                decision = {
                    "action": "ANSWER_DIRECTLY",
                    "feature_name": None,
                    "reason": "General conversational intent."
                }
            return {
                "content": json.dumps(decision),
                "model": "sentinel-mock",
                "usage": {}
            }

        return {
            "content": f"[Mock Mode] Processed: {prompt}",
            "model": "sentinel-mock",
            "usage": {}
        }

    async def health_check(self) -> bool:
        return True
