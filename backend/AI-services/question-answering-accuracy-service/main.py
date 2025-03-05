import uvicorn
from fastapi import FastAPI
from database import create_tables
import models

app = FastAPI(title="Question Answering Accuracy Service")

@app.on_event("startup")
async def startup_event():
    await create_tables()

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.2", port=8002)