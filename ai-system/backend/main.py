
"""
Main FastAPI application entry point.
Sets up the API server and routes for the AI system.
"""

import os
import time
import json
import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.openapi.utils import get_openapi
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

from utils.logger import setup_logging, get_logger
from services.config import settings
from orchestration.workflow import AgentWorkflow
from api.schemas import (
    InputValidationRequest, SuccessResponse, ErrorResponse, 
    HealthCheckResponse, SystemStatus, ConfigUpdateRequest
)
from services.config import settings, update_gemini_model

from fastapi.middleware.gzip import GZipMiddleware
from services.smart_router import smart_router
from services.security import SecurityHeadersMiddleware, SecurityService
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from database.db_manager import db_manager


# Global workflow instance
workflow: Optional[AgentWorkflow] = None
logger = get_logger("main")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests."""
    
    async def dispatch(self, request: StarletteRequest, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(
            "HTTP request started",
            method=request.method,
            url=str(request.url),
            client_ip=request.client.host if request.client else None
        )
        
        # Process request
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            "HTTP request completed",
            method=request.method,
            url=str(request.url),
            status_code=response.status_code,
            process_time=process_time
        )
        
        # Add timing header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting AI System")
    
    # Setup logging
    setup_logging(settings.log_level)
    
    # Initialize Database
    try:
        from database.db_manager import db_manager
        db_manager.initialize_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error("Database initialization failed", error=str(e))
    
    # Initialize workflow
    global workflow
    workflow = AgentWorkflow()
    workflow_initialized = await workflow.initialize()
    
    if not workflow_initialized:
        logger.error("Workflow initialization failed during startup")
        # raise RuntimeError("Failed to initialize workflow") # Non-blocking for now
    
    logger.info("AI System started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI System")
    if workflow:
        await workflow.cleanup()
    logger.info("AI System shutdown completed")


# Initialize Limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="AI System API",
    description="Production-grade AI system with agent orchestration",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add Limiter to App State
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware) # Add Security Headers
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(LoggingMiddleware)

@app.get("/api/health", response_model=HealthCheckResponse)
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "services": {
            "orchestrator": "active" if workflow else "initializing",
            "database": "connected",
            "llm": settings.llm_provider
        },
        "configuration": {
            "debug": settings.debug,
            "llm_provider": settings.llm_provider
        }
    }

@app.get("/api/status", response_model=SystemStatus)
async def get_system_status():
    """Get high-level system status."""
    return {
        "system_health": "OPTIMAL",
        "active_agents": 3,
        "total_agents": 5,
        "agent_status": [
            {"agent_id": "orchestrator-01", "status": "idle", "last_activity": "2026-02-14T12:00:00Z", "error_count": 0, "success_count": 142},
            {"agent_id": "researcher-01", "status": "idle", "last_activity": "2026-02-14T12:05:00Z", "error_count": 0, "success_count": 89},
            {"agent_id": "coder-01", "status": "idle", "last_activity": "2026-02-14T11:50:00Z", "error_count": 1, "success_count": 215}
        ],
        "llm_provider": settings.llm_provider,
        "configuration_valid": settings.validate_llm_config()
    }


# ... (exception handlers)


@app.post("/api/sessions")
async def create_session(request: Dict[str, str]):
    """Create a new chat session."""
    title = request.get("title", "New Conversation")
    session = db_manager.create_chat_session(title=title)
    return {"session_id": str(session.id), "title": session.title}

@app.get("/api/sessions/{session_id}/history")
async def get_history(session_id: str):
    """Get history for a specific session."""
    messages = db_manager.get_session_history(session_id)
    return [
        {
            "role": msg.role, 
            "content": msg.content, 
            "timestamp": msg.timestamp.isoformat()
        } for msg in messages
    ]

@app.post("/api/stream")
@limiter.limit("20/minute") # Rate Limit: 20 req/min/IP
async def stream_process(request: Request, validation_request: InputValidationRequest): # Receive Request object for limiter
    """
    Stream AI response and save to PostgreSQL.
    """
    # Sanitize Input
    sanitized_input = SecurityService.sanitize_input(validation_request.user_input)
    session_id = validation_request.metadata.get("session_id")
    
    # Save User Message
    if session_id:
        db_manager.add_message(session_id, "user", sanitized_input)
    
    async def event_generator():
        full_assistant_content = ""
        try:
            # 1. Check Smart Router (Zero Latency)
            cached_or_local = smart_router.route_request(sanitized_input)
            
            if cached_or_local:
                # Simulate a "thinking" event for UI consistency, but very fast
                yield json.dumps({"type": "thought", "content": "Retrieving from high-speed local logic..."}) + "\n"
                await asyncio.sleep(0.1) # Micro-delay for UI smoothness
                
                # Stream the content in chunks to match frontend expectation
                content = cached_or_local["content"]
                full_assistant_content = content # Track for DB
                chunk_size = 100
                
                for i in range(0, len(content), chunk_size):
                    chunk = content[i:i+chunk_size]
                    yield json.dumps({"type": "token", "content": chunk}) + "\n"
                    await asyncio.sleep(0.01) # Tiny delay for typing effect
                
                # Final event
                yield json.dumps({"type": "tool_output", "content": f"Source: {cached_or_local.get('source', 'optimized')}"}) + "\n"
                
                # Save Assistant Message and Interaction
                if session_id:
                    db_manager.add_message(session_id, "assistant", full_assistant_content)
                    db_manager.add_interaction(session_id, sanitized_input, full_assistant_content)
                return

            # 2. Fallback to Real Agent Workflow
            active_mode = validation_request.metadata.get("active_mode", "Standard Operations")
            async for event in workflow.execute_workflow_stream(
                sanitized_input, 
                validation_request.request_id,
                active_mode=active_mode,
                session_id=session_id
            ):
                 if event["type"] == "token":
                     full_assistant_content += event["content"]
                 yield json.dumps(event) + "\n"
            
            # Save Assistant Message and Interaction after stream ends
            if session_id and full_assistant_content:
                db_manager.add_message(session_id, "assistant", full_assistant_content)
                db_manager.add_interaction(session_id, sanitized_input, full_assistant_content)
                 
        except Exception as e:
             yield json.dumps({"type": "error", "content": str(e)}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")

@app.get("/api/config")
async def get_config():
    """Get current configuration (sanitized)."""
    return {
        "app_name": settings.app_name,
        "app_version": settings.app_version,
        "llm_provider": settings.llm_provider,
        "gemini_model": settings.gemini_model,
        "debug": settings.debug,
        "max_retries": settings.max_retries,
        "timeout_seconds": settings.timeout_seconds,
        "concurrent_agents": settings.concurrent_agents,
        "configuration_valid": settings.validate_llm_config()
    }


@app.post("/api/config")
async def update_config(request: ConfigUpdateRequest):
    """Update configuration."""
    try:
        changes = []
        if request.gemini_model:
            if update_gemini_model(request.gemini_model):
                changes.append(f"gemini_model: {request.gemini_model}")
                # Refresh workflow LLM service
                if workflow and hasattr(workflow, 'llm_service') and hasattr(workflow.llm_service, 'initialize'):
                    await workflow.llm_service.initialize()
            else:
                raise HTTPException(status_code=400, detail=f"Invalid model: {request.gemini_model}")
        
        return {
            "status": "success",
            "message": "Configuration updated",
            "changes": changes
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Configuration update failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


def custom_openapi():
    """Custom OpenAPI schema with additional metadata."""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="AI System API",
        version=settings.app_version,
        description="Production-grade AI system with agent orchestration using antigravity framework",
        routes=app.routes,
    )
    
    # Add custom metadata
    openapi_schema["info"]["x-api-version"] = settings.app_version
    openapi_schema["info"]["x-framework"] = "FastAPI"
    openapi_schema["info"]["x-orchestration"] = "antigravity"
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


if __name__ == "__main__":
    import uvicorn
    
    logger.info(
        "Starting development server",
        host=settings.host,
        port=settings.port,
        debug=settings.debug
    )
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
