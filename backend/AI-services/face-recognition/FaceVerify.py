import argparse
import sys
import os
import time

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

# Global variables to calculate FPS and track emotion scores
COUNTER, FPS = 0, 0
START_TIME = time.time()
DETECTION_RESULT = None


# Enhanced emotion tracking
class EmotionTracker:
    def __init__(self):
        # Dictionary to store cumulative scores and frame counts for each emotion
        self.emotion_totals = {}
        self.emotion_frame_counts = {}

        # Emotion keywords to track
        self.emotion_keywords = [
            'browInnerUp', 'browDown', 'browOuterUp',
            'eyeWideOpen', 'eyeSquint', 'eyeClosed',
            'mouthSmile', 'mouthFrown', 'mouthPucker',
            'jawOpen', 'jawForward'
        ]

    def update(self, face_blendshapes):
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


def run(model: str,
        num_faces: int,
        min_face_detection_confidence: float,
        min_face_presence_confidence: float,
        min_tracking_confidence: float,
        camera_id: int,
        width: int,
        height: int) -> None:
    """Continuously run inference on images acquired from the camera with enhanced emotion tracking."""

    # Create emotion tracker
    emotion_tracker = EmotionTracker()

    # Verify model file exists
    if not os.path.exists(model):
        print(f"Error: Model file not found at {model}")
        print("Please download the face_landmarker.task model from MediaPipe and place it in the same directory.")
        sys.exit(1)

    # Start capturing video input from the camera
    cap = cv2.VideoCapture(camera_id)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

    # Visualization parameters
    row_size = 50  # pixels
    left_margin = 24  # pixels
    text_color = (0, 0, 0)  # black
    font_size = 1
    font_thickness = 1
    fps_avg_frame_count = 10

    # Label box parameters
    label_background_color = (255, 255, 255)  # White
    label_padding_width = 1500  # pixels

    def save_result(result: vision.FaceLandmarkerResult,
                    unused_output_image: mp.Image,
                    timestamp_ms: int):
        global FPS, DETECTION_RESULT

        DETECTION_RESULT = result

        # Update emotion tracker
        emotion_tracker.update(result.face_blendshapes)

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
        result_callback=save_result)
    detector = vision.FaceLandmarker.create_from_options(options)

    # Continuously capture images from the camera and run inference
    while cap.isOpened():
        success, image = cap.read()
        if not success:
            sys.exit(
                'ERROR: Unable to read from webcam. Please verify your webcam settings.'
            )

        image = cv2.flip(image, 1)

        # Convert the image from BGR to RGB as required by the TFLite model.
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

        # Run face landmarker using the model.
        detector.detect_async(mp_image, time.time_ns() // 1_000_000)

        # Preserve existing visualization code from original script
        if DETECTION_RESULT:
            # Draw landmarks.
            for face_landmarks in DETECTION_RESULT.face_landmarks:
                face_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
                face_landmarks_proto.landmark.extend([
                    landmark_pb2.NormalizedLandmark(x=landmark.x,
                                                    y=landmark.y,
                                                    z=landmark.z) for
                    landmark in
                    face_landmarks
                ])
                mp_drawing.draw_landmarks(
                    image=image,
                    landmark_list=face_landmarks_proto,
                    connections=mp_face_mesh.FACEMESH_TESSELATION,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=mp.solutions.drawing_styles
                    .get_default_face_mesh_tesselation_style())
                mp_drawing.draw_landmarks(
                    image=image,
                    landmark_list=face_landmarks_proto,
                    connections=mp_face_mesh.FACEMESH_CONTOURS,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=mp.solutions.drawing_styles
                    .get_default_face_mesh_contours_style())
                mp_drawing.draw_landmarks(
                    image=image,
                    landmark_list=face_landmarks_proto,
                    connections=mp_face_mesh.FACEMESH_IRISES,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=mp.solutions.drawing_styles
                    .get_default_face_mesh_iris_connections_style())

        cv2.imshow('face_landmarker', image)

        # Stop the program if the ESC key is pressed.
        if cv2.waitKey(1) == 27:
            break

    # Print final emotion percentages
    print("\n--- Final Emotion Percentages Across All Frames ---")
    final_percentages = emotion_tracker.get_final_percentages()
    for emotion, percentage in sorted(final_percentages.items(), key=lambda x: x[1], reverse=True):
        print(f"{emotion}: {percentage:.2f}%")

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
        '--numFaces',
        help='Max number of faces that can be detected by the landmarker.',
        required=False,
        default=5,
        type=int)
    parser.add_argument(
        '--minFaceDetectionConfidence',
        help='The minimum confidence score for face detection to be considered successful.',
        required=False,
        default=0.5,
        type=float)
    parser.add_argument(
        '--minFacePresenceConfidence',
        help='The minimum confidence score of face presence score in the face landmark detection.',
        required=False,
        default=0.5,
        type=float)
    parser.add_argument(
        '--minTrackingConfidence',
        help='The minimum confidence score for the face tracking to be considered successful.',
        required=False,
        default=0.5,
        type=float)
    parser.add_argument(
        '--cameraId',
        help='Id of camera.',
        required=False,
        default=0,
        type=int)
    parser.add_argument(
        '--frameWidth',
        help='Width of frame to capture from camera.',
        required=False,
        default=1920,
        type=int)
    parser.add_argument(
        '--frameHeight',
        help='Height of frame to capture from camera.',
        required=False,
        default=1080,
        type=int)

    # Parse arguments with explicit type conversion
    args = parser.parse_args()

    # Run the detection
    run(
        model=args.model,
        num_faces=args.numFaces,
        min_face_detection_confidence=args.minFaceDetectionConfidence,
        min_face_presence_confidence=args.minFacePresenceConfidence,
        min_tracking_confidence=args.minTrackingConfidence,
        camera_id=args.cameraId,
        width=args.frameWidth,
        height=args.frameHeight
    )


if __name__ == '__main__':
    main()