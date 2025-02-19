import argparse
import sys
import os
import time
import csv
from datetime import datetime

import cv2
import mediapipe as mp
import numpy as np
import face_recognition  # New dependency

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
        # Existing tracking variables
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

        # Face verification system
        self.reference_encodings = self.load_reference_encodings()
        self.verification_passed = False
        self.verification_failure_start = None
        self.shutdown_triggered = False

    def load_reference_encodings(self):
        """Load and encode reference face images"""
        encodings = []
        for i in range(1, 6):
            path = os.path.join(os.path.dirname(__file__), f'{i}.png')
            if not os.path.exists(path):
                print(f'Error: Reference image {path} not found!')
                continue

            image = face_recognition.load_image_file(path)
            face_locations = face_recognition.face_locations(image)
            if not face_locations:
                print(f'No face found in reference image {path}!')
                continue

            face_encodings = face_recognition.face_encodings(image, face_locations)
            if face_encodings:
                encodings.append(face_encodings[0])

        if not encodings:
            print('Error: No valid reference faces found!')
            sys.exit(1)

        return encodings

    def update_verification_status(self, frame):
        """Update face verification status"""
        # Convert MediaPipe image to numpy array
        rgb_image = frame.numpy_view()
        bgr_image = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)

        # Find all face locations and encodings in current frame
        face_locations = face_recognition.face_locations(bgr_image)
        face_encodings = face_recognition.face_encodings(bgr_image, face_locations)

        # Reset verification status
        self.verification_passed = False

        # Check against reference encodings
        for encoding in face_encodings:
            matches = face_recognition.compare_faces(
                self.reference_encodings, encoding, tolerance=0.5
            )
            if any(matches):
                self.verification_passed = True
                self.verification_failure_start = None
                break

        # Update verification failure timer
        if not self.verification_passed:
            if self.verification_failure_start is None:
                self.verification_failure_start = time.time()
        else:
            self.verification_failure_start = None

    def update_tracking(self, detection_result, output_image):
        """
        Update tracking metrics and handle face verification

        Args:
            detection_result: MediaPipe face detection result
            output_image: MediaPipe image object
        """
        current_time = time.time()
        frame_duration = current_time - self.last_frame_time
        self.last_frame_time = current_time

        # Update face verification status
        self.update_verification_status(output_image)

        # Existing tracking updates
        self.total_interview_duration += frame_duration

        if detection_result and detection_result.face_landmarks:
            current_face_count = len(detection_result.face_landmarks)
            self.max_simultaneous_faces = max(
                self.max_simultaneous_faces,
                current_face_count
            )

            if current_face_count > 1:
                self.violations['multiple_faces'] += 1

            for face_landmarks in detection_result.face_landmarks:
                if any(landmark.x < 0 or landmark.x > 1 or
                       landmark.y < 0 or landmark.y > 1 for landmark in face_landmarks):
                    self.off_screen_duration += frame_duration
                    self.violations['face_off_screen'] += 1

                head_rotation = self.calculate_head_rotation(face_landmarks)
                self.violations['head_movement']['total_rotations'].append(head_rotation)
                if abs(head_rotation) > 30:
                    self.violations['head_movement']['excessive_rotation'] += 1

        if detection_result and detection_result.face_blendshapes:
            self.update_emotion_scores(detection_result.face_blendshapes)

    # Rest of the existing methods remain unchanged
    # (calculate_head_rotation, update_emotion_scores,
    # get_final_percentages, generate_interview_report,
    # save_report_to_csv)


def run(model: str, num_faces: int, min_face_detection_confidence: float,
        min_face_presence_confidence: float, min_tracking_confidence: float,
        camera_id: int, width: int, height: int) -> None:
    """Continuously run inference with enhanced face verification"""

    interview_monitor = InterviewMonitoringSystem()

    if not os.path.exists(model):
        print(f"Error: Model file not found at {model}")
        sys.exit(1)

    cap = cv2.VideoCapture(camera_id)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

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
        interview_monitor.update_tracking(result, output_image)
    )
    detector = vision.FaceLandmarker.create_from_options(options)

    while cap.isOpened() and not interview_monitor.shutdown_triggered:
        success, image = cap.read()
        if not success:
            sys.exit('ERROR: Unable to read from webcam.')

        image = cv2.flip(image, 1)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

        detector.detect_async(mp_image, time.time_ns() // 1_000_000)

        # Handle face verification warnings
        if interview_monitor.verification_failure_start is not None:
            elapsed = time.time() - interview_monitor.verification_failure_start
            if elapsed >= 10:
                interview_monitor.shutdown_triggered = True
                cv2.putText(image, "VERIFICATION FAILED - SHUTTING DOWN", (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                cv2.imshow('Interview Monitoring System', image)
                cv2.waitKey(2000)  # Display message for 2 seconds
                break
            else:
                cv2.putText(image, f"VERIFICATION FAILED - Shutting down in {10 - int(elapsed)}s",
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        else:
            cv2.putText(image, "Verified Candidate", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        cv2.imshow('Interview Monitoring System', image)

        if cv2.waitKey(1) == 27:
            break

    # Final report generation
    if interview_monitor.shutdown_triggered:
        print("\nALERT: Terminated due to verification failure!")
    else:
        print("\nInterview completed normally")

    final_report = interview_monitor.generate_interview_report()
    report_path = interview_monitor.save_report_to_csv(final_report)

    print("\n--- Final Report ---")
    for key, value in final_report.items():
        print(f"{key}: {value}")

    detector.close()
    cap.release()
    cv2.destroyAllWindows()


# Rest of the code (main function and arg parsing) remains unchanged


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
        default=1920,
        type=int)
    parser.add_argument(
        '--frame_height',
        help='Height of frame to capture from camera.',
        required=False,
        default=1080,
        type=int)

    args = parser.parse_args()

    run(
        model=args.model,
        num_faces=args.num_faces,
        min_face_detection_confidence=args.min_face_detection_confidence,
        min_face_presence_confidence=args.min_face_presence_confidence,
        min_tracking_confidence=args.min_tracking_confidence,
        camera_id=args.camera_id,
        width=args.frame_width,
        height=args.frame_height
    )


if __name__ == '__main__':
    main()