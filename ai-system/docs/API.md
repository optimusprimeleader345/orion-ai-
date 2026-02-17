# Orion AI API Documentation

This document provides comprehensive API documentation for the Orion AI system, including endpoint specifications, request/response formats, and usage examples.

## Table of Contents

1. [Base Information](#base-information)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [System Status](#system-status)
   - [Stream Processing](#stream-processing)
   - [Configuration](#configuration)
   - [Session Management](#session-management)
5. [WebSocket API](#websocket-api)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

## Base Information

**Base URL**: `http://localhost:8000/api`

**API Version**: v1

**Content-Type**: `application/json`

**WebSocket URL**: `ws://localhost:8000/ws`

## Authentication

The Orion AI API uses API key authentication for external integrations:

```bash
# Include in request headers
Authorization: Bearer your_api_key_here
```

**Note**: For local development, authentication is optional. In production, API keys are required and should be configured in the environment variables.

## Error Handling

The API returns standard HTTP status codes and error responses:

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "user_input",
        "message": "Field is required"
      }
    ],
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Endpoints

### Health Check

**GET** `/health`

Returns basic system health status.

#### Response

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00Z",
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

**GET** `/api/status`

Returns detailed system status including active agents and configuration.

#### Response

```json
{
  "system_health": "OPTIMAL",
  "active_agents": 3,
  "total_agents": 5,
  "agent_status": [
    {
      "agent_id": "orchestrator-01",
      "status": "idle",
      "last_activity": "2024-01-01T12:00:00Z",
      "error_count": 0,
      "success_count": 142
    },
    {
      "agent_id": "researcher-01",
      "status": "idle",
      "last_activity": "2024-01-01T12:05:00Z",
      "error_count": 0,
      "success_count": 89
    },
    {
      "agent_id": "coder-01",
      "status": "idle",
      "last_activity": "2024-01-01T11:50:00Z",
      "error_count": 1,
      "success_count": 215
    }
  ],
  "llm_provider": "gemini",
  "configuration_valid": true
}
```

### Stream Processing

**POST** `/api/stream`

Processes user input with real-time streaming response. This is the main endpoint for AI interactions.

#### Request

```json
{
  "user_input": "Explain quantum computing in simple terms",
  "request_id": "req_123456",
  "metadata": {
    "session_id": "session_789",
    "active_mode": "Standard Operations",
    "user_id": "user_abc"
  }
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_input` | string | Yes | The user's query or request |
| `request_id` | string | No | Unique identifier for the request |
| `metadata` | object | No | Additional metadata for the request |
| `metadata.session_id` | string | No | Session identifier for conversation history |
| `metadata.active_mode` | string | No | Operational mode (Standard Operations, Deep Research, Coding Logic) |
| `metadata.user_id` | string | No | User identifier for analytics |

#### Response Stream

The response is a stream of JSON objects, each representing a different stage of processing:

```json
{"type": "thought", "content": "Analyzing user intent and determining appropriate response strategy..."}
{"type": "action", "content": "Executing content processing with Gemini API"}
{"type": "token", "content": "Quantum computing is a type of computing that uses quantum mechanics to process information."}
{"type": "token", "content": " Unlike classical computers that use bits (0s and 1s), quantum computers use quantum bits or qubits."}
{"type": "token", "content": " Qubits can exist in multiple states simultaneously, allowing for parallel processing."}
{"type": "tool_output", "content": "Source: knowledge_base"}
```

#### Stream Event Types

| Event Type | Description |
|------------|-------------|
| `thought` | AI's internal reasoning and planning |
| `action` | Execution of specific operations or tools |
| `token` | Streaming response content |
| `tool_output` | Information about tools used or sources |
| `error` | Error information if processing fails |

### Configuration

**GET** `/api/config`

Retrieves current system configuration.

#### Response

```json
{
  "app_name": "Orion AI",
  "app_version": "1.0.0",
  "llm_provider": "gemini",
  "gemini_model": "gemini-pro",
  "debug": false,
  "max_retries": 3,
  "timeout_seconds": 30,
  "concurrent_agents": 5,
  "configuration_valid": true
}
```

**POST** `/api/config`

Updates system configuration.

#### Request

```json
{
  "gemini_model": "gemini-1.5-pro"
}
```

#### Response

```json
{
  "status": "success",
  "message": "Configuration updated",
  "changes": [
    "gemini_model: gemini-1.5-pro"
  ]
}
```

### Session Management

**POST** `/api/sessions`

Creates a new chat session.

#### Request

```json
{
  "title": "Quantum Computing Research"
}
```

#### Response

```json
{
  "session_id": "session_12345",
  "title": "Quantum Computing Research",
  "created_at": "2024-01-01T12:00:00Z"
}
```

**GET** `/api/sessions/{session_id}/history`

Retrieves conversation history for a specific session.

#### Response

```json
[
  {
    "role": "user",
    "content": "What is quantum computing?",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  {
    "role": "assistant",
    "content": "Quantum computing is...",
    "timestamp": "2024-01-01T12:00:05Z"
  }
]
```

## WebSocket API

The WebSocket API provides real-time communication for streaming responses.

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to Orion AI WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
```

### Sending Messages

```javascript
const message = {
  type: 'process_request',
  data: {
    user_input: 'Your query here',
    metadata: {
      session_id: 'session_123',
      active_mode: 'Standard Operations'
    }
  }
};

ws.send(JSON.stringify(message));
```

### WebSocket Message Types

| Message Type | Description |
|--------------|-------------|
| `process_request` | Process a new user request |
| `get_status` | Get system status |
| `ping` | Keep connection alive |

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Global Rate Limit**: 20 requests per minute per IP address
- **Streaming Rate Limit**: 10 concurrent streaming connections per IP
- **Burst Limit**: 5 requests can be made immediately, then rate limiting applies

### Rate Limit Headers

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1609459200
```

### Handling Rate Limits

When rate limited, the API returns:
- Status Code: `429 Too Many Requests`
- Response: Rate limit error with retry information

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

## Examples

### Basic Request with cURL

```bash
curl -X POST "http://localhost:8000/api/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "Explain machine learning",
    "metadata": {
      "active_mode": "Standard Operations"
    }
  }'
```

### JavaScript Example

```javascript
async function processRequest(userInput, sessionId) {
  const response = await fetch('/api/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_input: userInput,
      metadata: {
        session_id: sessionId,
        active_mode: 'Standard Operations'
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
        handleStreamEvent(event);
      }
    }
  }
}

function handleStreamEvent(event) {
  switch (event.type) {
    case 'thought':
      console.log('AI Thinking:', event.content);
      break;
    case 'token':
      console.log('Response:', event.content);
      break;
    case 'error':
      console.error('Error:', event.content);
      break;
  }
}
```

### Python Example

```python
import requests
import json

def stream_request(user_input, session_id=None):
    url = "http://localhost:8000/api/stream"
    
    payload = {
        "user_input": user_input,
        "metadata": {
            "session_id": session_id,
            "active_mode": "Standard Operations"
        }
    }
    
    response = requests.post(url, json=payload, stream=True)
    
    for line in response.iter_lines():
        if line:
            event = json.loads(line.decode('utf-8'))
            handle_event(event)

def handle_event(event):
    if event['type'] == 'token':
        print(event['content'], end='', flush=True)
    elif event['type'] == 'thought':
        print(f"[AI Thought] {event['content']}")
    elif event['type'] == 'error':
        print(f"[Error] {event['content']}")

# Usage
stream_request("What is artificial intelligence?", "session_123")
```

### WebSocket Example

```javascript
class OrionAIClient {
  constructor(url = 'ws://localhost:8000/ws') {
    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('Connected to Orion AI');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log('Connection closed');
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'stream_event':
        this.handleStreamEvent(data.event);
        break;
      case 'error':
        console.error('WebSocket Error:', data.message);
        break;
    }
  }

  handleStreamEvent(event) {
    // Handle streaming events
    console.log(event);
  }

  processRequest(userInput, options = {}) {
    const message = {
      type: 'process_request',
      data: {
        user_input: userInput,
        metadata: options
      }
    };

    this.ws.send(JSON.stringify(message));
  }
}

// Usage
const client = new OrionAIClient();
client.processRequest("Hello, Orion AI!", {
  session_id: "session_123",
  active_mode: "Standard Operations"
});
```

This API documentation provides everything needed to integrate with the Orion AI system, whether through HTTP requests or WebSocket connections. The streaming capabilities enable real-time interaction, while the comprehensive error handling ensures robust integration.