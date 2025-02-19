from fastapi import FastAPI,HTTPException,Depends
from pydantic import BaseModel, Field
from typing import List,Annotated

app = FastAPI()

@app.get("/load/basic/model/mesh/matrice}")
async def load_basic_model(interviewId : int):
    return NotImplemented

@app.get("/load/model/mesh")
async def load_stream_mesh(interviewId : int):
    return NotImplemented

@app.get("/load/model/report")
async def load_stream_report(interviewId : int):
    return NotImplemented

@app.get("/load/model/face-recognition")
async def load_stream_face_recognition(interviewId : int):
    return NotImplemented