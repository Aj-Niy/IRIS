"""
ISL LSTM Model Training Script (Hands Only — 126 features)
------------------------------------------------------------
Usage:
    python train_model_lstm.py

What it does:
    - Walks isl_data/<label>/*.npy to load all sequences
    - Validates sequence shapes (30 frames x 126 features)
    - Builds a TensorFlow/Keras LSTM model
    - Trains and evaluates on an 80/20 split
    - Saves the model as isl_model_lstm.h5
"""

import os
import glob
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import json

DATA_DIR    = "isl_data"
MODEL_FILE  = "isl_model_lstm.h5"
LABELS_FILE = "isl_labels.json"

EPOCHS     = 50
BATCH_SIZE = 16

# ─── Load sequences ────────────────────────────────────────────────────────────
print(f"Loading sequences from '{DATA_DIR}'...")

X_list, y_list = [], []

label_folders = sorted([
    d for d in os.listdir(DATA_DIR)
    if os.path.isdir(os.path.join(DATA_DIR, d))
])

if not label_folders:
    raise FileNotFoundError(
        f"No label folders found in '{DATA_DIR}'. "
        "Run collect_data_video.py first."
    )

expected_shape = None
active_labels = []

for label in label_folders:
    label_path = os.path.join(DATA_DIR, label)
    npy_files  = sorted(glob.glob(os.path.join(label_path, "*.npy")))
    if not npy_files:
        print(f"  '{label}': 0 sequences (skipping)")
        continue

    print(f"  '{label}': {len(npy_files)} sequences")
    active_labels.append(label)

    for nf in npy_files:
        seq = np.load(nf)
        if expected_shape is None:
            expected_shape = seq.shape
        elif seq.shape != expected_shape:
            raise ValueError(
                f"\n[ERROR] Shape mismatch in '{nf}': got {seq.shape}, expected {expected_shape}!\n"
                f"This happens if you mixed old data (126 features) with new data (225 features).\n"
                f"Please delete old .npy files in 'isl_data/{label}' and re-collect."
            )
        X_list.append(seq)
        y_list.append(label)

if len(active_labels) < 2:
    raise ValueError(
        f"\nNeed data for at least 2 signs to train a classifier! Found: {active_labels}\n"
        "Collect sequences for another sign using collect_data_video.py"
    )

X = np.array(X_list, dtype=np.float32)
y = np.array(y_list)

print(f"\nTotal sequences : {len(X)}")
print(f"Sequence shape  : {X.shape[1:]} (frames x features)")
print(f"Active classes  : {active_labels}")

# ─── Encode labels ─────────────────────────────────────────────────────────────
le = LabelEncoder()
y_enc = le.fit_transform(y)
num_classes = len(le.classes_)

label_map = {int(i): str(c) for i, c in enumerate(le.classes_)}
with open(LABELS_FILE, "w") as f:
    json.dump(label_map, f, indent=2)
print(f"\nLabel map saved -> {LABELS_FILE}")

y_cat = tf.keras.utils.to_categorical(y_enc, num_classes)

# ─── Train / test split ────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_cat, test_size=0.2, random_state=42, stratify=y_enc
)
print(f"Train samples   : {len(X_train)}  |  Test samples: {len(X_test)}")

# ─── Build LSTM model ──────────────────────────────────────────────────────────
seq_length, num_features = X.shape[1], X.shape[2]

model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(seq_length, num_features)),
    tf.keras.layers.LSTM(128, return_sequences=True),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.LSTM(64),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation="relu"),
    tf.keras.layers.Dense(num_classes, activation="softmax"),
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)
model.summary()

# ─── Train ─────────────────────────────────────────────────────────────────────
callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=10, restore_best_weights=True
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=5, min_lr=1e-5
    ),
]

print("\nTraining LSTM model...")
history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=callbacks,
    verbose=1,
)

# ─── Evaluate ──────────────────────────────────────────────────────────────────
loss, acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\nTest Accuracy : {acc * 100:.2f}%")
print(f"Test Loss     : {loss:.4f}")

y_pred_idx  = np.argmax(model.predict(X_test, verbose=0), axis=1)
y_test_idx  = np.argmax(y_test, axis=1)
target_names = [str(c) for c in le.classes_]
print("\nDetailed report:")
print(classification_report(y_test_idx, y_pred_idx, target_names=target_names))

# ─── Save ──────────────────────────────────────────────────────────────────────
model.save(MODEL_FILE)
print(f"\nModel saved -> {MODEL_FILE}")
