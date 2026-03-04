# 🛠️ Orion AI Development Guide

## Getting Started

This guide provides comprehensive instructions for setting up, developing, and contributing to the Orion AI project.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **Docker**: 24 or higher
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 10GB free space

### Development Tools
- **Code Editor**: VS Code (recommended) with Python and TypeScript extensions
- **Git**: Version control
- **Terminal**: PowerShell, Command Prompt, or Terminal

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/optimusprimeleader345/orion-ai-.git
cd orion-ai-
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd ai-system/backend
python -m venv venv
```

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```bash
# Application Settings
DEBUG=true
LOG_LEVEL=DEBUG
HOST=0.0.0.0
PORT=8000

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/orion_ai

# LLM Provider Configuration
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro

# Security
SECRET_KEY=your_secret_key_here
```

#### Initialize Database
```bash
python database/create_db.py
```

#### Run Backend Server
```bash
python main.py
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

#### Run Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Docker Development Setup

#### Development Docker Compose
Use the development configuration for local development:

```bash
cd ..
docker-compose -f docker-compose.yml up --build
```

#### Development Features
- **Hot Reloading**: Automatic restart on code changes
- **Volume Mounts**: Code changes reflected immediately
- **Debug Mode**: Enhanced logging and debugging
- **Development Database**: SQLite for faster development

## Project Structure

### Backend Structure
```
backend/
├── main.py                    # FastAPI application entry point
├── api/
│   ├── __init__.py
│   └── schemas.py             # Pydantic models and request/response schemas
├── services/
│   ├── __init__.py
│   ├── llm_service.py         # LLM provider integration
│   ├── config.py              # Configuration management
│   ├── security.py            # Security utilities and middleware
│   ├── cache_service.py       # Caching layer implementation
│   ├── smart_router.py        # Smart routing logic
│   ├── mock_agent.py          # Mock agent for testing
│   └── __pycache__/           # Python cache files
├── orchestration/
│   ├── __init__.py
│   ├── workflow.py            # Agent workflow engine
│   └── features.py            # Feature management and flags
├── agents/
│   ├── __init__.py
│   ├── base_agent.py          # Base agent class and interfaces
│   └── validation_agent.py    # Input validation agent implementation
├── database/
│   ├── __init__.py
│   ├── models.py              # SQLAlchemy database models
│   ├── db_manager.py          # Database operations and session management
│   └── create_db.py           # Database initialization and migrations
├── tests/
│   ├── __init__.py
│   ├── test_api.py            # API endpoint tests
│   ├── test_workflow.py       # Workflow engine tests
│   ├── test_agents.py         # Agent functionality tests
│   └── __pycache__/           # Test cache files
├── utils/
│   ├── __init__.py
│   └── logger.py              # Logging configuration and utilities
├── requirements.txt           # Python dependencies
├── requirements-dev.txt       # Development dependencies
└── .env.example             # Environment variables template
```

### Frontend Structure
```
frontend/
├── index.html                 # Main HTML entry point
├── package.json               # NPM dependencies and scripts
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.node.json         # Node.js TypeScript configuration
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── src/
│   ├── main.tsx               # React application entry point
│   ├── index.css              # Global styles
│   ├── App.tsx                # Main App component
│   ├── components/            # Reusable UI components
│   │   ├── ChatInterface.tsx  # Main chat interface component
│   │   ├── MessageList.tsx    # Message display component
│   │   ├── InputArea.tsx      # User input component
│   │   ├── TypingIndicator.tsx # Typing animation component
│   │   ├── SettingsPanel.tsx  # Configuration panel
│   │   └── ModeSelector.tsx   # Operational mode selector
│   ├── pages/                 # Page components
│   │   ├── Dashboard.tsx      # Main application dashboard
│   │   ├── LandingPage.tsx    # Landing page
│   │   ├── LoginPage.tsx      # Authentication page
│   │   └── RegisterPage.tsx   # User registration page
│   ├── services/              # API communication layer
│   │   └── api.ts             # API client and endpoints
│   ├── hooks/                 # Custom React hooks
│   │   └── useChat.ts         # Chat state management hook
│   ├── context/               # React context providers
│   │   └── AuthContext.tsx    # Authentication context
│   ├── data/                  # Mock data and fixtures
│   │   └── mockChatData.ts    # Mock chat data for development
│   └── utils/                 # Utility functions
├── public/                    # Static assets
└── assets/                    # Compiled assets
```

## Development Workflow

### 1. Feature Development

#### Creating a New Feature
1. **Create a Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Implement Backend Changes**
- Add new API endpoints in `api/schemas.py`
- Implement business logic in `services/` or `orchestration/`
- Update database models in `database/models.py` if needed

3. **Implement Frontend Changes**
- Create new components in `src/components/`
- Add new pages in `src/pages/`
- Update state management in `src/hooks/` or `src/context/`

4. **Write Tests**
- Add unit tests in `backend/tests/`
- Add frontend tests in `frontend/src/__tests__/`

5. **Update Documentation**
- Update API documentation in `docs/API.md`
- Update architecture documentation if needed

#### Code Style Guidelines

