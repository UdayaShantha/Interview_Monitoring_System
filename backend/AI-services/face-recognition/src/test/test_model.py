import cv2
from mediapipe.tasks.python.vision import FaceDetector


class FaceRecognitionTrainer:
     pass


def test_model():
    # Initialize trainer
    trainer = FaceRecognitionTrainer('E:/Interview_Monitoring_System/backend/AI-services/face-recognition/stored_embeddings/data/Face_Recognition dataset')

    # Train and save model
    model = trainer.train()

    # Validate model
    accuracy = trainer.validate_model(model)

    # Test specific cases
    detector = FaceDetector('face_recognition_model.pkl')

    # Load a test image
    test_image = cv2.imread('path/to/test/image.jpg')
    success, result = detector.verify_face(test_image)

    print(f"Test Result: {'Success' if success else 'Failed'}")
    print(f"Identified as: {result}")

if __name__ == "__main__":
    test_model()