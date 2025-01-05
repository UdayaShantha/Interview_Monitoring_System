import pickle

import cv2
import mediapipe as mp
import numpy as np
from typing import Tuple, Optional

class FaceDetector:
    def __init__(self, model_path='E:/Interview_Monitoring_System/backend/AI-services/face-recognition/src/main/model/face_recognition_model.pkl'):
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)

    def detect_face(self, image: np.ndarray) -> Tuple[bool, Optional[np.ndarray]]:
        """
        Detect faces in the given image
        Returns: (success, face_encoding)
        """
        # Convert BGR (OpenCV) to RGB (face_recognition)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Find all faces in the image
        face_locations = mp.face_locations(rgb_image, model="hog")

        if not face_locations:
            return False, None

        # Get face encodings
        face_encodings = mp.face_encodings(rgb_image, face_locations)

        if not face_encodings:
            return False, None

        return True, face_encodings[0]

    def compare_faces(self, known_face_encoding: np.ndarray,
                     unknown_face_encoding: np.ndarray,
                     tolerance: float = 0.6) -> bool:
        """
        Compare two face encodings
        Returns: True if faces match, False otherwise
        """
        # Compare faces and return True if they match
        results = mp.compare_faces([known_face_encoding],
                                               unknown_face_encoding,
                                               tolerance=tolerance)
        return results[0] if results else False

    def verify_face(self, image):
        # Convert image to RGB (face_recognition expects RGB)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Detect faces
        face_locations = mp.face_locations(rgb_image)
        if not face_locations:
            return False, "No face detected"

        # Get face encoding
        face_encoding = mp.face_encodings(rgb_image, face_locations)[0]

        # Compare with known faces
        matches = mp.compare_faces(self.model['encodings'], face_encoding)

        if True in matches:
            matched_idx = matches.index(True)
            matched_label = self.model['labels'][matched_idx]
            return True, matched_label

        return False, "Face not recognized"
