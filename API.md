# 🔧 Orion AI API Documentation

## Overview

The Orion AI API provides a comprehensive interface for interacting with the multi-agent AI system. This document describes all available endpoints, request/response formats, and authentication requirements.

## Base URLs

- **Development**: `http://localhost:8000`
- **Production**: `https://api.orion-ai.example.com`

## Authentication

### API Keys

All API requests require authentication via API keys. Include your API key in the `Authorization` header:

```http
Authorization: Bearer your-api-key-here
```

### Rate Limiting

- **Standard Users**: 20 requests per minute
- **Premium Users**: 100 requests per minute
- **Enterprise Users**: 1000 requests per minute

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Response Format

All API responses follow a consistent JSON structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "error": null,
  "metadata": {
    "timestamp": "2024-02-14T12:00:00Z",
    "request_id": "req_123456789"
  }
}
```

For errors:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "The provided input is invalid",
    "details": {
      "field": "user_input",
      "reason": "Input cannot be empty"
    }
  },
  "metadata": {
    "timestamp": "2024-02-14T12:00:00Z",
    "request_id": "req_123456789"
  }
}
```

## Endpoints

### Health Check

#### GET /health

Returns system health status and service availability.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-02-14T12:00:00Z",
  "services": {
    "orchestrator": "active",
    "database": "connected",
    "llm": "gemini"
  },
  "configuration": {
    "debug": false,
    "llm_provider": "gemini"
  }
}
```

### System Status

#### GET /api/status

Returns detailed system status including active agents and configuration.

**Response:**
```json
{
  "system_health": "OPTIMAL",
  "active_agents": 3,
  "total_agents": 5,
  "agent_status": [
    {
      "agent_id": "orchestrator-01",
      "status": "idle",
      "last_activity": "2024-02-14T12:00:00Z",
      "error_count": 0,
      "success_count": 142
    }
  ],
  "llm_provider": "gemini",
  "configuration_valid": true
}
```

### Configuration Management

#### GET /api/config

Retrieve current system configuration.

**Response:**
```json
{
  "app_name": "Orion AI",
  "app_version": "1.0.0",
  "llm_provider": "gemini",
  "gemini_model": "gemini-1.5-pro",
  "debug": false,
  "max_retries": 3,
  "timeout_seconds": 30,
  "concurrent_agents": 5,
  "configuration_valid": true
}
```

#### POST /api/config

Update system configuration.

**Request:**
```json
{
  "gemini_model": "gemini-1.5-flash"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Configuration updated",
  "changes": ["gemini_model: gemini-1.5-flash"]
}
```

### Authentication

#### POST /api/auth/register

Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "email",
    "avatar": null
  }
}
```

#### POST /api/auth/login

