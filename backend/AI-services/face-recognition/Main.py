from fastapi import FastAPI,HTTPException,Depends
from pydantic import BaseModel, Field
from typing import List,Annotated
import subprocess
import sys

app = FastAPI()

@app.get("/load/basic/model/mesh/matrice")
async def load_basic_model(interviewId: int):
    """
    Endpoint to run the BasicDetect.py script with the provided interviewId.
    """
    try:
        # Call the BasicDetect.py script with the interviewId as an argument
        result = run_basic_detect(interviewId)
        return {"status": "success", "interviewId": interviewId, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def run_basic_detect(interviewId: int):
    """
    Helper function to run the BasicDetect.py script as a subprocess.
    """
    try:
        # Construct the command to run BasicDetect.py with the interviewId
        command = [
            sys.executable,  # Use the same Python interpreter running FastAPI
            "BasicDetect.py",
            "--interviewId", str(interviewId)
        ]

        # Run the subprocess and capture output
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True
        )

        # Return the stdout and stderr from the subprocess
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except subprocess.CalledProcessError as e:
        # Handle errors from the subprocess
        raise Exception(f"Error running BasicDetect.py: {e.stderr}")
    except Exception as e:
        # Handle other exceptions
        raise Exception(f"Unexpected error: {str(e)}")

@app.get("/load/model/mesh")
async def load_stream_mesh(interviewId : int):
    return NotImplemented

@app.get("/load/model/report")
async def load_stream_report(interviewId : int):
    return NotImplemented

@app.get("/load/model/face-recognition")
async def load_stream_face_recognition(interviewId : int):
    return NotImplemented
