"""
LLM service for external API integration.
Handles communication with Gemini, OpenAI, and Claude APIs with Streaming Support.
"""

import os
import time
import json
from typing import Any, Dict, List, Optional, AsyncGenerator
from abc import ABC, abstractmethod
import asyncio
import google.generativeai as genai
import openai
from utils.logger import LoggerMixin
from services.config import settings, get_llm_config
from services.smart_router import smart_router
from services.cache_service import response_cache

class LLMError(Exception):
    """Base exception for LLM service errors."""
    pass


class LLMTimeoutError(LLMError):
    """Exception raised when LLM API call times out."""
    pass


class LLMService(LoggerMixin, ABC):
    """Abstract base class for LLM service implementations."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__()
        self.config = config
        self.provider = config["provider"]
        self.model = config["model"]
        self.api_key = config["api_key"]
        self.logger = self.logger.bind(provider=self.provider, model=self.model)
    
    @abstractmethod
    async def generate_content(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate content (synchronous-style)."""
        pass

    @abstractmethod
    async def generate_content_stream(self, prompt: str, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        """Generate content stream (yields chunks)."""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the LLM service is healthy."""
        pass


class GeminiService(LLMService):
    """Google Gemini API service implementation."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        genai.configure(api_key=self.api_key)
        self.model_instance = genai.GenerativeModel(self.model)
        self.logger.info("Gemini service initialized")
    
    async def generate_content(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate content using Gemini API."""
        # 1. Check Smart Router (Local)
        local_response = smart_router.route_request(prompt)
        if local_response:
             self.logger.info("Smart Router: Local Hit")
             return {
                 "content": local_response["content"], 
                 "model": "local-logic", 
                 "usage": {"total_tokens": 0}
             }

        # 2. Call Real API
        try:
            response = await self.model_instance.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    candidate_count=1,
                    max_output_tokens=kwargs.get("max_tokens", 1000),
                    temperature=kwargs.get("temperature", 0.7),
                )
            )
            
            content = response.text
            
            # 3. Cache Result
            response_cache.set(prompt, {"content": content, "model": self.model})
            
            return {
                "content": content,
                "model": self.model,
                "usage": {"total_tokens": 0} # Usage not always available in quick response
            }
                
        except Exception as e:
            self.logger.log_error("Gemini API call failed", error=str(e))
            raise LLMError(f"Gemini API error: {str(e)}")

    async def generate_content_stream(self, prompt: str, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream content using Gemini API."""
        # 1. Check Smart Router (Local) - Stream it anyway for consistent UI
        local_response = smart_router.route_request(prompt)
        if local_response:
             self.logger.info("Smart Router: Local Hit (Streaming)")
             content = local_response["content"]
             chunk_size = 5
             for i in range(0, len(content), chunk_size):
                 yield {"content": content[i:i+chunk_size], "finish_reason": None}
                 await asyncio.sleep(0.02)
             yield {"content": "", "finish_reason": "stop"}
             return

        # 2. Real API Stream
        try:
            response_stream = await self.model_instance.generate_content_async(
                prompt,
                stream=True,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=kwargs.get("max_tokens", 1000),
                    temperature=kwargs.get("temperature", 0.7),
                )
            )
            
            full_text = ""
            async for chunk in response_stream:
                text_chunk = chunk.text
                full_text += text_chunk
                yield {"content": text_chunk, "finish_reason": None}
            
            # Cache the full result after streaming is done
            response_cache.set(prompt, {"content": full_text, "model": self.model})
            
            yield {"content": "", "finish_reason": "stop"}

        except Exception as e:
            self.logger.error("Gemini Stream Error", error=str(e))
            yield {"content": f"\n\n[System Error: {str(e)}]", "finish_reason": "error"}

    
    async def health_check(self) -> bool:
        if self.api_key == "MOCK_LINK": return True
        return self.api_key and len(self.api_key) > 20


class OpenAIService(LLMService):
    """OpenAI API service implementation."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.client = openai.AsyncOpenAI(
            api_key=self.api_key,
            base_url=config.get("base_url", "https://api.openai.com/v1")
        )
        self.logger.info(f"OpenAI service initialized (Base URL: {self.client.base_url})")
    
    async def generate_content(self, prompt: str, **kwargs) -> Dict[str, Any]:
        # Implement standard call (similar logic to Gemini)
        # Omitted for brevity since main focus is streaming
        pass

    async def generate_content_stream(self, prompt: str, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream content using OpenAI API."""
        
        # 1. Smart Router
        local_response = smart_router.route_request(prompt)
        if local_response:
             content = local_response["content"]
             chunk_size = 5
             for i in range(0, len(content), chunk_size):
                 yield {"content": content[i:i+chunk_size], "finish_reason": None}
                 await asyncio.sleep(0.02)
             yield {"content": "", "finish_reason": "stop"}
             return

        # 2. Real API Stream
        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=kwargs.get("max_tokens", 1000),
                temperature=kwargs.get("temperature", 0.7),
                stream=True
            )
            
            full_text = ""
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    text_chunk = chunk.choices[0].delta.content
                    full_text += text_chunk
                    yield {"content": text_chunk, "finish_reason": None}
            
            response_cache.set(prompt, {"content": full_text, "model": self.model})
            yield {"content": "", "finish_reason": "stop"}

        except Exception as e:
            self.logger.error("OpenAI Stream Error", error=str(e))
            yield {"content": f"\n\n[System Error: {str(e)}]", "finish_reason": "error"}

    async def health_check(self) -> bool:
        return True # Simplified

