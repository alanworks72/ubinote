from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from .models import NoteUpload, APIResponse
from .s3_service import S3Service

load_dotenv()

app = FastAPI(title="UbiNote API", description="Web-based Note App with S3 Storage", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    s3_service = S3Service()
except Exception as e:
    print(f"Error initializing S3 service: {e}")
    s3_service = None

@app.get("/")
async def root():
    return {"message": "UbiNote API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "s3_configured": s3_service is not None}

@app.post("/api/upload")
async def upload_note(note: NoteUpload):
    if not s3_service:
        raise HTTPException(status_code=500, detail="S3 service not configured")
    
    if not note.title.strip():
        raise HTTPException(status_code=400, detail="Note title is required")
    
    if not note.content.strip():
        raise HTTPException(status_code=400, detail="Note content is required")
    
    result = s3_service.upload_note(note.title, note.content)
    
    if result["success"]:
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": result["message"],
                "filename": result["filename"]
            }
        )
    else:
        raise HTTPException(status_code=500, detail=result["message"])

@app.get("/api/list")
async def list_notes():
    if not s3_service:
        raise HTTPException(status_code=500, detail="S3 service not configured")
    
    result = s3_service.list_notes()
    
    if result["success"]:
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": result["message"],
                "notes": result["notes"]
            }
        )
    else:
        raise HTTPException(status_code=500, detail=result["message"])

@app.get("/api/download/{filename:path}")
async def download_note(filename: str):
    if not s3_service:
        raise HTTPException(status_code=500, detail="S3 service not configured")
    
    result = s3_service.download_note(filename)
    
    if result["success"]:
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": result["message"],
                "data": result["data"]
            }
        )
    else:
        status_code = 404 if "not found" in result["message"].lower() else 500
        raise HTTPException(status_code=status_code, detail=result["message"])

@app.delete("/api/delete/{filename:path}")
async def delete_note(filename: str):
    if not s3_service:
        raise HTTPException(status_code=500, detail="S3 service not configured")
    
    result = s3_service.delete_note(filename)
    
    if result["success"]:
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": result["message"]
            }
        )
    else:
        status_code = 404 if "not found" in result["message"].lower() else 500
        raise HTTPException(status_code=status_code, detail=result["message"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)