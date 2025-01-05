import os
import pickle
import numpy as np
import cv2
import mediapipe as mp
from sklearn.model_selection import train_test_split
from tqdm import tqdm
import logging
from scipy.spatial.distance import cosine

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MediaPipeFaceTrainer:
    def __init__(self):
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            min_detection_confidence=0.5
        )

    def extract_face_encoding(self, image):
        """Extract face encoding using MediaPipe face mesh"""
        # Convert to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Get face mesh results
        results = self.face_mesh.process(image_rgb)

        if not results.multi_face_landmarks:
            return None

        # Extract landmarks and convert to encoding
        landmarks = results.multi_face_landmarks[0].landmark
        encoding = np.array([[point.x, point.y, point.z] for point in landmarks]).flatten()
        return encoding

    def train(self, data_dir, save_path='face_recognition_model.pkl'):
        """Train the face recognition model using the dataset"""
        logger.info("Starting training process...")

        # Initialize lists to store encodings and labels
        train_encodings = []
        train_labels = []
        val_encodings = []
        val_labels = []

        # Process training data
        train_dir = os.path.join(data_dir, 'train', 'images')
        logger.info(f"Processing training images from {train_dir}")

        for image_file in tqdm(os.listdir(train_dir)):
            if image_file.endswith(('.jpg', '.jpeg', '.png')):
                image_path = os.path.join(train_dir, image_file)
                image = cv2.imread(image_path)

                if image is None:
                    logger.warning(f"Could not read image: {image_path}")
                    continue

                encoding = self.extract_face_encoding(image)
                if encoding is not None:
                    train_encodings.append(encoding)
                    # Get label from filename (person_name_id.jpg)
                    label = image_file.split('_')[0]
                    train_labels.append(label)

        # Process validation data
        val_dir = os.path.join(data_dir, 'valid', 'images')
        logger.info(f"Processing validation images from {val_dir}")

        for image_file in tqdm(os.listdir(val_dir)):
            if image_file.endswith(('.jpg', '.jpeg', '.png')):
                image_path = os.path.join(val_dir, image_file)
                image = cv2.imread(image_path)

                if image is None:
                    logger.warning(f"Could not read image: {image_path}")
                    continue

                encoding = self.extract_face_encoding(image)
                if encoding is not None:
                    val_encodings.append(encoding)
                    label = image_file.split('_')[0]
                    val_labels.append(label)

        # Create and save model
        model = {
            'encodings': train_encodings,
            'labels': train_labels,
            'val_encodings': val_encodings,
            'val_labels': val_labels,
            'metadata': {
                'num_train_samples': len(train_encodings),
                'num_val_samples': len(val_encodings),
                'unique_identities': len(set(train_labels))
            }
        }

        logger.info(f"Saving model to {save_path}")
        with open(save_path, 'wb') as f:
            pickle.dump(model, f)

        logger.info("Training completed successfully!")
        return model

    def validate_model(self, model):
        """Validate the model using the validation set"""
        logger.info("Starting model validation...")

        correct = 0
        total = len(model['val_encodings'])

        for i, val_encoding in enumerate(tqdm(model['val_encodings'], desc="Validating")):
            # Compare with all training encodings using cosine similarity
            similarities = [1 - cosine(val_encoding, train_encoding)
                            for train_encoding in model['encodings']]

            if similarities:
                # Get the most similar face
                best_match_idx = np.argmax(similarities)
                best_similarity = similarities[best_match_idx]

                # Use a threshold to determine if it's a match
                if best_similarity > 0.75:  # You can adjust this threshold
                    if model['labels'][best_match_idx] == model['val_labels'][i]:
                        correct += 1

        accuracy = (correct / total) * 100 if total > 0 else 0
        logger.info(f"Validation Accuracy: {accuracy:.2f}%")
        return accuracy

def main():
    """Main function to run the training pipeline"""
    # Initialize trainer
    trainer = MediaPipeFaceTrainer()

    # Set your dataset path
    data_dir = "E:/Interview_Monitoring_System/backend/AI-services/face-recognition/stored_embeddings/data/Face_Recognition dataset"

    # Train the model
    model = trainer.train(data_dir)

    # Validate the model
    accuracy = trainer.validate_model(model)

    logger.info("Training pipeline completed!")
    logger.info(f"Final Validation Accuracy: {accuracy:.2f}%")

if __name__ == "__main__":
    main()