class ClaudeService(LLMService):
     # Placeholder
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
    
    async def generate_content(self, prompt: str, **kwargs) -> Dict[str, Any]:
        pass
    async def generate_content_stream(self, prompt: str, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        pass
    async def health_check(self) -> bool:
        return False

class LLMServiceFactory:
    """Factory for creating LLM service instances."""
    
    @staticmethod
    def create_service() -> LLMService:
        """Create and return appropriate LLM service based on configuration."""
        config = get_llm_config()
        
        # Check for Mock Mode
        api_key = config.get("api_key", "")
        if not api_key or "PLACEHOLDER" in api_key or "MOCK" in api_key:
            from services.mock_agent import MockLLMService
            print("[WARNING] API Key not found or is placeholder. Switching to MOCK MODE.")
            return MockLLMService()

        if config["provider"] == "gemini":
            return GeminiService(config)
        elif config["provider"] == "openai":
            return OpenAIService(config)
        elif config["provider"] == "claude":
            return ClaudeService(config)
        else:
            raise ValueError(f"Unsupported LLM provider: {config['provider']}")


class LLMServiceManager(LoggerMixin):
    """Manager for LLM service operations."""
    
    def __init__(self):
        super().__init__()
        self.service = None
        self.initialized = False
    
    async def initialize(self) -> bool:
        try:
            if not settings.validate_llm_config():
                self.logger.log_error("LLM configuration is invalid")
                return False
            
            self.service = LLMServiceFactory.create_service()
            self.initialized = await self.service.health_check()
            return self.initialized
            
        except Exception as e:
            self.logger.error("Failed to initialize LLM service", error=str(e))
            return False
    
    async def generate_content_stream(self, prompt: str, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        if not self.initialized or not self.service:
             yield {"content": "System Error: Service not initialized", "finish_reason": "error"}
             return

        async for chunk in self.service.generate_content_stream(prompt, **kwargs):
            yield chunk

    async def generate_content(self, prompt: str, **kwargs) -> Dict[str, Any]:
        if not self.initialized or not self.service:
            raise LLMError("LLM service not initialized")
        return await self.service.generate_content(prompt, **kwargs)
    
    async def health_check(self) -> Dict[str, Any]:
        # Simplified health check
        return {"status": "healthy", "provider": self.service.provider if self.service else None}