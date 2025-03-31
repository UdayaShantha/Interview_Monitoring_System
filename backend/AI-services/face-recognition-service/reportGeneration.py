import argparse
import asyncio
import sys
import os
import threading
import time
import csv
from datetime import datetime
import cv2
import mediapipe as mp
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from deepface import DeepFace

DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'face_landmarker.task')

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

executor = ThreadPoolExecutor(max_workers=4)  # Optimized for parallel processing

class InterviewMonitoringSystem:
    def __init__(self):
        # MediaPipe Tracking
        self.start_time = time.time()
        self.total_interview_duration = 0
        self.face_detection_count = 0
        self.max_simultaneous_faces = 0
        self.off_screen_duration = 0
        self.last_frame_time = time.time()
        self.frame_counter = 0
        self.deepface_frame_skip = 15  # Process DeepFace every 15 frames
        self.processing_lock = threading.Lock()
        self.emotion_totals = {}
        self.emotion_frame_counts = {}

        self.violations = {
            'face_off_screen': 0,
            'multiple_faces': 0,
            'head_movement': {
                'excessive_rotation': 0,
                'total_rotations': []
            }
        }

        self.emotion_keywords = [
            'browInnerUp', 'browDown', 'browOuterUp',
            'eyeWideOpen', 'eyeSquint', 'eyeClosed',
            'mouthSmile', 'mouthFrown', 'mouthPucker',
            'jawOpen', 'jawForward'
        ]

        # Enhanced DeepFace Tracking with locks
        self.deepface_data = {
            'emotions': dict.fromkeys(['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'], 0.0),
            'gender': {'Man': 0.0, 'Woman': 0.0},
            'race': dict.fromkeys(['asian', 'indian', 'black', 'white', 'middle eastern', 'latino hispanic'], 0.0),
            'age': [],
            'face_confidence': [],
            'analyzed_frames': 0,
            'valid_faces': 0
        }
        self.deepface_lock = threading.Lock()

    def update_tracking(self, detection_result, image_shape):
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

    async def update_deepface_analysis(self, frame):
        self.frame_counter += 1
        if self.frame_counter % self.deepface_frame_skip != 0:
            return

        # Convert frame to RGB for DeepFace
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        loop = asyncio.get_event_loop()
        try:
            results = await loop.run_in_executor(
                executor,
                lambda: DeepFace.analyze(
                    img_path=rgb_frame,
                    actions=['emotion', 'age', 'gender', 'race'],
                    enforce_detection=False,
                    detector_backend='retinaface',  # Use retinaface for better accuracy
                    silent=True
                )
            )

            if results and isinstance(results, list):
                with self.deepface_lock:
                    self.deepface_data['analyzed_frames'] += 1
                    result = results[0]

                    if result.get('face_confidence', 0) > 0.5:
                        self.deepface_data['valid_faces'] += 1

                        # Update emotions
                        for emotion, score in result['emotion'].items():
                            self.deepface_data['emotions'][emotion] += score

                        # Update gender
                        for gender, score in result['gender'].items():
                            self.deepface_data['gender'][gender] += score

                        # Update race
                        for race, score in result['race'].items():
                            self.deepface_data['race'][race] += score

                        # Update age and confidence
                        self.deepface_data['age'].append(result.get('age', 0))
                        self.deepface_data['face_confidence'].append(result.get('face_confidence', 0))

        except Exception as e:
            print(f"DeepFace error: {str(e)}")

    def calculate_head_rotation(self, face_landmarks):
        nose_tip = face_landmarks[4]
        chin = face_landmarks[152]
        dx = nose_tip.x - chin.x
        dy = nose_tip.y - chin.y
        return np.degrees(np.arctan2(dy, dx))

    def update_emotion_scores(self, face_blendshapes):
        if face_blendshapes:
            for category in face_blendshapes[0]:
                category_name = category.category_name
                if any(keyword in category_name for keyword in self.emotion_keywords):
                    score = category.score
                    self.emotion_totals[category_name] = self.emotion_totals.get(category_name, 0) + score
                    self.emotion_frame_counts[category_name] = self.emotion_frame_counts.get(category_name, 0) + 1

    def generate_interview_report(self):
        emotion_percentages = {k: (v / self.emotion_frame_counts[k] * 100) if k in self.emotion_frame_counts else 0 for k, v in self.emotion_totals.items()}
        avg_head_rotation = np.mean(self.violations['head_movement']['total_rotations']) if self.violations['head_movement']['total_rotations'] else 0

        deepface_report = {
            'emotion': self._calculate_avg_percentages(self.deepface_data['emotions']),
            'gender': self._calculate_avg_percentages(self.deepface_data['gender']),
            'race': self._calculate_avg_percentages(self.deepface_data['race']),
            'age': self._calculate_avg(self.deepface_data['age']),
            'face_confidence': self._calculate_avg(self.deepface_data['face_confidence']),
            'face_detection_rate': (self.deepface_data['valid_faces'] / self.deepface_data['analyzed_frames'] * 100 if self.deepface_data['analyzed_frames'] > 0 else 0),
            'analyzed_frames': self.deepface_data['analyzed_frames'],
            'valid_faces': self.deepface_data['valid_faces']
        }

        report = {
            "Interview Duration": f"{self.total_interview_duration:.2f} seconds",
            "Maximum Simultaneous Faces": self.max_simultaneous_faces,
            "Off-Screen Duration": f"{self.off_screen_duration:.2f} seconds",
            "Violations": {
                "Multiple Faces Detected": self.violations['multiple_faces'],
                "Face Off-Screen Instances": self.violations['face_off_screen'],
                "Excessive Head Rotation Instances": self.violations['head_movement']['excessive_rotation']
            },
            "Average Head Rotation": f"{avg_head_rotation:.2f} degrees",
            "MediaPipe Emotion Percentages": emotion_percentages,
            "DeepFace Analysis": deepface_report
        }
        return report

    def _calculate_avg_percentages(self, data_dict):
        total = sum(data_dict.values())
        return {k: f"{(v / total * 100 if total > 0 else 0):.2f}%" for k, v in data_dict.items()}

    def _calculate_avg(self, data_list):
        return f"{np.mean(data_list):.2f}" if data_list else "N/A"

    def save_report_to_csv(self, report):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_report_{timestamp}.csv"
        os.makedirs("interview_reports", exist_ok=True)
        filepath = os.path.join("interview_reports", filename)

        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["Metric", "Value"])
            writer.writerow(["Interview Duration", report["Interview Duration"]])
            writer.writerow(["Maximum Simultaneous Faces", report["Maximum Simultaneous Faces"]])
            writer.writerow(["Off-Screen Duration", report["Off-Screen Duration"]])
            writer.writerow(["Average Head Rotation", report["Average Head Rotation"]])
            writer.writerow([])
            writer.writerow(["Violations", ""])
            for violation, count in report["Violations"].items():
                writer.writerow([violation, count])
            writer.writerow([])
            writer.writerow(["MediaPipe Emotion Percentages", ""])
            for emotion, percentage in report["MediaPipe Emotion Percentages"].items():
                writer.writerow([emotion, f"{percentage:.2f}%"])
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
            writer.writerow(["Average Age", report["DeepFace Analysis"]["age"]])
            writer.writerow(["Average Face Confidence", report["DeepFace Analysis"]["face_confidence"]])
            writer.writerow(["Face Detection Rate", f"{report['DeepFace Analysis']['face_detection_rate']:.2f}%"])
            writer.writerow(["Analyzed Frames", report["DeepFace Analysis"]["analyzed_frames"]])
            writer.writerow(["Valid Face Detections", report["DeepFace Analysis"]["valid_faces"]])

        print(f"Report saved to {filepath}")
        return filepath

