"""
Base agent interface for the AI system.
All specialized agents should inherit from this class.
"""

import asyncio
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union
from utils.logger import LoggerMixin
from services.config import settings


class AgentError(Exception):
    """Base exception for agent-related errors."""
    pass


class AgentTimeoutError(AgentError):
    """Exception raised when an agent operation times out."""
    pass


class AgentValidationError(AgentError):
    """Exception raised when agent input validation fails."""
    pass


class BaseAgent(LoggerMixin, ABC):
    """Base agent class with common functionality."""
    
    def __init__(self, agent_id: str, **kwargs):
        """
        Initialize the base agent.
        
        Args:
            agent_id: Unique identifier for the agent
            **kwargs: Additional agent-specific configuration
        """
        super().__init__()
        self.agent_id = agent_id
        self.status = "initialized"
        self.error_count = 0
        self.success_count = 0
        self.last_activity = None
        self.config = kwargs
        self.logger = self.logger.bind(agent_id=agent_id)
        
        self.logger.info(
            "Agent initialized",
            agent_type=self.__class__.__name__,
            config_keys=list(kwargs.keys())
        )
    
    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's main functionality.
        
        Args:
            input_data: Input data for the agent
            
        Returns:
            Dict containing the agent's output
            
        Raises:
            AgentError: If the agent execution fails
        """
        pass
    
    async def run_with_retry(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent with retry logic.
        
        Args:
            input_data: Input data for the agent
            
        Returns:
            Dict containing the agent's output
            
        Raises:
            AgentError: If all retry attempts fail
        """
        last_exception = None
        
        for attempt in range(settings.max_retries):
            try:
                self.status = "running"
                self.last_activity = time.time()
                
                # Add retry info to input
                input_with_retry = input_data.copy()
                input_with_retry["_retry_attempt"] = attempt + 1
                
                result = await asyncio.wait_for(
                    self.execute(input_with_retry),
                    timeout=settings.timeout_seconds
                )
                
                self.status = "completed"
                self.success_count += 1
                self.logger.info(
                    "Agent execution successful",
                    attempt=attempt + 1,
                    execution_time=time.time() - self.last_activity
                )
                
                return result
                
            except asyncio.TimeoutError:
                last_exception = AgentTimeoutError(f"Agent {self.agent_id} timed out after {settings.timeout_seconds}s")
                self.logger.warning(
                    "Agent execution timed out",
                    attempt=attempt + 1,
                    timeout=settings.timeout_seconds
                )
                
            except AgentError as e:
                last_exception = e
                self.logger.warning(
                    "Agent execution failed",
                    attempt=attempt + 1,
                    error=str(e)
                )
                
            except Exception as e:
                last_exception = AgentError(f"Unexpected error: {str(e)}")
                self.logger.error(
                    "Agent execution failed with unexpected error",
                    attempt=attempt + 1,
                    error=str(e)
                )
            
            # Wait before retry (exponential backoff)
            if attempt < settings.max_retries - 1:
                wait_time = 2 ** attempt
                self.logger.info(f"Waiting {wait_time} seconds before retry")
                await asyncio.sleep(wait_time)
        
        # All retries failed
        self.status = "failed"
        self.error_count += 1
        self.logger.error(
            "Agent execution failed after all retries",
            max_retries=settings.max_retries,
            last_error=str(last_exception)
        )
        
        raise last_exception
    
    def validate_input(self, input_data: Dict[str, Any], required_fields: List[str]) -> None:
        """
        Validate that required fields are present in input data.
        
        Args:
            input_data: Input data to validate
            required_fields: List of required field names
            
        Raises:
            AgentValidationError: If validation fails
        """
        missing_fields = [field for field in required_fields if field not in input_data]
        
        if missing_fields:
            raise AgentValidationError(f"Missing required fields: {missing_fields}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status."""
        return {
            "agent_id": self.agent_id,
            "status": self.status,
            "last_activity": self.last_activity,
            "error_count": self.error_count,
            "success_count": self.success_count,
            "agent_type": self.__class__.__name__
        }
    
    async def cleanup(self) -> None:
        """Clean up agent resources."""
        self.logger.info("Agent cleanup completed")
        self.status = "terminated"
    
    def __str__(self) -> str:
        return f"{self.__class__.__name__}(id={self.agent_id}, status={self.status})"
    
    def __repr__(self) -> str:
        return self.__str__()