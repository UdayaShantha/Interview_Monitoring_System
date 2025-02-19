import argparse
import sys
import os
import time
import csv
from datetime import datetime

import cv2
import mediapipe as mp
import numpy as np

from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.framework.formats import landmark_pb2

# Determine the default model path
DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'face_landmarker.task')

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles


class InterviewMonitoringSystem:
    def __init__(self):
        # Tracking variables
        self.start_time = time.time()
        self.total_interview_duration = 0
        self.face_detection_count = 0
        self.max_simultaneous_faces = 0
        self.off_screen_duration = 0
        self.last_frame_time = time.time()

        # Emotion tracking
        self.emotion_totals = {}
        self.emotion_frame_counts = {}

        # Violation tracking
        self.violations = {
            'face_off_screen': 0,
            'multiple_faces': 0,
            'head_movement': {
                'excessive_rotation': 0,
                'total_rotations': []
            }
        }

        # Emotion keywords to track
        self.emotion_keywords = [
            'browInnerUp', 'browDown', 'browOuterUp',
            'eyeWideOpen', 'eyeSquint', 'eyeClosed',
            'mouthSmile', 'mouthFrown', 'mouthPucker',
            'jawOpen', 'jawForward'
        ]

    def update_tracking(self, detection_result, image_shape):
        """
        Update various tracking metrics

        Args:
            detection_result: MediaPipe face detection result
            image_shape: Shape of the current frame
        """
        current_time = time.time()
        frame_duration = current_time - self.last_frame_time
        self.last_frame_time = current_time

        # Total interview duration
        self.total_interview_duration += frame_duration

        # Face detection tracking
        if detection_result and detection_result.face_landmarks:
            current_face_count = len(detection_result.face_landmarks)

            # Track maximum simultaneous faces
            self.max_simultaneous_faces = max(
                self.max_simultaneous_faces,
                current_face_count
            )

            # Multiple faces violation
            if current_face_count > 1:
                self.violations['multiple_faces'] += 1

            # Check for off-screen faces
            for face_landmarks in detection_result.face_landmarks:
                # Simplified off-screen detection
                if (any(landmark.x < 0 or landmark.x > 1 or
                        landmark.y < 0 or landmark.y > 1) for landmark in face_landmarks):
                    self.off_screen_duration += frame_duration
                    self.violations['face_off_screen'] += 1

                # Head rotation tracking
                head_rotation = self.calculate_head_rotation(face_landmarks)
                self.violations['head_movement']['total_rotations'].append(head_rotation)

                # Detect excessive head rotation
                if abs(head_rotation) > 30:  # threshold of 30 degrees
                    self.violations['head_movement']['excessive_rotation'] += 1

        # Update emotion tracking
        if detection_result and detection_result.face_blendshapes:
            self.update_emotion_scores(detection_result.face_blendshapes)

    def calculate_head_rotation(self, face_landmarks):
        """
        Calculate approximate head rotation

        Args:
            face_landmarks: Face landmarks from MediaPipe

        Returns:
            Approximate head rotation angle
        """
        # Use nose tip and chin as reference points
        # This is a simplified rotation calculation
        nose_tip = face_landmarks[4]  # Approximate nose tip landmark
        chin = face_landmarks[152]  # Approximate chin landmark

        # Calculate angle between nose tip and chin
        dx = nose_tip.x - chin.x
        dy = nose_tip.y - chin.y

        # Convert to degrees
        rotation = np.degrees(np.arctan2(dy, dx))
        return rotation

    def update_emotion_scores(self, face_blendshapes):
        """
        Update emotion scores across frames

        Args:
            face_blendshapes: MediaPipe face blendshapes result
        """
        if face_blendshapes:
            for category in face_blendshapes[0]:
                category_name = category.category_name
                score = category.score

                # Only track emotion-related blendshapes
                if any(keyword in category_name for keyword in self.emotion_keywords):
                    # Initialize tracking if not already present
                    if category_name not in self.emotion_totals:
                        self.emotion_totals[category_name] = 0
                        self.emotion_frame_counts[category_name] = 0

                    # Accumulate scores
                    self.emotion_totals[category_name] += score
                    self.emotion_frame_counts[category_name] += 1

    def get_final_percentages(self):
        """
        Calculate final percentages for each tracked emotion

        Returns:
            Dictionary of emotion names and their average percentages
        """
        final_percentages = {}
        for emotion, total_score in self.emotion_totals.items():
            frame_count = self.emotion_frame_counts[emotion]
            if frame_count > 0:
                # Calculate average percentage
                final_percentages[emotion] = (total_score / frame_count) * 100

        return final_percentages

    def generate_interview_report(self):
        """
        Generate a comprehensive interview monitoring report

        Returns:
            Dictionary with interview metrics
        """
        # Calculate emotion percentages
        emotion_percentages = self.get_final_percentages()

        # Calculate average head rotation
        avg_head_rotation = np.mean(self.violations['head_movement']['total_rotations']) \
            if self.violations['head_movement']['total_rotations'] else 0

        report = {
            "Interview Duration": f"{self.total_interview_duration:.2f} seconds",
            "Maximum Simultaneous Faces": self.max_simultaneous_faces,
            "Off-Screen Duration": f"{self.off_screen_duration:.2f} seconds",
            "Violations": {
                "Multiple Faces Detected": self.violations['multiple_faces'],
                "Face Off-Screen Instances": self.violations['face_off_screen'],
                "Excessive Head Rotation Instances":
                    self.violations['head_movement']['excessive_rotation']
            },
            "Average Head Rotation": f"{avg_head_rotation:.2f} degrees",
            "Emotion Percentages": emotion_percentages
        }

        return report

    def save_report_to_csv(self, report):
        """
        Save the interview report to a CSV file

        Args:
            report: Dictionary containing interview metrics
        """
        # Create a unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_report_{timestamp}.csv"

        # Ensure reports directory exists
        os.makedirs("interview_reports", exist_ok=True)
        filepath = os.path.join("interview_reports", filename)

        # Write report to CSV
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["Metric", "Value"])

            # Write basic metrics
            for key, value in report.items():
                if key != "Emotion Percentages" and key != "Violations":
                    writer.writerow([key, value])

            # Write violations
            writer.writerow(["", ""])
            writer.writerow(["Violations", ""])
            for violation, count in report["Violations"].items():
                writer.writerow([violation, count])

            # Write emotion percentages
            writer.writerow(["", ""])
            writer.writerow(["Emotion Percentages", ""])
            for emotion, percentage in report["Emotion Percentages"].items():
                writer.writerow([emotion, f"{percentage:.2f}%"])

        print(f"Interview report saved to {filepath}")
        return filepath