def run(model: str, num_faces: int, min_face_detection_confidence: float,
        min_face_presence_confidence: float, min_tracking_confidence: float,
        camera_id: int, width: int, height: int, stop_event: threading.Event) -> None:

    interview_monitor = InterviewMonitoringSystem()

    # Initialize camera with lower resolution first
    cap = cv2.VideoCapture(camera_id)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    time.sleep(2)  # Warm-up camera
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

    # Initialize MediaPipe with higher confidence thresholds
    base_options = python.BaseOptions(model_asset_path=model)
    options = vision.FaceLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.LIVE_STREAM,
        num_faces=1,  # Only expect 1 face
        min_face_detection_confidence=0.7,
        min_face_presence_confidence=0.7,
        min_tracking_confidence=0.7,
        output_face_blendshapes=True,
        result_callback=lambda result, output_image, timestamp:
        interview_monitor.update_tracking(result, output_image.numpy_view().shape)
    )
    detector = vision.FaceLandmarker.create_from_options(options)

    while not stop_event.is_set():
        success, image = cap.read()
        if not success:
            break

        image = cv2.flip(image, 1)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

        # Run DeepFace analysis asynchronously
        asyncio.run(interview_monitor.update_deepface_analysis(image))

        detector.detect_async(mp_image, time.time_ns() // 1_000_000)
        cv2.imshow('Interview Monitoring System', image)

        if cv2.waitKey(1) == 27:  # ESC key to stop
            stop_event.set()
            break

    # Cleanup
    detector.close()
    cap.release()
    cv2.destroyAllWindows()

def main():
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--model', help='Path to face landmarker model.', required=False, default=DEFAULT_MODEL_PATH)
    parser.add_argument('--num_faces', help='Max number of faces that can be detected by the landmarker.', required=False, default=5, type=int)
    parser.add_argument('--min_face_detection_confidence', help='The minimum confidence score for face detection to be considered successful.', required=False, default=0.5, type=float)
    parser.add_argument('--min_face_presence_confidence', help='The minimum confidence score of face presence score in the face landmark detection.', required=False, default=0.5, type=float)
    parser.add_argument('--min_tracking_confidence', help='The minimum confidence score for the face tracking to be considered successful.', required=False, default=0.5, type=float)
    parser.add_argument('--camera_id', help='Id of camera.', required=False, default=0, type=int)
    parser.add_argument('--frame_width', help='Width of frame to capture from camera.', required=False, default=1920, type=int)
    parser.add_argument('--frame_height', help='Height of frame to capture from camera.', required=False, default=1080, type=int)

    args = parser.parse_args()

    stop_event = threading.Event()
    run(
        model=args.model,
        num_faces=args.num_faces,
        min_face_detection_confidence=args.min_face_detection_confidence,
        min_face_presence_confidence=args.min_face_presence_confidence,
        min_tracking_confidence=args.min_tracking_confidence,
        camera_id=args.camera_id,
        width=args.frame_width,
        height=args.frame_height,
        stop_event=stop_event
    )

if __name__ == '__main__':
    main()