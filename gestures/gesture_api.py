"""
Real-Time Gesture Inference API Bridge for IRIS Frontend
----------------------------------------------------------
Runs a lightweight local HTTP server on port 5005.
Receives base64/JPEG camera frames from the browser,
extracts 126 MediaPipe landmarks, feeds them into the
trained LSTM model (isl_model_lstm.h5), and returns
the exact real-time gesture prediction + confidence.
"""

import os
import json
import base64
import math
import numpy as np
import tensorflow as tf
from collections import deque, Counter
from http.server import HTTPServer, BaseHTTPRequestHandler
import cv2

# Suppress noisy TF logs
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision

PORT = 5005
MODEL_FILE = os.path.join(os.path.dirname(__file__), "isl_model_lstm.h5")
LABELS_FILE = os.path.join(os.path.dirname(__file__), "isl_labels.json")
TASK_FILE = os.path.join(os.path.dirname(__file__), "hand_landmarker.task")

print(f"Loading LSTM model from {MODEL_FILE}...")
model = tf.keras.models.load_model(MODEL_FILE)

with open(LABELS_FILE) as f:
    label_map = {int(k): v for k, v in json.load(f).items()}
print(f"Loaded {len(label_map)} gesture classes: {list(label_map.values())}")

# Setup MediaPipe
base_opts = mp_tasks.BaseOptions(model_asset_path=TASK_FILE)
lm_opts = vision.HandLandmarkerOptions(
    base_options=base_opts,
    num_hands=2,
    running_mode=vision.RunningMode.IMAGE
)
landmarker = vision.HandLandmarker.create_from_options(lm_opts)

# Rolling buffer of 30 frames and smoothing window
SEQ_LENGTH = 30
frame_buffer = deque(maxlen=SEQ_LENGTH)
pred_history = deque(maxlen=5)


def normalize_landmarks(landmarks):
    wrist = landmarks[0]
    shifted = [(lm[0]-wrist[0], lm[1]-wrist[1], lm[2]-wrist[2]) for lm in landmarks]
    ref = shifted[9]
    scale = math.sqrt(ref[0]**2 + ref[1]**2 + ref[2]**2) or 1e-6
    return [v for x, y, z in shifted for v in (x/scale, y/scale, z/scale)]


def process_image_and_predict(rgb_image):
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
    result = landmarker.detect(mp_img)

    hand_data = {"Left": [0.0] * 63, "Right": [0.0] * 63}
    hands_detected = False

    if result.hand_landmarks and result.handedness:
        hands_detected = True
        for hand_lm, handedness in zip(result.hand_landmarks, result.handedness):
            side = handedness[0].display_name
            raw = [(lm.x, lm.y, lm.z) for lm in hand_lm]
            hand_data[side] = normalize_landmarks(raw)

    row_126 = hand_data["Left"] + hand_data["Right"]
    frame_buffer.append(row_126)

    if len(frame_buffer) < SEQ_LENGTH:
        return {
            "gesture": "buffering",
            "label": f"Buffering ({len(frame_buffer)}/{SEQ_LENGTH})",
            "confidence": 0,
            "handsDetected": hands_detected
        }

    seq = np.array(frame_buffer, dtype=np.float32)[np.newaxis, ...]
    probs = model.predict(seq, verbose=0)[0]
    idx = int(np.argmax(probs))
    conf = float(probs[idx])

    if conf >= 0.5:
        pred_history.append(idx)

    best_idx = Counter(pred_history).most_common(1)[0][0] if pred_history else idx
    predicted_label = label_map.get(best_idx, "unclear")

    return {
        "gesture": predicted_label,
        "label": predicted_label,
        "confidence": round(conf * 100, 1),
        "handsDetected": hands_detected
    }


class GestureRequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path == "/predict":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)

            try:
                data = json.loads(body.decode("utf-8"))
                # base64 data URL: "data:image/jpeg;base64,..."
                image_data = data.get("image", "")
                if "," in image_data:
                    image_data = image_data.split(",")[1]

                img_bytes = base64.b64decode(image_data)
                np_arr = np.frombuffer(img_bytes, np.uint8)
                bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
                rgb = cv2.flip(rgb, 1)  # Mirror to match OpenCV training data
                
                prediction = process_image_and_predict(rgb)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(prediction).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "classes": list(label_map.values())
            }).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silence standard HTTP access logging to prevent console spam
        pass


def run_server():
    server = HTTPServer(("0.0.0.0", PORT), GestureRequestHandler)
    print(f"[*] Real-Time Gesture AI API running on http://localhost:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    run_server()
