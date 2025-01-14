import face_recognition
import os
import pickle
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC


class FaceModelTrainer:
    def __init__(self, data_path):
        self.data_path = data_path
        self.face_encodings = []
        self.face_labels = []
        self.model = SVC(kernel='linear', probability=True)

    def load_training_data(self):
        """Load and prepare training data"""
        for person_id in os.listdir(self.data_path):
            person_dir = os.path.join(self.data_path, person_id)
            if os.path.isdir(person_dir):
                for image_file in os.listdir(person_dir):
                    if image_file.endswith(('.jpg', '.jpeg', '.png')):
                        image_path = os.path.join(person_dir, image_file)
                        self._process_image(image_path, person_id)

    def _process_image(self, image_path, person_id):
        """Process single image and extract face encoding"""
        try:
            image = face_recognition.load_image_file(image_path)
            face_locations = face_recognition.face_locations(image)
            if face_locations:
                encoding = face_recognition.face_encodings(image, face_locations)[0]
                self.face_encodings.append(encoding)
                self.face_labels.append(person_id)
        except Exception as e:
            print(f"Error processing {image_path}: {str(e)}")

    def train_model(self):
        """Train the face recognition model"""
        if not self.face_encodings:
            raise ValueError("No training data loaded")

        x = np.array(self.face_encodings)
        y = np.array(self.face_labels)

        # Split data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(
            x, y, test_size=0.2, random_state=42
        )

        # Train the model
        self.model.fit(X_train, y_train)

        # Evaluate the model
        accuracy = self.model.score(X_test, y_test)
        print(f"Model accuracy: {accuracy:.2f}")

    def save_model(self, path):
        """Save trained model to file"""
        with open("E:/Interview_Monitoring_System/backend/AI-services/face-recognition/src/main/model/model.pickle", 'wb') as f:
            pickle.dump({
                'model': self.model,
                'encodings': self.face_encodings,
                'labels': self.face_labels
            }, f)