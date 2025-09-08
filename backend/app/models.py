from pydantic import BaseModel
from typing import List, Optional

class NoteUpload(BaseModel):
    title: str
    content: str

class NoteInfo(BaseModel):
    filename: str
    title: str
    last_modified: str
    size: int

class NoteContent(BaseModel):
    filename: str
    title: str
    content: str
    last_modified: str

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None