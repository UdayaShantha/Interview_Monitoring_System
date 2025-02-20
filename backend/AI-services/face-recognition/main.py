from fastapi import FastAPI,HTTPException,Depends
from pydantic import BaseModel, Field
from typing import List,Annotated
import subprocess
import sys
from basicDetect import main as basic_detect

app = FastAPI()

@app.get("/load/basic/model/mesh/matrice")
async def load_basic_model():
    return basic_detect()

@app.get("/load/model/mesh")
async def load_stream_mesh(interviewId : int):
    return NotImplemented

@app.get("/load/model/report")
async def load_stream_report(interviewId : int):
    return NotImplemented

@app.get("/load/model/face-recognition")
async def load_stream_face_recognition(interviewId : int):
    return NotImplemented