**Python (Backend)**
- Follow PEP 8 style guide
- Use type hints for all functions
- Write docstrings for all public functions and classes
- Use meaningful variable and function names

**TypeScript (Frontend)**
- Follow Airbnb TypeScript style guide
- Use TypeScript interfaces for all props and state
- Implement proper error handling
- Use functional components with hooks

### 2. Testing

#### Backend Testing

**Unit Tests**
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_api.py

# Run tests with coverage
pytest --cov=backend --cov-report=html

# Run tests in verbose mode
pytest -v
```

**Integration Tests**
```bash
# Run integration tests
pytest tests/integration/

# Run with database fixtures
pytest tests/ --db-reset
```

**Test Structure**
```python
# Example test file: tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_stream_endpoint():
    response = client.post("/api/stream", json={
        "user_input": "Hello",
        "request_id": "test-123"
    })
    assert response.status_code == 200
```

#### Frontend Testing

**Unit Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**E2E Tests**
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:headless
```

### 3. Debugging

#### Backend Debugging

**Using Python Debugger**
```python
import pdb; pdb.set_trace()  # Add breakpoint
```

**Logging Configuration**
```python
from utils.logger import get_logger
logger = get_logger("debug_module")

logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
```

**FastAPI Debug Mode**
```python
# In main.py
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, debug=True)
```

#### Frontend Debugging

**React Developer Tools**
- Install React Developer Tools browser extension
- Use React DevTools Profiler for performance analysis

**Console Logging**
```typescript
// Use structured logging
console.log('Component mounted', { props, state });
console.error('Error occurred', error);
console.warn('Warning message', warningData);
```

**Vite Debug Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    host: true,
    hmr: true
  },
  build: {
    sourcemap: true
  }
});
```

### 4. Database Development

#### Database Models
```python
# Example model in database/models.py
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "Add new field"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### 5. API Development

#### Adding New Endpoints
```python
# In api/schemas.py
from pydantic import BaseModel

class NewRequest(BaseModel):
    field1: str
    field2: int

class NewResponse(BaseModel):
    result: str
    success: bool

# In main.py
@app.post("/api/new-endpoint", response_model=NewResponse)
async def new_endpoint(request: NewRequest):
    # Implementation
    return NewResponse(result="success", success=True)
```

#### API Testing
```bash
# Test with curl
curl -X POST http://localhost:8000/api/new-endpoint \
  -H "Content-Type: application/json" \
  -d '{"field1": "value1", "field2": 42}'

# Test with HTTPie
http POST http://localhost:8000/api/new-endpoint field1="value1" field2:=42
```

## Performance Optimization

### Backend Optimization

#### Async/Await Patterns
```python
# Use async functions for I/O operations
async def process_request(user_input: str) -> str:
    # Async database queries
    result = await db.query("SELECT * FROM table")
    
    # Async HTTP requests
    response = await http_client.get("https://api.example.com")
    
    return result
```

#### Caching Strategy
```python
# Use Redis for caching
from services.cache_service import cache

@cache(ttl=300)  # Cache for 5 minutes
async def expensive_operation():
    # Expensive computation
    return result
```

#### Database Optimization
```python
# Use connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20
)
```

### Frontend Optimization

#### Code Splitting
```typescript
// Lazy load components
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Use Suspense for loading states
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

#### Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'lucide-react']
        }
      }
    }
  }
});
```

## Security Best Practices

### Input Validation
```python
# Use Pydantic for validation
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    email: str
    message: str
    
    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email')
        return v
```

### Authentication
```python
# Use JWT tokens
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    # Validate token
    if not validate_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
```

### Security Headers
```python
# Add security middleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"])
```

## Deployment

### Development Deployment
```bash
# Local development
docker-compose up --build

# Development with hot reload
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Production with monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.11
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run tests
      run: pytest
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: 18
        working-directory: frontend
    
    - name: Install frontend dependencies
      run: npm install
    
    - name: Run frontend tests
      run: npm test
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check which process is using the port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Reset database
python database/create_db.py --reset
```

#### Dependency Issues
```bash
# Clear Python cache
find . -type d -name "__pycache__" -exec rm -rf {} +
pip cache purge

# Clear Node.js cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

#### Enable Debug Logging
```bash
# Set environment variable
export DEBUG=true
export LOG_LEVEL=DEBUG

# Or in .env file
DEBUG=true
LOG_LEVEL=DEBUG
```

#### Development Tools
- **Backend**: Use `uvicorn` with `--reload` flag
- **Frontend**: Use Vite development server
- **Database**: Use pgAdmin or DBeaver for database management
- **API Testing**: Use Postman or Insomnia

## Contributing

### Pull Request Guidelines
1. Create feature branches from `develop`
2. Write clear commit messages
3. Include tests for new functionality
4. Update documentation
5. Ensure all tests pass
6. Follow code style guidelines

### Code Review Process
1. All changes require at least one approval
2. Automated tests must pass
3. Code coverage should not decrease
4. Documentation should be updated for public APIs

### Issue Reporting
When reporting issues, include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python/Node.js version)
- Error messages and stack traces
- Screenshots if applicable

This development guide provides everything needed to start contributing to Orion AI. For additional questions, refer to the project documentation or reach out to the development team.