import unittest
import cv2
import numpy as np
from ..main.detection.face_detector import FaceDetector
from ..main.recognition.face_recognizer import FaceRecognizer

class TestFaceRecognition(unittest.TestCase):
    def setUp(self):
        self.face_detector = FaceDetector()
        self.face_recognizer = FaceRecognizer()
    def test_face_detection(self):
        # Load test image
        image = cv2.imread('test_data/test_image.jpg')
        faces = self.face_detector.detect_faces(image)
        self.assertTrue(len(faces) > 0, "No faces detected in test image")
    def test_face_recognition(self):
        # Load test images
        known_image = cv2.imread('test_data/known_face.jpg')
        unknown_image = cv2.imread('test_data/unknown_face.jpg')

        # Detect faces
        known_faces = self.face_detector.detect_faces(known_image)
        unknown_faces = self.face_detector.detect_faces(unknown_image)

        self.assertTrue(len(known_faces) > 0)
        self.assertTrue(len(unknown_faces) > 0)

        # Test recognition
        is_match, confidence = self.face_recognizer.verify(
            unknown_image, unknown_faces[0]
        )
        self.assertIsInstance(is_match, bool)
        self.assertIsInstance(confidence, float)

if __name__ == '__main__':
    unittest.main()