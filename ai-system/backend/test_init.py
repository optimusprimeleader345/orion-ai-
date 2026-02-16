import asyncio
import sys
import os

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from orchestration.workflow import AgentWorkflow
from services.config import settings

async def test_init():
    print(f"Testing Gemini API with model: {settings.gemini_model}")
    try:
        workflow = AgentWorkflow()
        result = await workflow.initialize()
        print(f"Initialization result: {result}")
    except Exception as e:
        print(f"Initialization failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_init())
