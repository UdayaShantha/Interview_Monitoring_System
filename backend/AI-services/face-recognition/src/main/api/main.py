from fastapi import FastAPI, UploadFile, File
import numpy as np
import cv2
import mediapipe as mp
from scipy.spatial.distance import cosine
import logging

logging.basicConfig(level=logging.ERROR, format='%(asctime)s %(levelname)s %(message)s')

app = FastAPI()

class MediaPipeFaceDetector:
    def __init__(self):
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            min_detection_confidence=0.5
        )

    def detect_face(self, image):
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_image)

        if not results.multi_face_landmarks:
            return False, None

        # Extract face landmarks and convert to encoding
        landmarks = results.multi_face_landmarks[0].landmark
        encoding = np.array([[point.x, point.y, point.z] for point in landmarks]).flatten()
        return True, encoding

    def compare_faces(self, encoding1, encoding2):
        similarity = 1 - cosine(encoding1, encoding2)
        return similarity

face_detector = MediaPipeFaceDetector()

@app.post("/verify-face")
async def verify_face(stored_photo: UploadFile = File(...),
                      current_frame: UploadFile = File(...)):
    try:
        # Read images
        stored_contents = await stored_photo.read()
        current_contents = await current_frame.read()

        # Convert to numpy arrays
        stored_np = np.frombuffer(stored_contents, np.uint8)
        current_np = np.frombuffer(current_contents, np.uint8)

        # Decode images
        stored_image = cv2.imdecode(stored_np, cv2.IMREAD_COLOR)
        current_image = cv2.imdecode(current_np, cv2.IMREAD_COLOR)

        # Detect faces in both images
        stored_success, stored_encoding = face_detector.detect_face(stored_image)
        current_success, current_encoding = face_detector.detect_face(current_image)

        if not stored_success or not current_success:
            return {"success": False, "message": "Face not detected in one or both images"}

        # Compare faces
        match = face_detector.compare_faces(stored_encoding, current_encoding)

        return {
            "success": True,
            "match": match,
            "confidence": float(match)
        }

    except Exception as e:
        logging.error("Error in /verify-face endpoint: %s", str(e))
        return {"success": False, "message": "An internal error has occurred!"}

@app.post("/detect-face")
async def detect_face(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        success, _ = face_detector.detect_face(img)

        return {
            "success": True,
            "face_detected": success
        }

    except Exception as e:
        logging.error("Error in /detect-face endpoint: %s", str(e))
        return {"success": False, "message": "An internal error has occurred!"}