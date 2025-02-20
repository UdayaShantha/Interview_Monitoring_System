from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import whisper
import aiofiles
import os
import logging
from database import get_db, create_tables, engine
from models import Transcription

# Initialize FastAPI
app = FastAPI(title="Audio Transcription Service")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Whisper model
model = whisper.load_model("small")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        await create_tables()
        async with engine.connect() as conn:
            logger.info("Database connection successful")
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

@app.post("/transcribe")
async def transcribe_audio(
        interview_id: int = Form(...),
        question_id: int = Form(...),
        audio_file: UploadFile = File(...),
        db: AsyncSession = Depends(get_db)
):
    """Endpoint to handle audio upload and transcription"""
    temp_file = f"temp_{audio_file.filename}"

    try:
        # Validate file type
        if not audio_file.filename.lower().endswith(('.wav', '.mp3', '.ogg', '.m4a')):
            raise HTTPException(400, "Invalid file format")

        # Save uploaded file temporarily
        async with aiofiles.open(temp_file, "wb") as buffer:
            await buffer.write(await audio_file.read())

        # Check for existing entry
        existing = await db.execute(
            select(Transcription).where(
                Transcription.interview_id == interview_id,
                Transcription.question_id == question_id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(409, "Entry already exists")

        # Transcribe audio
        result = model.transcribe(temp_file)
        transcript = result["text"].strip()

        # Create new transcription entry
        new_entry = Transcription(
            interview_id=interview_id,
            question_id=question_id,
            filename=audio_file.filename,
            text=transcript
        )

        db.add(new_entry)
        await db.commit()
        await db.refresh(new_entry)

        return {
            "interview_id": interview_id,
            "question_id": question_id,
            "transcript": transcript,
            "filename": audio_file.filename
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        await db.rollback()
        raise HTTPException(500, "Transcription processing failed")
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)