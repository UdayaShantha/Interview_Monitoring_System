import cv2
import numpy as np


class FaceDetector:
    """Handles face detection in images"""

    def __init__(self):
        # Load the pre-trained face detection model
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )

    def detect_faces(self, image):
        """
        Detect faces in an image
        Returns: List of face coordinates (x, y, w, h)
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        return faces