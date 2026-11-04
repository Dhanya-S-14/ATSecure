from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.schemas.resume import FileParseResponse
from app.services.parser import parse_resume_bytes

router = APIRouter(prefix="/parser", tags=["Resume Parser"])

@router.post("/upload", response_model=FileParseResponse, status_code=status.HTTP_200_OK)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file has no filename.")
    
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    parsed_result = parse_resume_bytes(contents, file.filename)
    return parsed_result
