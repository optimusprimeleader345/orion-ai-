# Orion AI - Development Guide

This guide provides instructions for developers who want to contribute to or modify the Orion AI project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Instructions](#setup-instructions)
3. [Development Workflow](#development-workflow)
4. [Code Style Guidelines](#code-style-guidelines)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Deployment](#deployment)
8. [Contributing](#contributing)

## Prerequisites

### System Requirements
- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **Docker**: 24 or higher
- **Docker Compose**: 2.0 or higher
- **PostgreSQL**: 15 or higher (optional, managed by Docker)

### Development Tools
- **IDE**: VS Code recommended with Python and TypeScript extensions
- **Git**: For version control
- **cURL**: For API testing
- **Postman**: For API development and testing

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/optimusprimeleader345/orion-ai-.git
cd orion-ai-/ai-system
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Configure your environment variables
# Edit .env file with your LLM API keys and other settings
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure frontend environment if needed
```

### 4. Database Setup
```bash
# Using Docker (recommended)
docker-compose up -d

# Or using local PostgreSQL
# 1. Install PostgreSQL locally
# 2. Create database: orion_ai
# 3. Update DATABASE_URL in .env
```

### 5. Run the Application
```bash
# Start backend
cd backend
python main.py

# In another terminal, start frontend
cd ../frontend
npm run dev
```

**Application URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Add tests for new functionality
# Update documentation if needed

# Commit changes
git add .
git commit -m "Add: your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 2. Code Review Process
1. Create a pull request
2. Ensure all tests pass
3. Address review feedback
4. Merge to main branch

### 3. Testing Before Commit
```bash
# Run backend tests
cd backend
pytest

# Run frontend tests
cd ../frontend
npm test

# Run linting
npm run lint
```

## Code Style Guidelines

### Python (Backend)
- **Formatting**: Use Black for code formatting
- **Linting**: Use flake8 for linting
- **Type Hints**: Always use type hints for function signatures
- **Imports**: Organize imports using isort

```bash
# Format code
black .

# Lint code
flake8 .

# Sort imports
isort .
```

### TypeScript (Frontend)
- **Formatting**: Use Prettier for code formatting
- **Linting**: Use ESLint for linting
- **TypeScript**: Strict mode enabled
- **Naming**: Use camelCase for variables and functions

```bash
# Format code
npm run format

# Lint code
npm run lint
```

### General Guidelines
- **Commit Messages**: Use conventional commits
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for refactoring
- **Branch Naming**: Use kebab-case
- **File Naming**: Use snake_case for Python, kebab-case for frontend files

## Testing

### Unit Tests
```bash
# Backend unit tests
cd backend
pytest tests/

# Frontend unit tests
cd ../frontend
npm test
```

### Integration Tests
```bash
# Backend integration tests
cd backend
pytest tests/integration/ -v

# End-to-end tests (when available)
npm run test:e2e
```

### Load Testing
```bash
# Simple load test
cd backend
python tests/load_test.py
```

### Test Coverage
```bash
# Generate coverage report
cd backend
pytest --cov=backend --cov-report=html
```

## Debugging

### Backend Debugging
```python
# Add debug logging
import logging
logger = logging.getLogger(__name__)
logger.debug("Debug message")

# Use Python debugger
import pdb; pdb.set_trace()

# Enable debug mode
export DEBUG=true
```

### Frontend Debugging
```typescript
// Add debug logging
console.log('Debug message:', variable);

// Use React DevTools
// Install browser extension for React debugging

// Enable development mode
npm run dev
```

### Database Debugging
```bash
# Access PostgreSQL shell
docker exec -it ai-system-db psql -U postgres -d orion_ai

# View logs
docker-compose logs backend
docker-compose logs db
```

### Common Issues

**Issue**: Port already in use
```bash
# Check what's using the port
lsof -i :8000
# Kill the process
kill -9 <PID>
```

**Issue**: Database connection failed
```bash
# Check if database is running
docker-compose ps
# Restart database
docker-compose restart db
```

**Issue**: Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Deployment

### Development Deployment
```bash
# Using Docker Compose
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Monitor
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment Variables
```bash
# Production environment variables
DEBUG=false
LOG_LEVEL=INFO
DATABASE_URL=postgresql://user:pass@prod-db:5432/orion_ai_prod
LLM_PROVIDER=GEMINI
GEMINI_API_KEY=your_production_key
```

## Contributing

### Before Contributing
1. **Read the Documentation**: Understand the project architecture
2. **Check Issues**: Look for existing issues or feature requests
3. **Discuss**: Create an issue to discuss major changes

### Contribution Guidelines
1. **Fork the Repository**: Create your own fork
2. **Create Branch**: Use descriptive branch names
3. **Write Tests**: Ensure new code has appropriate tests
4. **Update Documentation**: Keep docs up to date
5. **Code Review**: Be open to feedback and suggestions

### Code Quality Standards
- **Test Coverage**: Minimum 80% code coverage
- **Code Review**: All changes require review
- **CI/CD**: All tests must pass before merge
- **Documentation**: Update docs for new features

### Reporting Issues
When reporting issues, please include:
- **Environment**: OS, Python/Node.js version, browser
- **Steps to Reproduce**: Clear, step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Logs**: Relevant error messages

### Feature Requests
When requesting features, please include:
- **Use Case**: Why this feature is needed
- **Implementation Ideas**: How it could be implemented
- **Alternatives**: Other solutions considered
- **Impact**: How this affects the project

## Performance Optimization

### Development Tips
1. **Use Development Mode**: Enables hot reloading and debugging
2. **Monitor Resource Usage**: Watch memory and CPU usage
3. **Optimize Database Queries**: Use query profiling tools
4. **Cache Strategically**: Implement caching for expensive operations

### Production Optimization
1. **Enable Caching**: Configure Redis or similar
2. **Database Optimization**: Use connection pooling and indexing
3. **CDN**: Use CDN for static assets
4. **Monitoring**: Set up performance monitoring

## Security Considerations

### Development Security
- **Never commit secrets**: Use environment variables
- **Use HTTPS**: Even in development
- **Input Validation**: Always validate user input
- **Error Handling**: Don't expose sensitive information in errors

### Production Security
- **Environment Variables**: Securely manage secrets
- **SSL/TLS**: Enable HTTPS
- **Rate Limiting**: Protect against abuse
- **Security Headers**: Implement OWASP recommendations

This development guide provides everything needed to start contributing to the Orion AI project. Always refer to the specific documentation files for detailed information about architecture, APIs, and execution flow.