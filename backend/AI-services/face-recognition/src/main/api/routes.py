from fastapi import FastAPI, File, UploadFile,HTTPException,Depends
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from ..detection.face_detector import FaceDetector
from ..recognition.face_recognizer import FaceRecognizer
import numpy as np
import cv2

app = FastAPI()
security = HTTPBearer()
face_detector = FaceDetector()
face_recognizer = FaceRecognizer()

@app.post("/verify/")
async def verify_identity(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    faces = face_detector.detect_faces(image)
    if not faces:
        raise HTTPException(status_code=400, detail="No face detected")

    result = face_recognizer.verify(image, faces[0])
    return {"verified": result[0], "confidence": float(result[1])}
