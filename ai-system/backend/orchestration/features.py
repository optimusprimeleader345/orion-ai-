"""
Specialized features and automation tools for the AI System.
"""
import os
import textwrap

class FeatureRegistry:
    """Registry for executive features that the AI System can run."""
    
    @staticmethod
    async def generate_ci_and_docker() -> str:
        """
        Generates production-ready Dockerfile and GitHub Actions CI/CD.
        """
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        with open("feature_debug.log", "a", encoding="utf-8") as log:
            log.write(f"Backend Dir: {backend_dir}\n")
        
        # 1. Refine Dockerfile
        dockerfile_content = textwrap.dedent("""
            # Production-grade Dockerfile for AI System Backend
            FROM python:3.11-slim as builder

            WORKDIR /app
            ENV PYTHONDONTWRITEBYTECODE 1
            ENV PYTHONUNBUFFERED 1

            RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev python3-dev
            
            COPY requirements.txt .
            RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

            FROM python:3.11-slim
            WORKDIR /app
            
            # Install PostgreSQL client for psycopg2
            RUN apt-get update && apt-get install -y libpq5 && rm -rf /var/lib/apt/lists/*

            COPY --from=builder /app/wheels /wheels
            COPY --from=builder /app/requirements.txt .
            RUN pip install --no-cache /wheels/*

            COPY . .

            EXPOSE 8000
            CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
        """).strip()
        
        with open(os.path.join(backend_dir, "Dockerfile"), "w", encoding="utf-8") as f:
            f.write(dockerfile_content)

        # 2. Create GitHub Actions CI (ci.yml)
        github_dir = os.path.join(backend_dir, ".github", "workflows")
        os.makedirs(github_dir, exist_ok=True)
        
        ci_content = textwrap.dedent("""
            name: AI System CI

            on:
              push:
                branches: [ main, master ]
              pull_request:
                branches: [ main, master ]

            jobs:
              test:
                runs-on: ubuntu-latest
                steps:
                - uses: actions/checkout@v3
                
                - name: Set up Python
                  uses: actions/setup-python@v4
                  with:
                    python-version: '3.11'
                    
                - name: Install dependencies
                  run: |
                    python -m pip install --upgrade pip
                    pip install -r backend/requirements.txt
                    
                - name: Lint with flake8
                  run: |
                    pip install flake8
                    flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
                    
                - name: Build Docker Image
                  run: |
                    docker build -t ai-system-backend ./backend
        """).strip()
        
        with open(os.path.join(github_dir, "ci.yml"), "w", encoding="utf-8") as f:
            f.write(ci_content)

        # 3. Create docker-compose.yml (Repository Root)
        repo_root = os.path.dirname(backend_dir)
        compose_content = textwrap.dedent("""
            services:
              db:
                image: postgres:15-alpine
                environment:
                  POSTGRES_DB: sentinel_db
                  POSTGRES_USER: postgres
                  POSTGRES_PASSWORD: rohit
                ports:
                  - "5432:5432"
                healthcheck:
                  test: ["CMD-SHELL", "pg_isready -U postgres -d sentinel_db"]
                  interval: 5s
                  timeout: 5s
                  retries: 5

              backend:
                build: ./backend
                ports:
                  - "8000:8000"
                environment:
                  - DATABASE_URL=postgresql://postgres:rohit@db:5432/sentinel_db
                  - DB_HOST=db
                  - DB_PORT=5432
                  - DB_USER=postgres
                  - DB_PASSWORD=rohit
                  - DB_NAME=sentinel_db
                depends_on:
                  db:
                    condition: service_healthy
        """).strip()
        
        with open(os.path.join(repo_root, "docker-compose.yml"), "w", encoding="utf-8") as f:
            f.write(compose_content)

        # 4. Update README.md
        readme_path = os.path.join(repo_root, "README.md")
        deployment_instructions = textwrap.dedent("""
            ## Deployment & DevOps
            
            This project is containerized using Docker and Docker Compose.
            
            ### Quick Start (Full Stack)
            ```bash
            docker-compose up --build
            ```
            
            ### CI/CD
            Automated builds and linting are configured via GitHub Actions in `.github/workflows/ci.yml`.
        """).strip()
        
        # Check if deployment section already exists
        content = ""
        if os.path.exists(readme_path):
            with open(readme_path, "r", encoding="utf-8") as f:
                content = f.read()
        
        if "## Deployment & DevOps" not in content:
            with open(readme_path, "a", encoding="utf-8") as f:
                f.write("\n\n" + deployment_instructions)
            
        return "SUCCESS: DevOps stack generated (Dockerfile, docker-compose.yml, ci.yml, README update)."

    @classmethod
    async def run_feature(cls, feature_name: str) -> str:
        """Dispatcher for features."""
        if feature_name == "generate_ci_and_docker":
            return await cls.generate_ci_and_docker()
        return f"ERROR: Feature '{feature_name}' not found."
