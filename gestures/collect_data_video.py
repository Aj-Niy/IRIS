"""
ISL Video Data Collection Script (HANDS ONLY, 2-HAND with COUNTDOWN)
Uses MediaPipe Tasks API — works with mediapipe >= 0.10.35 + protobuf 7.x
--------------------------------------------------------------------------
Feature vector per frame: 126 floats (63 Left hand + 63 Right hand)
Sequence shape: (seq_length, 126)

Controls:
    's' -> start auto-recording with countdown (or pause)
    'q' -> quit early
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision
import os, sys, math, time, numpy as np

# ── Constants ─────────────────────────────────────────────────────────────────
DATA_DIR              = "isl_data"
MODEL_PATH            = "hand_landmarker.task"
DEFAULT_NUM_SEQUENCES = 50
DEFAULT_SEQ_LENGTH    = 30
COUNTDOWN_SECONDS     = 2.0   # seconds to get hands ready before recording starts
PAUSE_BETWEEN_SEQS    = 1.5   # rest pause between consecutive sequences

HAND_CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),
    (5,6),(6,7),(7,8),
    (9,10),(10,11),(11,12),
    (13,14),(14,15),(15,16),
    (17,18),(18,19),(19,20),
    (0,5),(5,9),(9,13),(13,17),(0,17),
]


# ── Helpers ───────────────────────────────────────────────────────────────────
def normalize_landmarks(landmarks):
    """landmarks: list of 21 (x,y,z) tuples -> flat 63-float normalised list"""
    wrist   = landmarks[0]
    shifted = [(lm[0]-wrist[0], lm[1]-wrist[1], lm[2]-wrist[2]) for lm in landmarks]
    ref     = shifted[9]
    scale   = math.sqrt(ref[0]**2 + ref[1]**2 + ref[2]**2)
    if scale < 1e-6:
        scale = 1e-6
    return [v for x, y, z in shifted for v in (x/scale, y/scale, z/scale)]


def draw_hand(frame, hand_lm_list):
    """Draw skeleton on frame given list of landmark objects."""
    h, w = frame.shape[:2]
    pts = [(int(lm.x * w), int(lm.y * h)) for lm in hand_lm_list]
    for s, e in HAND_CONNECTIONS:
        cv2.line(frame, pts[s], pts[e], (0, 255, 0), 1)
    for pt in pts:
        cv2.circle(frame, pt, 4, (255, 255, 255), -1)


def draw_progress_bar(frame, progress, total, x=10, y=90, width=300, height=20):
    cv2.rectangle(frame, (x, y), (x+width, y+height), (50, 50, 50), -1)
    fill = int(width * progress / total) if total > 0 else 0
    cv2.rectangle(frame, (x, y), (x+fill, y+height), (0, 220, 0), -1)
    cv2.rectangle(frame, (x, y), (x+width, y+height), (200, 200, 200), 1)


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if len(sys.argv) < 2:
        print("Usage: python collect_data_video.py <sign_label> [num_sequences] [seq_length]")
        sys.exit(1)

    label         = sys.argv[1]
    num_sequences = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_NUM_SEQUENCES
    seq_length    = int(sys.argv[3]) if len(sys.argv) > 3 else DEFAULT_SEQ_LENGTH

    label_dir = os.path.join(DATA_DIR, label)
    os.makedirs(label_dir, exist_ok=True)
    existing  = [f for f in os.listdir(label_dir) if f.endswith(".npy")]
    start_idx = len(existing) + 1

    print(f"Sign label     : '{label}'")
    print(f"Sequences      : {num_sequences}  (starting at #{start_idx})")
    print(f"Frames/sequence: {seq_length}")
    print(f"Saving to      : {label_dir}/")
    print("\nClick the camera window and press 's' to START (countdown gives you time to pose).")

    # ── MediaPipe Tasks ───────────────────────────────────────────────────
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

    cap = cv2.VideoCapture(0)

    # State machine: 'PAUSED', 'COUNTDOWN', 'RECORDING'
    state           = "PAUSED"
    countdown_start = 0
    collected       = 0
    buffer          = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame     = cv2.flip(frame, 1)
        rgb       = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image  = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        ts_ms     = int(cap.get(cv2.CAP_PROP_POS_MSEC))
        result    = landmarker.detect_for_video(mp_image, ts_ms)

        # ── Extract landmarks ─────────────────────────────────────────────
        hand_data = {"Left": [0.0]*63, "Right": [0.0]*63}

        if result.hand_landmarks and result.handedness:
            for hand_lm, handedness in zip(result.hand_landmarks, result.handedness):
                side = handedness[0].display_name
                raw  = [(lm.x, lm.y, lm.z) for lm in hand_lm]
                hand_data[side] = normalize_landmarks(raw)
                draw_hand(frame, hand_lm)

        row_126 = hand_data["Left"] + hand_data["Right"]

        # ── Handle State Transitions ──────────────────────────────────────
        now = time.time()

        if state == "COUNTDOWN":
            elapsed = now - countdown_start
            remaining = COUNTDOWN_SECONDS - elapsed
            if remaining <= 0:
                state = "RECORDING"
                buffer = []

        elif state == "RECORDING":
            buffer.append(row_126)
            if len(buffer) >= seq_length:
                arr      = np.array(buffer[:seq_length], dtype=np.float32)
                filename = os.path.join(label_dir, f"{start_idx + collected:04d}.npy")
                np.save(filename, arr)
                collected += 1
                buffer    = []
                print(f"  Saved sequence {collected}/{num_sequences} -> {filename}")

                if collected >= num_sequences:
                    break
                else:
                    # Give a short pause before next sequence starts countdown
                    state = "COUNTDOWN"
                    countdown_start = now + (PAUSE_BETWEEN_SEQS - COUNTDOWN_SECONDS)

        # ── HUD Display ───────────────────────────────────────────────────
        cv2.putText(frame, f"Label: '{label}'  Seq: {collected}/{num_sequences}",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        if state == "PAUSED":
            cv2.putText(frame, "STATUS: PAUSED (Press 's' to start)",
                        (10, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)
            cv2.putText(frame, "Tip: You'll have 2 seconds to position both hands!",
                        (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1)

        elif state == "COUNTDOWN":
            remaining = max(0.0, COUNTDOWN_SECONDS - (now - countdown_start))
            cv2.putText(frame, f"GET READY IN: {remaining:.1f}s",
                        (10, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (0, 255, 255), 2)
            # Center countdown
            h, w = frame.shape[:2]
            cv2.putText(frame, f"{math.ceil(remaining)}",
                        (w//2 - 20, h//2), cv2.FONT_HERSHEY_SIMPLEX, 2.5, (0, 255, 255), 4)

        elif state == "RECORDING":
            cv2.putText(frame, ">>> RECORDING (HOLD / PERFORM SIGN) <<<",
                        (10, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            draw_progress_bar(frame, len(buffer), seq_length)
            cv2.putText(frame, f"Frame {len(buffer)}/{seq_length}",
                        (320, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1)

        cv2.putText(frame, "Press 's' to Pause/Resume, 'q' to Quit",
                    (10, frame.shape[0]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (120, 120, 255), 1)

        cv2.imshow("ISL Video Data Collection (Hands Only)", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            if state == "PAUSED":
                state = "COUNTDOWN"
                countdown_start = time.time()
            else:
                state = "PAUSED"
                buffer = []
        elif key == ord('q') or collected >= num_sequences:
            break

    landmarker.close()
    cap.release()
    cv2.destroyAllWindows()
    print(f"\nDone! Collected {collected} sequences for '{label}' -> {label_dir}/")


if __name__ == "__main__":
    main()
