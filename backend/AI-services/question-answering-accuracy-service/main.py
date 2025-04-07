import httpx
import uvicorn
import time
import threading
from fastapi import FastAPI, Depends, HTTPException
from database import create_tables, get_db
from sqlalchemy.orm import Session
from accuracy import final_accuracy
from models import AnsweringAccuracy

app = FastAPI(title="Question Answering Accuracy Service")

# Token configuration for JWT authentication
CLIENT_ID = "answer-accuracy-service"
CLIENT_SECRET = "super-secret-key"
TOKEN_URL = "http://localhost:8081/api/v1/auth/client-token"

# Token cache
token = None
expiration_time = 0

async def get_token():
    """Fetch and cache a JWT token from the User Management Service."""
    global token, expiration_time
    if time.time() < expiration_time:
        return token

    async with httpx.AsyncClient() as client:
        payload = {"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET}
        response = await client.post(TOKEN_URL, json=payload)
        response.raise_for_status()
        token_data = response.json()
        token = token_data["accessToken"]
        expiration_time = time.time() + 86400  # 24 hours
        return token

report_process = None
stop_event = threading.Event()
active_processes = {}


@app.on_event("startup")
async def startup_event():
    await create_tables()

async def get_question_data(interviewId: int):
    """Get Interview questions with questionId, content, keywords from Spring Boot endpoints and question answer from
    transcription service"""

    url = "http://localhost:8082/api/v1/interviews/get/interview/questions"
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.get(url, params={"interviewId": interviewId})
            response.raise_for_status()

            data = response.json()
            raw_questions = data.get("data", [])

            processed_questions = []
            for q in raw_questions:
                processed = {
                    "question_id": int(q["questionId"]),
                    "content": str(q["content"]),
                    "keywords": q["keywords"].split(",")
                }
                processed_questions.append(processed)
            return processed_questions

        except httpx.HTTPStatusError as e:
            error_message = f"HTTP error {e.response.status_code}: {e.response.text}"
            raise ValueError(error_message)
        except (KeyError, ValueError) as e:
            raise ValueError(f"Data processing error: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Unexpected error: {str(e)}")


@app.post("/save/answering/accuracy")
async def save_answer(
        interviewId: int,
        db: Session = Depends(get_db)
):
    try:
        questions = await get_question_data(interviewId)
        transcription_service_url = "http://127.0.0.1:8000/get/question/answer"

        async with httpx.AsyncClient() as client:
            for question in questions:
                try:
                    answer_response = await client.get(
                        transcription_service_url,
                        params={
                            "interviewId": interviewId,
                            "questionId": question["question_id"]
                        }
                    )
                    answer_response.raise_for_status()
                    answer = answer_response.text
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                        continue
                    raise
                accuracy_score = final_accuracy(
                    question["content"],
                    answer,
                    question["keywords"]
                )
                db_record = AnsweringAccuracy(
                    interview_id=interviewId,
                    question_id=question["question_id"],
                    content=question["content"],
                    keywords=",".join(question["keywords"]),
                    answer=answer,
                    accuracy=accuracy_score
                )
                db.add(db_record)
                db.commit()
        return {"status": "success", "message": "All accuracy data saved"}

    except httpx.HTTPError as e:
        db.rollback()
        raise HTTPException(
            status_code=502,
            detail=f"Error communicating with external service: {str(e)}"
        )
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
@app.get("/get/question/answer/accuracy")
async def get_question_answer_accuracy(
    interviewId: int,
    db: Session = Depends(get_db)
):
    try:
        results = db.query(AnsweringAccuracy)\
            .filter(AnsweringAccuracy.interview_id == interviewId)\
            .all()

        if not results:
            raise HTTPException(
                status_code=404,
                detail=f"No accuracy data found for interview ID {interviewId}"
            )
        accuracy_data = []
        for record in results:
            accuracy_data.append({
                "interview_id": record.interview_id,
                "question_id": record.question_id,
                "content": record.content,
                "keywords": record.keywords.split(","),
                "answer": record.answer,
                "accuracy": record.accuracy
            })
        return {
            "interview_id": interviewId,
            "total_questions": len(accuracy_data),
            "accuracy_data": accuracy_data
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving accuracy data: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)