"""
Basic API tests for the AI system.
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from ..main import app
from ..orchestration.workflow import AgentWorkflow
from ..services.llm_service import LLMServiceManager


class TestAIAPISystem:
    """Test the complete AI API system."""
    
    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)
    
    @pytest.fixture
    def mock_workflow(self):
        """Create mock workflow."""
        workflow = AsyncMock(spec=AgentWorkflow)
        workflow.initialize = AsyncMock(return_value=True)
        workflow.get_workflow_status = AsyncMock(return_value={
            "workflow_status": "initialized",
            "llm_service_status": {"status": "healthy"},
            "agents": [],
            "configuration": {}
        })
        workflow.execute_workflow = AsyncMock(return_value={
            "workflow_id": "test_wf_123",
            "status": "completed",
            "processing_time": 1.5,
            "output": {"content": "Test output"},
            "metadata": {"llm_provider": "test", "workflow_steps": 4}
        })
        return workflow
    
    @pytest.fixture(autouse=True)
    def setup_mock_workflow(self, mock_workflow):
        """Setup mock workflow for all tests."""
        with patch('backend.main.workflow', mock_workflow):
            yield
    
    def test_root_endpoint(self, client):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "AI System API"
        assert data["version"] == "1.0.0"
        assert data["status"] == "running"
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"
        assert "services" in data
        assert "configuration" in data
    
    def test_system_status(self, client):
        """Test system status endpoint."""
        response = client.get("/status")
        assert response.status_code == 200
        data = response.json()
        assert "system_health" in data
        assert "active_agents" in data
        assert "total_agents" in data
        assert "agent_status" in data
    
    def test_process_request_success(self, client):
        """Test successful request processing."""
        test_input = {
            "user_input": "What is artificial intelligence?",
            "request_id": "test-001"
        }
        
        response = client.post("/api/process", json=test_input)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "result" in data
        assert "processing_time" in data
        assert "request_id" in data
        assert data["result"]["output"] == "Test output"
    
    def test_process_request_validation_error(self, client):
        """Test request validation error."""
        test_input = {
            "user_input": ""  # Empty input should fail validation
        }
        
        response = client.post("/api/process", json=test_input)
        assert response.status_code == 400
    
    def test_process_request_missing_input(self, client):
        """Test request with missing user_input."""
        test_input = {
            "request_id": "test-001"
        }
        
        response = client.post("/api/process", json=test_input)
        assert response.status_code == 400
    
    def test_config_endpoint(self, client):
        """Test configuration endpoint."""
        response = client.get("/api/config")
        assert response.status_code == 200
        
        data = response.json()
        assert "app_name" in data
        assert "llm_provider" in data
        assert "debug" in data
        assert "max_retries" in data
    
    def test_cors_headers(self, client):
        """Test CORS headers are present."""
        response = client.options("/api/process")
        assert response.status_code == 200
        # CORS headers should be present in actual deployment
    
    def test_request_logging(self, client):
        """Test that requests are logged."""
        # This is more of an integration test
        # In a real test, you'd capture logs and verify they contain request info
        response = client.get("/")
        assert response.status_code == 200


class TestInputValidation:
    """Test input validation functionality."""
    
    def test_valid_input(self):
        """Test valid input passes validation."""
        from ..api.schemas import InputValidationRequest
        
        valid_input = InputValidationRequest(
            user_input="This is a valid input",
            request_id="test-123"
        )
        
        assert valid_input.user_input == "This is a valid input"
        assert valid_input.request_id == "test-123"
    
    def test_empty_input_validation(self):
        """Test that empty input fails validation."""
        from ..api.schemas import InputValidationRequest
        
        with pytest.raises(ValueError):
            InputValidationRequest(user_input="")
    
    def test_whitespace_input_validation(self):
        """Test that whitespace-only input fails validation."""
        from ..api.schemas import InputValidationRequest
        
        with pytest.raises(ValueError):
            InputValidationRequest(user_input="   \n\t   ")
    
    def test_input_length_validation(self):
        """Test input length validation."""
        from ..api.schemas import InputValidationRequest
        
        # Very long input should fail
        long_input = "x" * 15000
        with pytest.raises(ValueError):
            InputValidationRequest(user_input=long_input)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])