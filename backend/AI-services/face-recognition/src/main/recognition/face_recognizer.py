import face_recognition
import numpy as np
import pickle

class FaceRecognizer:
    def __init__(self, model_path=None):
        self.model = None
        self.known_encodings = []
        self.known_labels = []
        if model_path:
            self.load_model(model_path)

    def load_model(self, path):
        with open(path, 'rb') as f:
            data = pickle.load(f)
            self.model = data['model']
            self.known_encodings = data['encodings']
            self.known_labels = data['labels']

    def verify(self, image, face_location):
        face_encoding = face_recognition.face_encodings(
            image, [face_location]
        )[0]

        if self.model:
            # Use trained model for prediction
            prediction = self.model.predict_proba([face_encoding])[0]
            best_match_idx = np.argmax(prediction)
            return True, prediction[best_match_idx]
        else:
            # Use simple face comparison
            matches = face_recognition.compare_faces(
                self.known_encodings, face_encoding
            )
            if True in matches:
                match_idx = matches.index(True)
                return True, 1.0
            return False, 0.0