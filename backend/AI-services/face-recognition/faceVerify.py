import argparse
import sys
import os
import time
import csv
import json
import io
import base64
import threading
from datetime import datetime

import cv2
import mediapipe as mp
import numpy as np
from deepface import DeepFace

from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.framework.formats import landmark_pb2

# Determine the default model path
DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'face_landmarker.task')

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Face verification settings
VERIFICATION_THRESHOLD = 0.6  # Similarity threshold (lower means stricter matching)
VERIFICATION_MODEL = "VGG-Face"  # DeepFace model to use
VERIFICATION_INTERVAL = 30  # Check face verification every N frames
UNVERIFIED_TOLERANCE = 10  # Number of seconds to allow unverified face before terminating
WARNING_DISPLAYED = False  # Flag to track if warning is currently displayed


class FaceVerifier:
    """Handles face verification against reference photos"""

    def __init__(self, reference_photos=None, candidate_id=None, interview_id=None):
        """
        Initialize the face verifier

        Args:
            reference_photos: List of binary photo data of the candidate
            candidate_id: ID of the candidate
            interview_id: ID of the interview
        """
        self.reference_photos = reference_photos or []
        self.candidate_id = candidate_id
        self.interview_id = interview_id
        self.reference_faces = []
        self.last_verification_time = 0
        self.unverified_start_time = None
        self.verification_active = False

        # Initialize reference faces
        self._initialize_reference_faces()

    def _initialize_reference_faces(self):
        """Convert binary photos to format usable by DeepFace"""
        if not self.reference_photos:
            print("Warning: No reference photos provided for verification")
            return

        for photo_data in self.reference_photos:
            try:
                # Convert binary data to numpy array
                nparr = np.frombuffer(photo_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if img is not None:
                    # Add to reference faces
                    self.reference_faces.append(img)
                    print(f"Loaded reference face, shape: {img.shape}")
                else:
                    print("Failed to decode photo")
            except Exception as e:
                print(f"Error loading reference photo: {e}")

        self.verification_active = len(self.reference_faces) > 0
        print(f"Face verification {'activated' if self.verification_active else 'not activated'}")

    def verify_face(self, frame):
        """
        Verify if the face in the frame matches reference photos

        Args:
            frame: Current video frame

        Returns:
            Dict with verification results and any detected emotions
        """
        if not self.verification_active:
            return {
                'verified': False,
                'verified_status': 'no_reference_photos',
                'emotions': {},
                'dominant_emotion': None,
                'age': None,
                'gender': None
            }

        try:
            # Analyze face in current frame
            analysis_results = DeepFace.analyze(
                frame,
                actions=['emotion', 'age', 'gender'],
                enforce_detection=False,
                silent=True
            )

            # Extract emotions and other analysis data
            if not analysis_results or len(analysis_results) == 0:
                return {
                    'verified': False,
                    'verified_status': 'no_face_detected',
                    'emotions': {},
                    'dominant_emotion': None,
                    'age': None,
                    'gender': None
                }

            # Get first face analysis (can be extended to handle multiple faces)
            analysis = analysis_results[0]
            emotions = analysis.get('emotion', {})
            dominant_emotion = analysis.get('dominant_emotion', None)
            age = analysis.get('age', None)
            gender = analysis.get('gender', None)

            # Try to verify against each reference face
            verified = False
            for ref_face in self.reference_faces:
                try:
                    verification = DeepFace.verify(
                        frame,
                        ref_face,
                        model_name=VERIFICATION_MODEL,
                        enforce_detection=False,
                        distance_metric="cosine",
                        silent=True
                    )

                    # If verification successful with any reference photo
                    if verification['verified']:
                        verified = True
                        break
                except Exception as e:
                    print(f"Verification error: {e}")
                    continue

            return {
                'verified': verified,
                'verified_status': 'verified' if verified else 'unverified',
                'emotions': emotions,
                'dominant_emotion': dominant_emotion,
                'age': age,
                'gender': gender
            }

        except Exception as e:
            print(f"Face verification error: {e}")
            return {
                'verified': False,
                'verified_status': 'error',
                'emotions': {},
                'dominant_emotion': None,
                'age': None,
                'gender': None
            }


class InterviewMonitoringSystem:
    def __init__(self, reference_photos=None, candidate_id=None, interview_id=None):
        # Initialize face verifier
        self.face_verifier = FaceVerifier(reference_photos, candidate_id, interview_id)
        self.candidate_id = candidate_id
        self.interview_id = interview_id

        # Verification tracking
        self.verification_results = []
        self.frame_count = 0
        self.last_verified = True
        self.unverified_start_time = None
        self.termination_requested = False
        self.verification_warning_shown = False
        self.last_emotion_data = {}

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
        self.deepface_emotions = {
            'angry': 0,
            'disgust': 0,
            'fear': 0,
            'happy': 0,
            'sad': 0,
            'surprise': 0,
            'neutral': 0
        }
        self.deepface_emotion_counts = {emotion: 0 for emotion in self.deepface_emotions}

        # Violation tracking
        self.violations = {
            'face_off_screen': 0,
            'multiple_faces': 0,
            'unverified_face': 0,
            'head_movement': {
                'excessive_rotation': 0,
                'total_rotations': []
            }
        }

        # Emotion keywords to track (MediaPipe)
        self.emotion_keywords = [
            'browInnerUp', 'browDown', 'browOuterUp',
            'eyeWideOpen', 'eyeSquint', 'eyeClosed',
            'mouthSmile', 'mouthFrown', 'mouthPucker',
            'jawOpen', 'jawForward'
        ]

    def update_tracking(self, detection_result, image):
        """
        Update various tracking metrics including face verification

        Args:
            detection_result: MediaPipe face detection result
            image: Current frame
        """
        current_time = time.time()
        frame_duration = current_time - self.last_frame_time
        self.last_frame_time = current_time
        self.frame_count += 1

        # Total interview duration
        self.total_interview_duration += frame_duration

        # Perform face verification at regular intervals
        should_verify = self.frame_count % VERIFICATION_INTERVAL == 0
        verification_result = None

        if should_verify and image is not None:
            verification_result = self.face_verifier.verify_face(image)
            self.verification_results.append(verification_result)

            # Update emotion tracking from DeepFace
            if verification_result['emotions']:
                for emotion, score in verification_result['emotions'].items():
                    if emotion in self.deepface_emotions:
                        self.deepface_emotions[emotion] += score
                        self.deepface_emotion_counts[emotion] += 1

                # Store the latest emotion data for the report
                self.last_emotion_data = verification_result

            # Track unverified face violations
            if not verification_result['verified']:
                if verification_result['verified_status'] != 'no_face_detected':
                    if self.last_verified:
                        self.unverified_start_time = current_time
                        self.last_verified = False

                    # If unverified face has been present too long
                    if self.unverified_start_time and (
                            current_time - self.unverified_start_time) > UNVERIFIED_TOLERANCE:
                        if not self.verification_warning_shown:
                            self.verification_warning_shown = True
                            self.violations['unverified_face'] += 1
                            self.termination_requested = True
                            print("\nWARNING: Unverified face detected for too long. Terminating interview...\n")
            else:
                self.last_verified = True
                self.unverified_start_time = None
                self.verification_warning_shown = False

        # Face detection tracking (MediaPipe)
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
                if any(landmark.x < 0 or landmark.x > 1 or
                       landmark.y < 0 or landmark.y > 1 for landmark in face_landmarks):
                    self.off_screen_duration += frame_duration
                    self.violations['face_off_screen'] += 1

                # Head rotation tracking
                head_rotation = self.calculate_head_rotation(face_landmarks)
                self.violations['head_movement']['total_rotations'].append(head_rotation)

                # Detect excessive head rotation
                if abs(head_rotation) > 30:  # threshold of 30 degrees
                    self.violations['head_movement']['excessive_rotation'] += 1

        # Update emotion tracking from MediaPipe
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

    def get_mediapipe_emotion_percentages(self):
        """
        Calculate final percentages for each tracked MediaPipe emotion

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

    def get_deepface_emotion_percentages(self):
        """
        Calculate average percentages for DeepFace emotions

        Returns:
            Dictionary of emotion names and their average percentages
        """
        final_percentages = {}
        for emotion, total_score in self.deepface_emotions.items():
            count = self.deepface_emotion_counts[emotion]
            if count > 0:
                final_percentages[emotion] = (total_score / count)

        return final_percentages

    def generate_interview_report(self):
        """
        Generate a comprehensive interview monitoring report

        Returns:
            Dictionary with interview metrics
        """
        # Calculate emotion percentages from both systems
        mediapipe_emotion_percentages = self.get_mediapipe_emotion_percentages()
        deepface_emotion_percentages = self.get_deepface_emotion_percentages()

        # Calculate average head rotation
        avg_head_rotation = np.mean(self.violations['head_movement']['total_rotations']) \
            if self.violations['head_movement']['total_rotations'] else 0

        # Get latest face analysis data
        age_estimation = self.last_emotion_data.get('age', 'Unknown')
        gender_estimation = self.last_emotion_data.get('gender', 'Unknown')
        dominant_emotion = self.last_emotion_data.get('dominant_emotion', 'Unknown')

        report = {
            "Interview ID": self.interview_id,
            "Candidate ID": self.candidate_id,
            "Interview Duration": f"{self.total_interview_duration:.2f} seconds",
            "Maximum Simultaneous Faces": self.max_simultaneous_faces,
            "Off-Screen Duration": f"{self.off_screen_duration:.2f} seconds",
            "Face Verification": {
                "Active": self.face_verifier.verification_active,
                "Unverified Face Violations": self.violations['unverified_face'],
                "Verification Terminated Interview": self.termination_requested
            },
            "DeepFace Analysis": {
                "Estimated Age": age_estimation,
                "Estimated Gender": gender_estimation,
                "Dominant Emotion": dominant_emotion
            },
            "Violations": {
                "Multiple Faces Detected": self.violations['multiple_faces'],
                "Face Off-Screen Instances": self.violations['face_off_screen'],
                "Unverified Face Instances": self.violations['unverified_face'],
                "Excessive Head Rotation Instances":
                    self.violations['head_movement']['excessive_rotation']
            },
            "Average Head Rotation": f"{avg_head_rotation:.2f} degrees",
            "MediaPipe Emotion Percentages": mediapipe_emotion_percentages,
            "DeepFace Emotion Percentages": deepface_emotion_percentages
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
        filename = f"interview_report_{self.interview_id}_{self.candidate_id}_{timestamp}.csv"

        # Ensure reports directory exists
        os.makedirs("interview_reports", exist_ok=True)
        filepath = os.path.join("interview_reports", filename)

        # Write report to CSV
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["Metric", "Value"])

            # Write basic metrics
            for key, value in report.items():
                if not isinstance(value, dict):
                    writer.writerow([key, value])

            # Write face verification info
            writer.writerow(["", ""])
            writer.writerow(["Face Verification", ""])
            for key, value in report["Face Verification"].items():
                writer.writerow([key, value])

            # Write DeepFace analysis
            writer.writerow(["", ""])
            writer.writerow(["DeepFace Analysis", ""])
            for key, value in report["DeepFace Analysis"].items():
                writer.writerow([key, value])

            # Write violations
            writer.writerow(["", ""])
            writer.writerow(["Violations", ""])
            for violation, count in report["Violations"].items():
                writer.writerow([violation, count])

            # Write MediaPipe emotion percentages
            writer.writerow(["", ""])
            writer.writerow(["MediaPipe Emotion Percentages", ""])
            for emotion, percentage in report["MediaPipe Emotion Percentages"].items():
                writer.writerow([emotion, f"{percentage:.2f}%"])

            # Write DeepFace emotion percentages
            writer.writerow(["", ""])
            writer.writerow(["DeepFace Emotion Percentages", ""])
            for emotion, percentage in report["DeepFace Emotion Percentages"].items():
                writer.writerow([emotion, f"{percentage:.2f}%"])

        print(f"Interview report saved to {filepath}")
        return filepath


def get_reference_photos(candidate_id, interview_id):
    """
    Retrieve reference photos for the candidate from database

    Args:
        candidate_id: ID of the candidate
        interview_id: ID of the interview

    Returns:
        List of binary photo data
    """
    # This is a placeholder. In a real implementation, you would:
    # 1. Connect to your database
    # 2. Query for photos using the candidate_id
    # 3. Return the binary data

    # For demonstration, return empty list (verification will be disabled)
    print(f"Would fetch photos for candidate {candidate_id} in interview {interview_id}")
    return []


def run_verification(model: str, num_faces: int, min_face_detection_confidence: float,
                     min_face_presence_confidence: float, min_tracking_confidence: float,
                     camera_id: int, width: int, height: int, candidate_id: int = None,
                     interview_id: int = None) -> None:
    """
    Continuously run inference with face verification on images from camera.

    Args:
        model: Path to the face landmarker model
        num_faces: Maximum number of faces to detect
        min_face_detection_confidence: Minimum confidence for face detection
        min_face_presence_confidence: Minimum confidence for face presence
        min_tracking_confidence: Minimum confidence for tracking
        camera_id: Camera ID to use
        width: Frame width
        height: Frame height
        candidate_id: ID of the candidate
        interview_id: ID of the interview
    """
    # Get reference photos for verification
    reference_photos = get_reference_photos(candidate_id, interview_id)

    # Create interview monitoring system with verification
    interview_monitor = InterviewMonitoringSystem(
        reference_photos=reference_photos,
        candidate_id=candidate_id,
        interview_id=interview_id
    )

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
        interview_monitor.update_tracking(result, output_image.numpy_view()))
    detector = vision.FaceLandmarker.create_from_options(options)

    # Continuously capture images from the camera and run inference
    status_text = ""
    warning_start_time = None

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

        # Display verification status
        if interview_monitor.verification_warning_shown:
            # Show warning for unverified face
            status_text = "WARNING: UNVERIFIED FACE DETECTED"
            cv2.putText(image, status_text, (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            # Calculate remaining time before termination
            if interview_monitor.unverified_start_time:
                elapsed = time.time() - interview_monitor.unverified_start_time
                remaining = max(0, UNVERIFIED_TOLERANCE - elapsed)
                time_text = f"Terminating in: {remaining:.1f}s"
                cv2.putText(image, time_text, (10, 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        elif interview_monitor.last_emotion_data:
            # Display emotion data when available
            emotion = interview_monitor.last_emotion_data.get('dominant_emotion', None)
            if emotion:
                status_text = f"Emotion: {emotion.capitalize()}"
                cv2.putText(image, status_text, (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # Display image with face landmarks
        cv2.imshow('Interview Monitoring System', image)

        # Check for termination request due to unverified face
        if interview_monitor.termination_requested:
            print("Terminating due to unverified face...")
            break

        # Stop the program if the ESC key is pressed
        if cv2.waitKey(1) == 27:
            break

    # Generate and save the final report
    final_report = interview_monitor.generate_interview_report()
    report_path = interview_monitor.save_report_to_csv(final_report)

    # Print the report to console
    print("\n--- Interview Monitoring Report ---")
    for key, value in final_report.items():
        if isinstance(value, dict):
            print(f"{key}:")
            for subkey, subvalue in value.items():
                print(f"  {subkey}: {subvalue}")
        else:
            print(f"{key}: {value}")

    detector.close()
    cap.release()
    cv2.destroyAllWindows()

    return report_path


# Function to connect with the API route implementation
def report_generation(model, num_faces, min_face_detection_confidence,
                      min_face_presence_confidence, min_tracking_confidence,
                      camera_id, width, height, candidate_id=None, interview_id=None):
    """Wrapper for run_verification to be called from API"""
    return run_verification(
        model=model,
        num_faces=num_faces,
        min_face_detection_confidence=min_face_detection_confidence,
        min_face_presence_confidence=min_face_presence_confidence,
        min_tracking_confidence=min_tracking_confidence,
        camera_id=camera_id,
        width=width,
        height=height,
        candidate_id=candidate_id,
        interview_id=interview_id
    )


# Database models and API routes
def get_candidate_photos_from_db(db, candidate_id):
    """
    Get candidate photos from database

    Args:
        db: Database session
        candidate_id: ID of the candidate

    Returns:
        List of binary photo data
    """
    try:
        # This would be your actual database query
        # Example query: photos = db.query(CandidatePhoto).filter_by(candidate_id=candidate_id).all()
        # return [photo.binary_data for photo in photos]
        return []
    except Exception as e:
        print(f"Database error: {e}")
        return []


# Update the API route
async def load_stream_report(interviewId: int, candidateId: int, db=None):
    """Start and manage the entire report generation lifecycle with face verification"""
    global report_process, stop_event

    if report_process and report_process.is_alive():
        raise Exception("Report generation already running")

    # Create interview_reports directory if not exists
    os.makedirs("interview_reports", exist_ok=True)

    # Get initial list of CSV files
    initial_files = set()
    if os.path.exists("interview_reports"):
        initial_files = set(os.listdir("interview_reports"))

    # Get reference photos for verification
    reference_photos = get_candidate_photos_from_db(db, candidateId) if db else []

    def run_monitoring():
        """Wrapper function to run report generation with verification"""
        try:
            report_generation(
                model='face_landmarker.task',
                num_faces=3,
                min_face_detection_confidence=0.6,
                min_face_presence_confidence=0.6,
                min_tracking_confidence=0.6,
                camera_id=0,
                width=720,
                height=480,
                candidate_id=candidateId,
                interview_id=interviewId
            )
        except Exception as e:
            print(f"Report generation error: {str(e)}")
        finally:
            stop_event.set()

    # Start monitoring thread
    stop_event = threading.Event()
    stop_event.clear()
    report_process = threading.Thread(target=run_monitoring, daemon=True)
    report_process.start()

    # Logic to wait for completion and retrieve report remains similar...
    # In a real implementation, you would wait for the process to complete and then
    # return the generated report

    return {"status": "report_generation_started"}


def main():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument(
        '--model',
        help='Path to face landmarker model.',
        required=False,
        default=DEFAULT_MODEL_PATH)
    parser.add_argument(
        '--num_faces',
        help='Max number of faces that can be detected by the landmarker.',
        required=False,
        default=5,
        type=int)
    parser.add_argument(
        '--min_face_detection_confidence',
        help='The minimum confidence score for face detection to be considered successful.',
        required=False,
        default=0.5,
        type=float)
    parser.add_argument(
        '--min_face_presence_confidence',
        help='The minimum confidence score of face presence score in the face landmark detection.',
        required=False,
        default=0.5,
        type=float)
    parser.add_argument(
        '--min_tracking_confidence',
        help='The minimum confidence score for the face tracking to be considered successful.',
        required=False,
        default=0.5,
        type=float)
    parser.add_argument(
        '--camera_id',
        help='Id of camera.',
        required=False,
        default=0,
        type=int)
    parser.add_argument(
        '--frame_width',
        help='Width of frame to capture from camera.',
        required=False,
        default=1280,
        type=int)
    parser.add_argument(
        '--frame_height',
        help='Height of frame to capture from camera.',
        required=False,
        default=720,
        type=int)
    parser.add_argument(
        '--candidate_id',
        help='ID of the candidate',
        required=False,
        default=None,
        type=int)
    parser.add_argument(
        '--interview_id',
        help='ID of the interview',
        required=False,
        default=None,
        type=int)

    # Parse arguments
    args = parser.parse_args()

    # Update the function call to include verification
    run_verification(
        model=args.model,
        num_faces=args.num_faces,
        min_face_detection_confidence=args.min_face_detection_confidence,
        min_face_presence_confidence=args.min_face_presence_confidence,
        min_tracking_confidence=args.min_tracking_confidence,
        camera_id=args.camera_id,
        width=args.frame_width,
        height=args.frame_height,
        candidate_id=args.candidate_id,
        interview_id=args.interview_id
    )


if __name__ == '__main__':
    main()