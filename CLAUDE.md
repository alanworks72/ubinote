# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UbiNote is a web-based markdown note application similar to Obsidian, built with a FastAPI backend and React frontend. Notes are stored in AWS S3 using EC2 IAM roles for authentication.

## Development Commands

### Full Stack (Docker)
```bash
# Start all services in development mode
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop all services
docker-compose down
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development  
```bash
cd frontend
npm install
npm start
```

### Testing and Linting
```bash
# Frontend tests
cd frontend && npm test

# Frontend build
cd frontend && npm run build
```

## Architecture

### Backend (FastAPI)
- **main.py**: Main FastAPI application with CORS middleware and API endpoints
- **s3_service.py**: AWS S3 integration service for note storage and retrieval
- **models.py**: Pydantic models for request/response validation
- Uses EC2 IAM roles for AWS authentication (no explicit credentials needed)

### Frontend (React)
- **App.js**: Main application component with state management and API health checking
- **components/NoteEditor.js**: Markdown editor component
- **components/Preview.js**: Real-time markdown preview component
- **components/NoteList.js**: Sidebar component for listing and selecting notes
- **services/api.js**: API service layer for backend communication

### Key Data Flow
1. Notes are created with title and markdown content
2. Backend generates filename: `{title}.md` (no timestamp)
3. Files stored in S3 with date-based folder structure: `ubinote/{YYYY-MM-DD}/{filename}.md`
4. Frontend fetches note list and displays in sidebar
5. Selected notes are loaded into editor with real-time preview

### AWS Integration
- Uses S3 bucket `dev-jhpark` (configurable via S3_BUCKET_NAME env var)
- Requires EC2 IAM role with S3 permissions: GetObject, PutObject, DeleteObject, ListBucket
- No AWS credentials stored in code - relies on EC2 instance profile

## Environment Configuration

Required environment variables in `.env`:
- `S3_BUCKET_NAME`: S3 bucket name (default: dev-jhpark)
- `AWS_REGION`: AWS region (default: ap-northeast-2)  
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8000)

## API Endpoints

- `GET /health`: Health check with S3 connectivity status
- `POST /api/upload`: Upload note with title and content
- `GET /api/list`: List all saved notes with metadata
- `GET /api/download/{filename}`: Download specific note content

## Development Notes

- Frontend includes API connectivity checking on startup
- Notes are auto-sorted by last modified date (newest first)
- Title sanitization removes special characters and replaces spaces with underscores
- Files are organized in date-based folders: `ubinote/YYYY-MM-DD/filename.md`
- Docker setup includes volume mounts for development file watching
- CORS configured for localhost:3000 and frontend:3000 (Docker)