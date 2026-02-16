import asyncio
import sys
import os

# Add current directory to path so we can import modules
sys.path.append(os.getcwd())

from orchestration.workflow import AgentWorkflow

async def test_workflow_stream():
    workflow = AgentWorkflow()
    print("--- Starting Workflow Stream Verification ---\n")
    
    # Test Scenario: Research
    print("Testing Research Scenario...")
    events_count = 0
    async for event in workflow.execute_workflow_stream(
        user_input="Research quantum computing",
        active_mode="Academic Research"
    ):
        events_count += 1
        etype = event.get("type")
        content = event.get("content")
        
        if etype == "thought":
            print(f"  [THOUGHT] {content}")
        elif etype == "action":
            print(f"  [ACTION]  {content}")
        elif etype == "token":
            # Just print the first few characters to avoid clutter
            pass
            
    print(f"\nTotal events generated for Research: {events_count}")
    
    print("\n" + "-"*50 + "\n")
    
    # Test Scenario: Coding
    print("Testing Coding Scenario...")
    events_count = 0
    async for event in workflow.execute_workflow_stream(
        user_input="Fix this React hook",
        active_mode="Deep Coding"
    ):
        events_count += 1
        etype = event.get("type")
        content = event.get("content")
        
        if etype == "thought":
            print(f"  [THOUGHT] {content}")
        elif etype == "action":
            print(f"  [ACTION]  {content}")
            
    print(f"\nTotal events generated for Coding: {events_count}")
    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    asyncio.run(test_workflow_stream())
