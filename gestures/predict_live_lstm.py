"""
ISL Live Prediction Script — LSTM (Hands Only)
Uses MediaPipe Tasks API — works with mediapipe >= 0.10.35 + protobuf 7.x
--------------------------------------------------------------------------
Feature vector per frame: 126 floats (63 Left hand + 63 Right hand)
Sequence shape: (30, 126)

Usage:
    python predict_live_lstm.py

Press 'q' to quit.
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
import numpy as np
import math, json, os, tensorflow as tf
from collections import deque, Counter

MODEL_FILE  = "isl_model_lstm.h5"
LABELS_FILE = "isl_labels.json"
MODEL_PATH  = "hand_landmarker.task"
SEQ_LENGTH  = 30
CONF_THRESH = 0.6
SMOOTH_WINDOW = 5

HAND_CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),
    (5,6),(6,7),(7,8),
    (9,10),(10,11),(11,12),
    (13,14),(14,15),(15,16),
    (17,18),(18,19),(19,20),
    (0,5),(5,9),(9,13),(13,17),(0,17),
]


# ─── Normalization (must match collect_data_video.py) ────────────────────────
def normalize_landmarks(landmarks):
    wrist   = landmarks[0]
    shifted = [(lm[0]-wrist[0], lm[1]-wrist[1], lm[2]-wrist[2]) for lm in landmarks]
    ref     = shifted[9]
    scale   = math.sqrt(ref[0]**2 + ref[1]**2 + ref[2]**2)
    if scale < 1e-6:
        scale = 1e-6
    return [v for x, y, z in shifted for v in (x/scale, y/scale, z/scale)]


def draw_hand(frame, hand_lm_list):
    h, w = frame.shape[:2]
    pts = [(int(lm.x * w), int(lm.y * h)) for lm in hand_lm_list]
    for s, e in HAND_CONNECTIONS:
        cv2.line(frame, pts[s], pts[e], (0, 255, 0), 1)
    for pt in pts:
        cv2.circle(frame, pt, 4, (255, 255, 255), -1)


# ─── Load model & labels ──────────────────────────────────────────────────────
if not os.path.exists(MODEL_FILE):
    raise FileNotFoundError(f"'{MODEL_FILE}' not found. Run train_model_lstm.py first.")
if not os.path.exists(LABELS_FILE):
    raise FileNotFoundError(f"'{LABELS_FILE}' not found. Re-run train_model_lstm.py.")

print("Loading LSTM model...")
model = tf.keras.models.load_model(MODEL_FILE)

with open(LABELS_FILE) as f:
    label_map = {int(k): v for k, v in json.load(f).items()}

print(f"Signs: {list(label_map.values())}")
print("Show a sign to the camera. Press 'q' to quit.")


# ─── MediaPipe Tasks — Hand Landmarker Only ──────────────────────────────────
base_opts = mp_tasks.BaseOptions(model_asset_path=MODEL_PATH)
lm_opts   = vision.HandLandmarkerOptions(
    base_options=base_opts,
    num_hands=2,
    min_hand_detection_confidence=0.7,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5,
    running_mode=vision.RunningMode.VIDEO,
)
landmarker = vision.HandLandmarker.create_from_options(lm_opts)

frame_buffer    = deque(maxlen=SEQ_LENGTH)
pred_history    = deque(maxlen=SMOOTH_WINDOW)
cap             = cv2.VideoCapture(0)
prediction_text = "Warming up..."
confidence_val  = 0.0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame    = cv2.flip(frame, 1)
    rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    ts_ms    = int(cap.get(cv2.CAP_PROP_POS_MSEC))
    result   = landmarker.detect_for_video(mp_image, ts_ms)

    # ── Extract landmarks (126 features) ──────────────────────────────────
    hand_data = {"Left": [0.0]*63, "Right": [0.0]*63}

    if result.hand_landmarks and result.handedness:
        for hand_lm, handedness in zip(result.hand_landmarks, result.handedness):
            side = handedness[0].display_name
            raw  = [(lm.x, lm.y, lm.z) for lm in hand_lm]
            hand_data[side] = normalize_landmarks(raw)
            draw_hand(frame, hand_lm)

    row_126 = hand_data["Left"] + hand_data["Right"]
    frame_buffer.append(row_126)

    # ── Run LSTM inference once window is full ────────────────────────────
    if len(frame_buffer) == SEQ_LENGTH:
        seq   = np.array(frame_buffer, dtype=np.float32)[np.newaxis, ...]
        probs = model.predict(seq, verbose=0)[0]
        idx   = int(np.argmax(probs))
        conf  = float(probs[idx])

        if conf >= CONF_THRESH:
            pred_history.append(idx)

        if pred_history:
            best_idx        = Counter(pred_history).most_common(1)[0][0]
            prediction_text = label_map.get(best_idx, "?")
            confidence_val  = conf * 100
        else:
            prediction_text = "Low confidence"
            confidence_val  = conf * 100
    else:
        fill            = len(frame_buffer)
        prediction_text = f"Buffering... {fill}/{SEQ_LENGTH}"
        confidence_val  = 0.0

    # ── HUD ───────────────────────────────────────────────────────────────
    overlay = frame.copy()
    cv2.rectangle(overlay, (5, 5), (500, 85), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.4, frame, 0.6, 0, frame)

    cv2.putText(frame, f"Sign: {prediction_text}",
                (15, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.1, (0, 255, 0), 2)
    if confidence_val > 0:
        cv2.putText(frame, f"Confidence: {confidence_val:.0f}%",
                    (15, 72), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 220, 255), 2)
    cv2.putText(frame, "Press 'q' to quit",
                (10, frame.shape[0]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 100, 255), 1)

    cv2.imshow("ISL Live Prediction — LSTM (Hands Only)", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

landmarker.close()
cap.release()
cv2.destroyAllWindows()
