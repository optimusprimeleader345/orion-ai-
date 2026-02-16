 
"""
Demonstration script for the AI System.
Shows how to use the system programmatically.
"""

import sys
import os
import asyncio
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.abspath('.'))

from backend.api.schemas import InputValidationRequest
from backend.utils.logger import setup_logging, get_logger
from backend.services.config import settings, validate_llm_config
from backend.orchestration.workflow import AgentWorkflow


async def demonstrate_system():
    """Demonstrate the AI system functionality."""
    
    print("AI System Demonstration")
    print("=" * 50)
    
    # Setup logging
    setup_logging("INFO")
    logger = get_logger("demo")
    
    # Show configuration
    print(f"Configuration:")
    print(f"   App Name: {settings.app_name}")
    print(f"   App Version: {settings.app_version}")
    print(f"   LLM Provider: {settings.llm_provider}")
    print(f"   Debug Mode: {settings.debug}")
    print()
    
    # Check LLM configuration
    if not validate_llm_config():
        print("Warning: LLM configuration is incomplete")
        print("   Please set up your API keys in .env file")
        print("   For demo purposes, we'll show the system structure")
        return
    
    print("LLM configuration is valid")
    print()
    
    # Initialize workflow
    print("Initializing workflow...")
    workflow = AgentWorkflow()
    initialized = await workflow.initialize()
    
    if not initialized:
        print("Workflow initialization failed")
        return
    
    print("Workflow initialized successfully")
    print()
    
    # Show system status
    print("System Status:")
    status = await workflow.get_workflow_status()
    print(f"   Workflow Status: {status['workflow_status']}")
    print(f"   LLM Service: {status['llm_service_status']['status']}")
    print(f"   Agents: {len(status['agents'])}")
    print()
    
    # Demonstrate processing
    print("Processing Demo Input...")
    demo_input = "Explain the concept of artificial intelligence in simple terms for a 10-year-old."
    
    try:
        result = await workflow.execute_workflow(
            user_input=demo_input,
            request_id=f"demo_{int(datetime.now().timestamp())}"
        )
        
        print("✅ Processing completed successfully!")
        print()
        print("📤 Results:")
        print(f"   Workflow ID: {result['workflow_id']}")
        print(f"   Processing Time: {result['processing_time']:.2f} seconds")
        print(f"   LLM Provider: {result['metadata']['llm_provider']}")
        print()
        print("📝 Generated Output:")
        print("-" * 40)
        print(result['output']['content'])
        print("-" * 40)
        
    except Exception as e:
        print(f"❌ Processing failed: {e}")
        print("   This might be due to missing API keys or network issues")
    
    # Cleanup
    await workflow.cleanup()
    print("\n🧹 Cleanup completed")


def demonstrate_api_usage():
    """Show how to use the API."""
    print("\nAPI Usage Examples:")
    print("=" * 50)
    
    print("1. Health Check:")
    print("   curl http://localhost:8000/health")
    print()
    
    print("2. System Status:")
    print("   curl http://localhost:8000/status")
    print()
    
    print("3. Process Request:")
    print("   curl -X POST http://localhost:8000/api/process \\")
    print('   -H "Content-Type: application/json" \\')
    print('   -d \'{"user_input": "Your question here", "request_id": "optional-id"}\'')
    print()
    
    print("4. View API Documentation:")
    print("   http://localhost:8000/docs")
    print("   http://localhost:8000/redoc")


def demonstrate_docker_usage():
    """Show Docker deployment examples."""
    print("\nDocker Deployment:")
    print("=" * 50)
    
    print("1. Build and Run:")
    print("   cd docker")
    print("   docker-compose up -d")
    print()
    
    print("2. View Logs:")
    print("   docker-compose logs -f ai-system")
    print()
    
    print("3. Stop Services:")
    print("   docker-compose down")
    print()
    
    print("4. Monitor with Grafana:")
    print("   http://localhost:3000 (admin/admin)")


if __name__ == "__main__":
    print("AI System - Production Grade Implementation")
    print("Using antigravity for agent orchestration")
    print("FastAPI backend with external LLM integration")
    print()
    
    # Run demonstration
    asyncio.run(demonstrate_system())
    
    # Show usage examples
    demonstrate_api_usage()
    demonstrate_docker_usage()
    
    print("\nDemonstration completed!")
    print("\nNext Steps:")
    print("1. Set up your .env file with API keys")
    print("2. Run: cd backend && python main.py")
    print("3. Test the API endpoints")
    print("4. Deploy with Docker for production")
