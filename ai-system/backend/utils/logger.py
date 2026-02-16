"""
Structured logging utility for the AI system.
Provides consistent logging across all components.
"""

import logging
import sys
from typing import Any, Dict, Optional
import structlog
from colorlog import ColoredFormatter


def setup_logging(log_level: str = "INFO") -> None:
    """Set up structured logging with color formatting."""
    
    def ascii_only(logger, method_name, event_dict):
        """Ensure all log values are ASCII safe for Windows terminal."""
        for key, value in event_dict.items():
            if isinstance(value, str):
                event_dict[key] = value.encode('ascii', errors='replace').decode('ascii')
        return event_dict

    # Configure structlog processors
    processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        ascii_only, # Custom ASCII safety layer
        structlog.processors.JSONRenderer() if log_level == "INFO" else structlog.dev.ConsoleRenderer(),
    ]
    
    # Configure logging with UTF-8 support for Windows
    import io
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(message)s"))
    
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        handlers=[handler]
    )
    
    # Configure structlog
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> structlog.BoundLogger:
    """Get a configured logger instance."""
    return structlog.get_logger(name)


class LoggerMixin:
    """Mixin class to add logging capabilities to classes."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = get_logger(self.__class__.__name__)
    
    def log_info(self, message: str, **kwargs: Any) -> None:
        """Log an info message."""
        self.logger.info(message, **kwargs)
    
    def log_warning(self, message: str, **kwargs: Any) -> None:
        """Log a warning message."""
        self.logger.warning(message, **kwargs)
    
    def log_error(self, message: str, **kwargs: Any) -> None:
        """Log an error message."""
        self.logger.error(message, **kwargs)
    
    def log_debug(self, message: str, **kwargs: Any) -> None:
        """Log a debug message."""
        self.logger.debug(message, **kwargs)
    
    def log_exception(self, message: str, **kwargs: Any) -> None:
        """Log an exception with traceback."""
        self.logger.exception(message, **kwargs)