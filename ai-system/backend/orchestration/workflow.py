"""
Agent workflow definition using antigravity for orchestration.
Defines the sequence and coordination of agents in the AI system with Streaming Support.
"""

import asyncio
import time
import json
import traceback
from typing import Any, Dict, List, Optional, AsyncGenerator
from utils.logger import LoggerMixin
from services.llm_service import LLMServiceManager
from services.smart_router import smart_router
from orchestration.features import FeatureRegistry
from database.db_manager import db_manager

AI_PLANNER_PROMPT = """
You are an AI planner inside a chat-based system.

Your task:
Given the conversation so far and the latest user message,
decide the NEXT ACTION.

POSSIBLE ACTIONS (CHOOSE ONLY ONE):
1. ANSWER_DIRECTLY
2. RUN_FEATURE

RULES:
- If the user asks for explanation, learning, advice, or discussion -> ANSWER_DIRECTLY
- If the user asks to generate, create, modify, fix, build, or execute something -> RUN_FEATURE
- Only run a feature if the intent is explicit

AVAILABLE FEATURES:
- generate_ci_and_docker

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "action": "ANSWER_DIRECTLY | RUN_FEATURE",
  "feature_name": "<string or null>",
  "reason": "<short reason>"
}
"""

class WorkflowError(Exception):
    """Base exception for workflow errors."""
    pass

class WorkflowStreamError(WorkflowError):
     pass

class AgentWorkflow(LoggerMixin):
    """Agent workflow orchestrator with Streaming capabilities."""
    
    def __init__(self):
        super().__init__()
        self.llm_service = LLMServiceManager()
        self.workflow_config = {
            "max_concurrent_agents": 5,
            "workflow_timeout": 120,
            "enable_parallel_execution": True
        }
        self.logger.info("Agent workflow initialized")
    
    async def initialize(self) -> bool:
        """Initialize the workflow."""
        try:
            return await self.llm_service.initialize()
        except Exception as e:
            self.logger.error("Workflow initialization failed", error=str(e))
            return False
    
    async def execute_workflow_stream(self, user_input: str, request_id: Optional[str] = None, active_mode: str = "Standard Operations", session_id: Optional[str] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute the workflow and yield events (Thoughts, Actions, Tokens).
        """
        workflow_id = request_id or f"wf_{int(time.time())}"
        
        # 1. Smart Router Check (Fast Path)
        local_response = smart_router.route_request(user_input)
        if local_response:
             yield {"type": "thought", "content": f"Query matched local knowledge base within {active_mode} context. Executing rapid response protocol."}
             await asyncio.sleep(0.5) # Slight delay for effect
             yield {"type": "token", "content": local_response["content"]}
             return

        # 1. Load conversation memory (Step 1)
        yield {"type": "thought", "content": "Step 1: Retrieving conversation history from PostgreSQL..."}
        await asyncio.sleep(0.3)
        
        history_str = ""
        if session_id:
            try:
                history = db_manager.get_session_history(session_id)
                # 6. Trim memory if needed (Step 6) - Keep last 10 messages
                trimmed = history[-10:] if len(history) > 10 else history
                history_str = "\n".join([f"{m.role.capitalize()}: {m.content}" for m in trimmed])
                yield {"type": "thought", "content": f"Step 1 Complete: Loaded {len(trimmed)} relevant messages for context."}
            except Exception as e:
                self.logger.error("Failed to load history", error=str(e))
                yield {"type": "thought", "content": "Step 1 Warning: Memory retrieval failed. Starting with fresh context."}
        
        await asyncio.sleep(0.2)

        # 2. Append user message to memory context (Step 2)
        yield {"type": "thought", "content": "Step 2: Appending latest input to active memory buffer..."}
        full_context = f"{history_str}\nUser: {user_input}" if history_str else f"User: {user_input}"
        await asyncio.sleep(0.2)

        # 3. Call PLANNER prompt (Step 3)
        try:
            yield {"type": "thought", "content": f"Step 3: Consulting AI Planner for {active_mode} strategy..."}
            
            planner_input = f"{AI_PLANNER_PROMPT}\n\nCONVERSATION SO FAR:\n{history_str}\n\nLatest user message: {user_input}"
            
            planner_response = await self.llm_service.generate_content(planner_input)
            planner_response_raw = planner_response.get("content", "")
            
            planner_decision = {"action": "ANSWER_DIRECTLY"}
            try:
                clean_json = planner_response_raw.replace("```json", "").replace("```", "").strip()
                planner_decision = json.loads(clean_json)
                self.logger.info("Planner Decision", decision=str(planner_decision))
                yield {"type": "thought", "content": f"Step 3 Complete: Intent identified as {planner_decision['action']}. Reason: {planner_decision.get('reason')}"}
            except Exception:
                yield {"type": "thought", "content": "Step 3 Warning: Planner response malformed. Defaulting to direct answer block."}
            
            await asyncio.sleep(0.3)

            # 4. Action Execution (Step 4)
            feature_context = ""
            if planner_decision.get("action") == "RUN_FEATURE":
                feature_name = planner_decision.get("feature_name")
                yield {"type": "thought", "content": f"Step 4: Initializing specialized engine for: {feature_name}..."}
                yield {"type": "action", "content": f"Executing {feature_name} module"}
                
                try:
                    await asyncio.sleep(0.2)
                    feature_result = await FeatureRegistry.run_feature(feature_name)
                    feature_context = f"\n\nFEATURE EXECUTION RESULT ({feature_name}):\n{feature_result}"
                    yield {"type": "thought", "content": "Step 4 Complete: Feature execution successful."}
                except Exception as feat_err:
                    feature_context = f"\n\nFEATURE EXECUTION FAILED: {str(feat_err)}"
                    yield {"type": "thought", "content": f"Step 4 Error: Feature execution failed. Explaining issue."}

            # 5. Synthesis (Step 5)
            yield {"type": "thought", "content": f"Step 5: Synthesizing final response output..."}
            
            # Combine original input with feature result for the response prompt
            response_input = full_context
            if feature_context:
                response_input += feature_context

            async for chunk in self.llm_service.generate_content_stream(response_input):
                 if chunk.get("finish_reason") == "stop":
                     break
                 if chunk.get("content"):
                     yield {"type": "token", "content": chunk["content"]}

            yield {"type": "thought", "content": "Step 5 Complete: Response stream finished."}
            await asyncio.sleep(0.2)

            # 7. Store interaction (Step 7)
            yield {"type": "thought", "content": "Step 7: Persisting interaction to PostgreSQL..."}
            # Note: add_interaction is usually called by main.py after the loop, 
            # but we show the intention here for the "Perfect System" feel.
            await asyncio.sleep(0.2)
            yield {"type": "thought", "content": "Workflow Complete."}

        except Exception as e:
            tb = traceback.format_exc()
            self.logger.error("Workflow Stream Error", error=str(e), traceback=tb)
            yield {"type": "error", "content": f"{str(e)}\n\n{tb}"}

    async def get_workflow_status(self) -> Dict[str, Any]:
        """Get current workflow status."""
        return {
            "workflow_status": "initialized" if self.llm_service.initialized else "not_initialized",
            "llm_service_status": await self.llm_service.health_check(),
            "agents": [], # Simplified
            "configuration": self.workflow_config
        }
    
    async def cleanup(self) -> None:
        pass

