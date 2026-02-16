"""
Pydantic schemas for API request/response validation.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, validator


class InputValidationRequest(BaseModel):
    """Request schema for input validation."""
    
    user_input: str = Field(..., min_length=1, max_length=10000)
    request_id: Optional[str] = Field(None, max_length=100)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @validator('user_input')
    def validate_user_input(cls, v):
        """Validate user input format."""
        if not v or not v.strip():
            raise ValueError("User input cannot be empty")
        return v.strip()


class TaskAnalysisRequest(BaseModel):
    """Request schema for task analysis."""
    
    user_input: str
    input_type: str = Field(default="text")
    priority: int = Field(default=1, ge=1, le=10)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ProcessingRequest(BaseModel):
    """Request schema for content processing."""
    
    task_description: str
    input_data: Dict[str, Any]
    processing_type: str = Field(default="general")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class OutputFormattingRequest(BaseModel):
    """Request schema for output formatting."""
    
    raw_output: Dict[str, Any]
    output_format: str = Field(default="json")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Error response schema."""
    
    error: str
    error_code: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str
    request_id: Optional[str] = None


class SuccessResponse(BaseModel):
    """Success response schema."""
    
    result: Dict[str, Any]
    status: str = "success"
    processing_time: float
    request_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class HealthCheckResponse(BaseModel):
    """Health check response schema."""
    
    status: str
    version: str
    timestamp: str
    services: Dict[str, str]
    configuration: Dict[str, Any]


class AgentStatus(BaseModel):
    """Agent status information."""
    
    agent_id: str
    status: str
    last_activity: str
    error_count: int
    success_count: int
    metadata: Optional[Dict[str, Any]] = None


class SystemStatus(BaseModel):
    """System status information."""
    
    system_health: str
    active_agents: int
    total_agents: int
    agent_status: List[AgentStatus]
    llm_provider: str
    configuration_valid: bool


class ConfigUpdateRequest(BaseModel):
    """Request schema for updating configuration."""
    
    gemini_model: Optional[str] = None
    llm_provider: Optional[str] = None
    debug: Optional[bool] = None