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
from deepface import DeepFace
import warnings

# Suppress DeepFace warnings for cleaner output
warnings.filterwarnings("ignore")

DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'face_landmarker.task')

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles


class InterviewMonitoringSystem:
    def __init__(self, candidate_photos: list):
        # Existing MediaPipe Tracking
        self.start_time = time.time()
        self.total_interview_duration = 0
        self.face_detection_count = 0
        self.max_simultaneous_faces = 0
        self.off_screen_duration = 0
        self.last_frame_time = time.time()

        # Existing emotion tracking
        self.emotion_totals = {}
        self.emotion_frame_counts = {}

        # Existing violation tracking
        self.violations = {
            'face_off_screen': 0,
            'multiple_faces': 0,
            'head_movement': {
                'excessive_rotation': 0,
                'total_rotations': []
            }
        }

        # Existing emotion keywords
        self.emotion_keywords = [
            'browInnerUp', 'browDown', 'browOuterUp',
            'eyeWideOpen', 'eyeSquint', 'eyeClosed',
            'mouthSmile', 'mouthFrown', 'mouthPucker',
            'jawOpen', 'jawForward'
        ]

        # Enhanced DeepFace Tracking with verification
        self.deepface_data = {
            'emotions': dict.fromkeys(['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'], 0.0),
            'gender': {'Man': 0.0, 'Woman': 0.0},
            'race': dict.fromkeys(['asian', 'indian', 'black', 'white', 'middle eastern', 'latino hispanic'], 0.0),
            'age': [],
            'face_confidence': [],
            'analyzed_frames': 0,
            'valid_faces': 0,
            'verification': {
                'matches': 0,
                'mismatches': 0,
                'consecutive_mismatches': 0,
                'violation_triggered': False
            }
        }

        # Store candidate photos as numpy arrays
        self.candidate_photos = [self.bytes_to_image(photo) for photo in candidate_photos]
        self.verification_threshold = 5  # Allowed consecutive mismatches

    def bytes_to_image(self, photo_bytes):
        """Convert stored bytes to OpenCV image"""
        nparr = np.frombuffer(photo_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    def verify_face(self, frame):
        """Verify if frame matches any candidate photos"""
        try:
            for stored_img in self.candidate_photos:
                result = DeepFace.verify(
                    img1_path=frame,
                    img2_path=stored_img,
                    detector_backend='opencv',
                    enforce_detection=False,
                    silent=True
                )
                if result['verified']:
                    self.deepface_data['verification']['matches'] += 1
                    self.deepface_data['verification']['consecutive_mismatches'] = 0
                    return True

            self.deepface_data['verification']['mismatches'] += 1
            self.deepface_data['verification']['consecutive_mismatches'] += 1

            if self.deepface_data['verification']['consecutive_mismatches'] >= self.verification_threshold:
                self.deepface_data['verification']['violation_triggered'] = True
                return False

            return True

        except Exception as e:
            print(f"Verification error: {str(e)}")
            return False

    def update_tracking(self, detection_result, image_shape):
        # Existing MediaPipe tracking logic remains unchanged
        current_time = time.time()
        frame_duration = current_time - self.last_frame_time
        self.last_frame_time = current_time
        self.total_interview_duration += frame_duration

        if detection_result and detection_result.face_landmarks:
            current_face_count = len(detection_result.face_landmarks)
            self.max_simultaneous_faces = max(self.max_simultaneous_faces, current_face_count)

            if current_face_count > 1:
                self.violations['multiple_faces'] += 1

            for face_landmarks in detection_result.face_landmarks:
                if any(landmark.x < 0 or landmark.x > 1 or landmark.y < 0 or landmark.y > 1 for landmark in
                       face_landmarks):
                    self.off_screen_duration += frame_duration
                    self.violations['face_off_screen'] += 1

                head_rotation = self.calculate_head_rotation(face_landmarks)
                self.violations['head_movement']['total_rotations'].append(head_rotation)
                if abs(head_rotation) > 30:
                    self.violations['head_movement']['excessive_rotation'] += 1

        if detection_result and detection_result.face_blendshapes:
            self.update_emotion_scores(detection_result.face_blendshapes)

    def update_deepface_analysis(self, frame):
        # Existing DeepFace analysis with verification check
        try:
            if not self.verify_face(frame):
                return False

            results = DeepFace.analyze(
                img_path=frame,
                actions=['emotion', 'age', 'gender', 'race'],
                enforce_detection=False,
                detector_backend='opencv',
                silent=True
            )

            if results and isinstance(results, list):
                self.deepface_data['analyzed_frames'] += 1
                result = results[0]

                if result.get('face_confidence', 0) > 0.5:
                    self.deepface_data['valid_faces'] += 1

                    # Track all emotions
                    for emotion, score in result['emotion'].items():
                        self.deepface_data['emotions'][emotion] += score

                    # Track gender probabilities
                    for gender, score in result['gender'].items():
                        self.deepface_data['gender'][gender] += score

                    # Track race probabilities
                    for race, score in result['race'].items():
                        self.deepface_data['race'][race] += score

                    # Track age and confidence
                    self.deepface_data['age'].append(result.get('age', 0))
                    self.deepface_data['face_confidence'].append(result.get('face_confidence', 0))

            return True

        except Exception as e:
            print(f"DeepFace error: {str(e)}")
            return False

    def generate_interview_report(self):
        # Existing report generation with verification metrics
        emotion_percentages = {k: (v / self.emotion_frame_counts[k] * 100) if k in self.emotion_frame_counts else 0
                               for k, v in self.emotion_totals.items()}
        avg_head_rotation = np.mean(self.violations['head_movement']['total_rotations']) if \
            self.violations['head_movement']['total_rotations'] else 0

        # Enhanced DeepFace metrics
        deepface_report = {
            'emotion': self._calculate_avg_percentages(self.deepface_data['emotions']),
            'gender': self._calculate_avg_percentages(self.deepface_data['gender']),
            'race': self._calculate_avg_percentages(self.deepface_data['race']),
            'age': self._calculate_avg(self.deepface_data['age']),
            'face_confidence': self._calculate_avg(self.deepface_data['face_confidence']),
            'face_detection_rate': (self.deepface_data['valid_faces'] / self.deepface_data['analyzed_frames'] * 100
                                    if self.deepface_data['analyzed_frames'] > 0 else 0),
            'analyzed_frames': self.deepface_data['analyzed_frames'],
            'valid_faces': self.deepface_data['valid_faces'],
            'verification': {
                'total_matches': self.deepface_data['verification']['matches'],
                'total_mismatches': self.deepface_data['verification']['mismatches'],
                'violation_triggered': self.deepface_data['verification']['violation_triggered']
            }
        }

        report = {
            "Interview Duration": f"{self.total_interview_duration:.2f} seconds",
            "Maximum Simultaneous Faces": self.max_simultaneous_faces,
            "Off-Screen Duration": f"{self.off_screen_duration:.2f} seconds",
            "Violations": {
                "Multiple Faces Detected": self.violations['multiple_faces'],
                "Face Off-Screen Instances": self.violations['face_off_screen'],
                "Excessive Head Rotation Instances": self.violations['head_movement']['excessive_rotation'],
                "Identity Verification Failed": self.deepface_data['verification']['violation_triggered']
            },
            "Average Head Rotation": f"{avg_head_rotation:.2f} degrees",
            "MediaPipe Emotion Percentages": emotion_percentages,
            "DeepFace Analysis": deepface_report
        }
        return report

    def save_report_to_csv(self, report):
        # Existing CSV saving with verification data
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_report_{timestamp}.csv"
        os.makedirs("interview_reports", exist_ok=True)
        filepath = os.path.join("interview_reports", filename)

        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)

            # Basic Metrics
            writer.writerow(["Metric", "Value"])
            writer.writerow(["Interview Duration", report["Interview Duration"]])
            writer.writerow(["Maximum Simultaneous Faces", report["Maximum Simultaneous Faces"]])
            writer.writerow(["Off-Screen Duration", report["Off-Screen Duration"]])
            writer.writerow(["Average Head Rotation", report["Average Head Rotation"]])

            # Violations
            writer.writerow([])
            writer.writerow(["Violations", ""])
            for violation, count in report["Violations"].items():
                writer.writerow([violation, count])

            # MediaPipe Emotions
            writer.writerow([])
            writer.writerow(["MediaPipe Emotion Percentages", ""])
            for emotion, percentage in report["MediaPipe Emotion Percentages"].items():
                writer.writerow([emotion, f"{percentage:.2f}%"])

            # DeepFace Analysis
            writer.writerow([])
            writer.writerow(["DeepFace Analysis", ""])
            writer.writerow(["Emotion", "Percentage"])
            for emotion, percentage in report["DeepFace Analysis"]["emotion"].items():
                writer.writerow([emotion, percentage])

            writer.writerow(["Gender", "Percentage"])
            for gender, percentage in report["DeepFace Analysis"]["gender"].items():
                writer.writerow([gender, percentage])

            writer.writerow(["Race", "Percentage"])
            for race, percentage in report["DeepFace Analysis"]["race"].items():
                writer.writerow([race, percentage])

            # Verification Metrics
            writer.writerow([])
            writer.writerow(["Facial Verification", ""])
            writer.writerow(["Total Matches", report["DeepFace Analysis"]["verification"]["total_matches"]])
            writer.writerow(["Total Mismatches", report["DeepFace Analysis"]["verification"]["total_mismatches"]])
            writer.writerow(["Violation Triggered", report["DeepFace Analysis"]["verification"]["violation_triggered"]])

            # Existing DeepFace metrics...

        return filepath


