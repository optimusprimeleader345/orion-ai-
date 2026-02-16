"""
Input validation agent for the AI system.
Validates and sanitizes user input before processing.
"""

import re
from typing import Any, Dict
from agents.base_agent import BaseAgent, AgentValidationError


class InputValidationAgent(BaseAgent):
    """Agent responsible for validating and sanitizing user input."""
    
    def __init__(self, **kwargs):
        super().__init__("validation_agent", **kwargs)
        self.logger.info("Input validation agent initialized")
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and sanitize user input.
        
        Args:
            input_data: Contains 'user_input' key with the input string
            
        Returns:
            Dict with validated and sanitized input
            
        Raises:
            AgentValidationError: If input validation fails
        """
        self.validate_input(input_data, ["user_input"])
        
        user_input = input_data["user_input"]
        
        # Basic validation
        if not isinstance(user_input, str):
            raise AgentValidationError("User input must be a string")
        
        if len(user_input.strip()) == 0:
            raise AgentValidationError("User input cannot be empty")
        
        # Security validation - check for potentially harmful content
        if self._contains_malicious_content(user_input):
            raise AgentValidationError("Input contains potentially harmful content")
        
        # Length validation
        if len(user_input) > 10000:
            raise AgentValidationError("Input too long (max 10000 characters)")
        
        # Sanitize input
        sanitized_input = self._sanitize_input(user_input)
        
        # Content analysis
        content_analysis = self._analyze_content(sanitized_input)
        
        result = {
            "validated_input": sanitized_input,
            "content_type": content_analysis["type"],
            "content_length": len(sanitized_input),
            "contains_sensitive_data": content_analysis["contains_sensitive"],
            "validation_metadata": {
                "original_length": len(user_input),
                "sanitized_length": len(sanitized_input),
                "validation_passed": True
            }
        }
        
        self.logger.info(
            "Input validation completed successfully",
            content_type=result["content_type"],
            input_length=result["content_length"]
        )
        
        return result
    
    def _contains_malicious_content(self, text: str) -> bool:
        """
        Check if text contains potentially malicious content.
        
        Args:
            text: Input text to check
            
        Returns:
            True if malicious content is detected
        """
        # SQL injection patterns
        sql_patterns = [
            r"(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b).*",
            r"'.*'.*",
            r";.*",
        ]
        
        # XSS patterns
        xss_patterns = [
            r"<script.*?>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
        ]
        
        # Command injection patterns
        command_patterns = [
            r"\|\|.*",
            r";.*",
            r"&.*",
            r"\$\(.*\)",
        ]
        
        all_patterns = sql_patterns + xss_patterns + command_patterns
        
        for pattern in all_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                self.logger.warning("Potentially malicious content detected", pattern=pattern)
                return True
        
        return False
    
    def _sanitize_input(self, text: str) -> str:
        """
        Sanitize input text by removing potentially harmful characters.
        
        Args:
            text: Input text to sanitize
            
        Returns:
            Sanitized text
        """
        # Remove null bytes
        sanitized = text.replace('\x00', '')
        
        # Remove excessive whitespace
        sanitized = ' '.join(sanitized.split())
        
        # Escape HTML characters
        sanitized = sanitized.replace('&', '&').replace('<', '<').replace('>', '>')
        
        return sanitized.strip()
    
    def _analyze_content(self, text: str) -> Dict[str, Any]:
        """
        Analyze content to determine type and characteristics.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dict with content analysis results
        """
        # Determine content type
        if text.isdigit():
            content_type = "numeric"
        elif re.match(r'^[a-zA-Z\s]+$', text):
            content_type = "text"
        elif re.match(r'^[a-zA-Z0-9\s]+$', text):
            content_type = "alphanumeric"
        else:
            content_type = "mixed"
        
        # Check for sensitive data patterns
        sensitive_patterns = [
            r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
            r'\b\d{16}\b',  # Credit card
            r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',  # Email
            r'\b\d{3}-\d{3}-\d{4}\b',  # Phone number
        ]
        
        contains_sensitive = any(
            re.search(pattern, text, re.IGNORECASE) 
            for pattern in sensitive_patterns
        )
        
        return {
            "type": content_type,
            "contains_sensitive": contains_sensitive,
            "word_count": len(text.split()),
            "character_count": len(text)
        }