# SentinelAI: Active Intelligence Engine

A production-grade AI system with agent orchestration using the `antigravity` framework, specialized operational modes, and a high-fidelity React frontend.

## 🚀 Quick Start (Docker)

This project is fully containerized. Run the complete stack (Backend + Database) with one command:

```bash
docker-compose up --build
```

The system will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`

### CI/CD
Automated builds and linting are configured via GitHub Actions in [.github/workflows/ci.yml](.github/workflows/ci.yml).

A production-grade AI system with agent orchestration using antigravity framework, external LLM APIs, and FastAPI backend.

## Features

- **Multi-Agent Orchestration**: Coordinate specialized agents using antigravity framework
- **External LLM Integration**: Connect to Gemini, OpenAI, or Claude APIs
- **Production Ready**: Comprehensive error handling, logging, and monitoring
- **FastAPI Backend**: Modern, fast, and well-documented API
- **Containerized**: Docker support for easy deployment
- **Deterministic Output**: Consistent, predictable results

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │───▶│   FastAPI API    │───▶│ Agent Workflow  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   LLM Service   │◀───│ Agent Orchestration│◀───│ Input Validation│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Output Format  │───▶│  Quality Assurance│───▶│  Final Output   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ai-system
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Choose your LLM provider
LLM_PROVIDER=GEMINI

# Configure your chosen provider
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro

# Or for OpenAI
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-4

# Or for Claude
# CLAUDE_API_KEY=your_claude_api_key_here
# CLAUDE_MODEL=claude-sonnet
```

### 4. Run the Application

```bash
cd backend
python main.py
```

The API will be available at `http://localhost:8000`

### 5. Test the API

```bash
curl -X POST "http://localhost:8000/api/process" \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "Explain the concept of artificial intelligence in simple terms.",
    "request_id": "test-001"
  }'
```

## API Endpoints

### Health Check
```bash
GET /health
```

### System Status
```bash
GET /status
```

### Process Request
```bash
POST /api/process
Content-Type: application/json

{
  "user_input": "Your input text here",
  "request_id": "optional-request-id",
  "metadata": {}
}
```

### Configuration
```bash
GET /api/config
```

## 🧠 AI Operational Modes

The system features three specialized engines that can be toggled via the Sidebar:

1.  **Standard Operations**: Balanced, high-speed conversational intelligence.
2.  **Deep Research**: Context-heavy engine designed for searching and analyzing global knowledge graphs.
3.  **Coding Logic**: Strict, syntax-aware engine optimized for debugging, refactoring, and software architecture.

### Dynamic Thinking UI
The frontend displays the real-time logical steps of the AI Planner:
- **Thoughts**: Introspection and planning phases.
- **Actions**: Execution of internal modules or external tools.
- **Tokens**: Real-time streaming output of the final response.

## 🐳 Docker Deployment

### Services
- **Backend**: FastAPI (Python 3.11-slim)
- **Database**: PostgreSQL 15 (Alpine)

### Management
```bash
# Start all services
docker-compose up -d

# View real-time logs
docker-compose logs -f
```

## Agent Architecture

### Input Validation Agent
- Validates and sanitizes user input
- Security checks for malicious content
- Content type analysis

### Task Analysis Agent
- Breaks down complex requests into steps
- Determines processing requirements
- Assigns complexity levels

### Content Processing Agent
- Handles text analysis and generation
- Integrates with external LLM APIs
- Manages processing workflows

### Quality Assurance Agent
- Reviews outputs for quality
- Ensures consistency and accuracy
- Validates output format

### Output Formatting Agent
- Formats final results
- Ensures proper response structure
- Handles different output formats

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | "AI System" |
| `APP_VERSION` | Application version | "1.0.0" |
| `DEBUG` | Debug mode | false |
| `LOG_LEVEL` | Logging level | "INFO" |
| `HOST` | Server host | "0.0.0.0" |
| `PORT` | Server port | 8000 |
| `LLM_PROVIDER` | LLM provider | "GEMINI" |
| `MAX_RETRIES` | Max retry attempts | 3 |
| `TIMEOUT_SECONDS` | Request timeout | 30 |
| `CONCURRENT_AGENTS` | Max concurrent agents | 5 |

### LLM Provider Configuration

#### Gemini
```bash
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-pro
```

#### OpenAI
```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4
```

#### Claude
```bash
CLAUDE_API_KEY=your_api_key
CLAUDE_MODEL=claude-sonnet
```

## Monitoring and Logging

### Health Checks
- `/health` - Basic health check
- `/status` - Detailed system status
- Docker health checks for container monitoring

### Logging
- Structured logging with JSON format
- Colorized output in development
- Log rotation and management
- Request/response logging

### Metrics (Optional)
- Prometheus integration available
- Grafana dashboards for visualization
- Custom metrics for agent performance

## Testing

### Unit Tests
```bash
cd backend
pytest tests/
```

### Integration Tests
```bash
cd backend
pytest tests/integration/
```

### Load Testing
```bash
# Example with curl
for i in {1..10}; do
  curl -X POST "http://localhost:8000/api/process" \
    -H "Content-Type: application/json" \
    -d '{"user_input": "Test input '"$i"'"}' &
done
```

## Production Deployment

### Security Considerations
- Use HTTPS in production
- Configure CORS appropriately
- Secure API keys and secrets
- Implement rate limiting
- Use non-root user in containers

### Performance Optimization
- Adjust `CONCURRENT_AGENTS` based on resources
- Configure `TIMEOUT_SECONDS` for your use case
- Monitor memory usage with large inputs
- Consider caching for frequent requests

### Scaling
- Use Docker Swarm or Kubernetes for orchestration
- Implement load balancing
- Scale agents based on demand
- Monitor resource usage

## Troubleshooting

### Common Issues

1. **LLM API Connection Failed**
   - Check API key configuration
   - Verify network connectivity
   - Check rate limits

2. **Agent Timeout**
   - Increase `TIMEOUT_SECONDS`
   - Check LLM API response times
   - Monitor system resources

3. **Validation Errors**
   - Check input format requirements
   - Verify content doesn't contain malicious patterns
   - Review security filters

### Logs
Check application logs for detailed error information:
```bash
# Development
python backend/main.py

# Docker
docker-compose logs ai-system

# Production
tail -f logs/app.log
```

## Development

### Adding New Agents
1. Create agent class inheriting from `BaseAgent`
2. Implement the `execute` method
3. Add to workflow orchestration
4. Update configuration if needed

### Adding New LLM Providers
1. Create service class inheriting from `LLMService`
2. Implement required methods
3. Update `LLMServiceFactory`
4. Add configuration options

### Customizing Workflow
1. Modify `AgentWorkflow` class
2. Add new processing steps
3. Update error handling
4. Test thoroughly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

[Add your license information here]

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

### 🛡️ Security & Stability
- **Windows Optimized**: UTF-8/ASCII safe logging and file I/O for stability on Windows terminals.
- **Persistence**: Hybrid PostgreSQL/Local storage for conversation history.
- **Rate Limiting**: Integrated SlowAPI middleware for endpoint protection.
```

## Deployment & DevOps

This project is containerized using Docker and Docker Compose.

### Quick Start (Full Stack)
```bash
docker-compose up --build
```

### CI/CD
Automated builds and linting are configured via GitHub Actions in `.github/workflows/ci.yml`.