def run(model: str, num_faces: int, min_face_detection_confidence: float,
        min_face_presence_confidence: float, min_tracking_confidence: float,
        camera_id: int, width: int, height: int, candidate_photos: list) -> None:
    interview_monitor = InterviewMonitoringSystem(candidate_photos)

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
        interview_monitor.update_tracking(result, output_image.numpy_view().shape))
    detector = vision.FaceLandmarker.create_from_options(options)

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            sys.exit('ERROR: Unable to read from webcam.')

        # Perform face verification first
        verification_result = interview_monitor.update_deepface_analysis(image)

        if not verification_result:
            print("\nALERT: Identity verification failed! Stopping stream.")
            cv2.putText(image, "VERIFICATION FAILED - STOPPING STREAM", (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.imshow('Interview Monitoring System', image)
            cv2.waitKey(3000)  # Show alert for 3 seconds
            break

        # Existing processing
        image = cv2.flip(image, 1)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

        detector.detect_async(mp_image, time.time_ns() // 1_000_000)
        cv2.imshow('Interview Monitoring System', image)

        if cv2.waitKey(1) == 27:
            break

    # Generate and show report
    final_report = interview_monitor.generate_interview_report()
    report_path = interview_monitor.save_report_to_csv(final_report)

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
    parser.add_argument(
        '--candidate_id',
        help='Candidate ID to fetch stored photos',
        required=True,
        type=int)

    args = parser.parse_args()

    # Mock database call - replace with actual DB fetch
    candidate_photos = [
        # Replace with actual photo bytes retrieval
        b'mock_photo_1_bytes',
        b'mock_photo_2_bytes',
        b'mock_photo_3_bytes',
        b'mock_photo_4_bytes',
        b'mock_photo_5_bytes'
    ]

    run(
        model=args.model,
        num_faces=args.num_faces,
        min_face_detection_confidence=args.min_face_detection_confidence,
        min_face_presence_confidence=args.min_face_presence_confidence,
        min_tracking_confidence=args.min_tracking_confidence,
        camera_id=args.camera_id,
        width=args.frame_width,
        height=args.frame_height,
        candidate_photos=candidate_photos
    )


if __name__ == '__main__':
    main()