def run(model: str, num_faces: int, min_face_detection_confidence: float,
        min_face_presence_confidence: float, min_tracking_confidence: float,
        camera_id: int, width: int, height: int) -> None:
    """Continuously run inference on images acquired from the camera with advanced monitoring."""

    # Create interview monitoring system
    interview_monitor = InterviewMonitoringSystem()

    # Verify model file exists
    if not os.path.exists(model):
        print(f"Error: Model file not found at {model}")
        print("Please download the face_landmarker.task model from MediaPipe.")
        sys.exit(1)

    # Start capturing video input from the camera
    cap = cv2.VideoCapture(camera_id)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

    # Initialize the face landmarker model
    base_options = python.BaseOptions(model_asset_path=model)
    options = vision.FaceLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.LIVE_STREAM,
        num_faces=num_faces,
        min_face_detection_confidence=min_face_detection_confidence,
        min_face_presence_confidence=min_face_presence_confidence,
        min_tracking_confidence=min_tracking_confidence,
        output_face_blendshapes=True,
        result_callback=lambda result, output_image, timestamp:
        interview_monitor.update_tracking(result, output_image.numpy_view().shape))
    detector = vision.FaceLandmarker.create_from_options(options)

    # Continuously capture images from the camera and run inference
    while cap.isOpened():
        success, image = cap.read()
        if not success:
            sys.exit('ERROR: Unable to read from webcam.')

        image = cv2.flip(image, 1)

        # Convert the image from BGR to RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

        # Run face landmarker using the model
        detector.detect_async(mp_image, time.time_ns() // 1_000_000)

        # Display image with face landmarks (existing visualization code)
        cv2.imshow('Interview Monitoring System', image)

        # Stop the program if the ESC key is pressed
        if cv2.waitKey(1) == 27:
            break

    # Generate and save the final report
    final_report = interview_monitor.generate_interview_report()
    report_path = interview_monitor.save_report_to_csv(final_report)

    # Print the report to console
    print("\n--- Interview Monitoring Report ---")
    for key, value in final_report.items():
        print(f"{key}: {value}")

    detector.close()
    cap.release()
    cv2.destroyAllWindows()


def main():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument(
        '--model',
        help='Path to face landmarker model.',
        required=False,
        default=DEFAULT_MODEL_PATH)
    parser.add_argument(
        '--num_faces',  # Changed from --numFaces to match Python naming convention
        help='Max number of faces that can be detected by the landmarker.',
        required=False,
        default=5,
        type=int)
    parser.add_argument(
        '--min_face_detection_confidence',  # Changed from camelCase to snake_case
        help='The minimum confidence score for face detection to be considered successful.',
        required=False,
        default=0.5,
        type=float)
    parser.add_argument(
        '--min_face_presence_confidence',  # Changed from camelCase to snake_case
        help='The minimum confidence score of face presence score in the face landmark detection.',
        required=False,
        default=0.5,
        type=float)
    parser.add_argument(
        '--min_tracking_confidence',  # Changed from camelCase to snake_case
        help='The minimum confidence score for the face tracking to be considered successful.',
        required=False,
        default=0.5,
        type=float)
    parser.add_argument(
        '--camera_id',  # Changed from camelCase to snake_case
        help='Id of camera.',
        required=False,
        default=0,
        type=int)
    parser.add_argument(
        '--frame_width',  # Changed from camelCase to snake_case
        help='Width of frame to capture from camera.',
        required=False,
        default=1920,
        type=int)
    parser.add_argument(
        '--frame_height',  # Changed from camelCase to snake_case
        help='Height of frame to capture from camera.',
        required=False,
        default=1080,
        type=int)

    # Parse arguments
    args = parser.parse_args()

    # Update the run function call to use the new argument names
    run(
        model=args.model,
        num_faces=args.num_faces,  # Now matches the argument name
        min_face_detection_confidence=args.min_face_detection_confidence,
        min_face_presence_confidence=args.min_face_presence_confidence,
        min_tracking_confidence=args.min_tracking_confidence,
        camera_id=args.camera_id,
        width=args.frame_width,
        height=args.frame_height
    )

if __name__ == '__main__':
    main()