Authenticate an existing user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "email",
    "avatar": null
  }
}
```

#### POST /api/auth/google

Authenticate using Google OAuth.

**Request:**
```json
{
  "profile": {
    "email": "john@gmail.com",
    "name": "John Doe",
    "picture": "https://example.com/avatar.jpg"
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123456789",
    "name": "John Doe",
    "email": "john@gmail.com",
    "provider": "google",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### Session Management

#### POST /api/sessions

Create a new chat session.

**Request:**
```json
{
  "title": "My Conversation"
}
```

**Response:**
```json
{
  "session_id": "session_123456789",
  "title": "My Conversation"
}
```

#### GET /api/sessions/{session_id}/history

Retrieve conversation history for a specific session.

**Response:**
```json
[
  {
    "role": "user",
    "content": "Hello, how are you?",
    "timestamp": "2024-02-14T12:00:00Z"
  },
  {
    "role": "assistant",
    "content": "I'm doing great, thank you for asking!",
    "timestamp": "2024-02-14T12:00:05Z"
  }
]
```

### AI Processing

#### POST /api/stream

Process a user query with real-time streaming response.

**Request:**
```json
{
  "user_input": "Explain quantum computing in simple terms",
  "request_id": "req_123456789",
  "metadata": {
    "session_id": "session_123456789",
    "active_mode": "Standard Operations"
  }
}
```

**Streaming Response Events:**

1. **Thought Process:**
```json
{"type": "thought", "content": "Analyzing user intent and query complexity..."}
```

2. **Action Events:**
```json
{"type": "action", "content": "Executing research protocol..."}
```

3. **Token Stream:**
```json
{"type": "token", "content": "Here's"}
{"type": "token", "content": " the"}
{"type": "token", "content": " answer..."}
```

4. **Tool Output:**
```json
{"type": "tool_output", "content": "Source: knowledge_base"}
```

5. **Completion:**
```json
{"type": "completion", "content": "Response completed successfully"}
```

6. **Error:**
```json
{"type": "error", "content": "An error occurred during processing"}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Request contains invalid data |
| `UNAUTHORIZED` | 401 | Authentication required or invalid |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### SDK Examples

#### Python
```python
import requests
import json

class OrionAIClient:
    def __init__(self, api_key, base_url="http://localhost:8000"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def stream_query(self, user_input, session_id=None, active_mode="Standard Operations"):
        url = f"{self.base_url}/api/stream"
        payload = {
            "user_input": user_input,
            "metadata": {
                "session_id": session_id,
                "active_mode": active_mode
            }
        }
        
        response = requests.post(url, headers=self.headers, json=payload, stream=True)
        
        for line in response.iter_lines():
            if line:
                event = json.loads(line.decode('utf-8'))
                yield event

# Usage
client = OrionAIClient("your-api-key")
for event in client.stream_query("What is AI?"):
    if event["type"] == "token":
        print(event["content"], end="", flush=True)
```

#### JavaScript
```javascript
class OrionAIClient {
    constructor(apiKey, baseUrl = "http://localhost:8000") {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        };
    }
    
    async streamQuery(userInput, sessionId = null, activeMode = "Standard Operations") {
        const response = await fetch(`${this.baseUrl}/api/stream`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                user_input: userInput,
                metadata: {
                    session_id: sessionId,
                    active_mode: activeMode
                }
            })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.trim()) {
                    const event = JSON.parse(line);
                    yield event;
                }
            }
        }
    }
}

// Usage
const client = new OrionAIClient("your-api-key");
const stream = client.streamQuery("What is AI?");
for await (const event of stream) {
    if (event.type === "token") {
        process.stdout.write(event.content);
    }
}
```

### Webhook Integration

Orion AI supports webhook callbacks for asynchronous processing:

#### Webhook Configuration

Set the `webhook_url` in your request metadata:

```json
{
  "user_input": "Process this document",
  "metadata": {
    "webhook_url": "https://your-app.com/webhook"
  }
}
```

#### Webhook Payload

```json
{
  "event_type": "response_completed",
  "request_id": "req_123456789",
  "session_id": "session_123456789",
  "response": {
    "content": "Here is your response...",
    "mode": "Standard Operations",
    "processing_time": 2.5
  },
  "timestamp": "2024-02-14T12:00:00Z"
}
```

### Best Practices

1. **Error Handling**: Always implement proper error handling for network issues and API errors
2. **Rate Limiting**: Monitor rate limit headers and implement backoff strategies
3. **Session Management**: Use sessions to maintain conversation context
4. **Streaming**: Handle streaming responses properly to provide real-time user experience
5. **Security**: Never expose API keys in client-side code
6. **Caching**: Implement caching for frequently requested responses to reduce costs

### Troubleshooting

#### Common Issues

1. **Authentication Errors**
   - Verify API key format and permissions
   - Check for expired tokens

2. **Rate Limiting**
   - Implement exponential backoff
   - Monitor rate limit headers

3. **Streaming Issues**
   - Ensure proper handling of NDJSON format
   - Implement connection retry logic

4. **Session Problems**
   - Verify session IDs are valid
   - Check session expiration

#### Support

For additional support:
- **Documentation**: [API Reference](https://docs.orion-ai.example.com)
- **Issues**: [GitHub Issues](https://github.com/optimusprimeleader345/orion-ai-/issues)
- **Community**: [Discord](https://discord.gg/orion-ai)