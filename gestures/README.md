# Indian Sign Language (ISL) Recognition — LSTM Video Sequence Pipeline

This project recognizes dynamic and static Indian Sign Language gestures from a webcam using **MediaPipe Hand Landmarker** and a **TensorFlow/Keras LSTM Neural Network**.

---

## 📁 Project Structure

```
├── collect_data_video.py    # Collects 30-frame gesture clips as .npy files (with auto-countdown)
├── train_model_lstm.py      # Trains 2-layer LSTM on sequences; saves .h5 model
├── predict_live_lstm.py     # Live real-time webcam gesture prediction with smoothing
├── hand_landmarker.task     # MediaPipe hand tracking model asset
├── isl_data/                # Dataset folder containing sequences organized by label
│   ├── hello/
│   ├── ok/
│   ├── please/
│   └── ...
├── isl_model_lstm.h5        # Trained TensorFlow model file
├── isl_labels.json          # Mapping of model output index to sign label
└── commands.txt             # Quick terminal cheat sheet
```

---

## 🚀 Quickstart Guide

### 1. Collect Gesture Data
Collect 50 sequences (~1 second each) per sign:
```bash
python collect_data_video.py hello 50
python collect_data_video.py ok 50
python collect_data_video.py please 50
```
- Click the camera window and press **`s`** to start.
- A **2-second countdown** will appear so you can pose your hand(s).
- It will automatically cycle through all sequences. Press **`s`** to pause or **`q`** to exit.

### 2. Train the Model
```bash
python train_model_lstm.py
```
This reads all folders in `isl_data/`, trains the model, and outputs `isl_model_lstm.h5`.

### 3. Live Prediction
```bash
python predict_live_lstm.py
```
Performs live recognition using a rolling 30-frame window. Press **`q`** to quit.
