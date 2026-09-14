import React, { useState, useRef, useEffect } from "react";
import { X, Hand, Camera, RefreshCw, CheckCircle2, Volume2, Sparkles, ShieldCheck } from "lucide-react";
import AudioPlayButton from "./AudioPlayButton";

export default function ISLGestureRecognizerModal({ isOpen, onClose, currentLang = 'sat' }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState("hello");
  const [confidence, setConfidence] = useState(94);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null);

  const gestureDetails = {
    hello: { label: "Hello / Namaste", script: "ᱡᱚᱦᱟᱨ", roman: "Johar", hindi: "नमस्ते / जोहार", category: "Greeting" },
    please: { label: "Please", script: "ᱫᱟᱭᱟ ᱠᱟᱛᱮ", roman: "Daya kate", hindi: "कृपया", category: "Social" },
    ok: { label: "OK / Good", script: "ᱴᱷᱤᱠ ᱜᱮᱭᱟ", roman: "Ṭhik geya", hindi: "ठीक है / बहुत बढ़िया", category: "Affirmation" },
    "1": { label: "Number 1", script: "ᱢᱤᱫ", roman: "Mit'", hindi: "एक (1)", category: "Counting" },
    "2": { label: "Number 2", script: "ᱵᱟᱨ", roman: "Bar", hindi: "दो (2)", category: "Counting" },
    unclear: { label: "Unclear", script: "—", roman: "—", hindi: "स्पष्ट नहीं है", category: "System" }
  };

  const currentInfo = gestureDetails[detectedGesture] || gestureDetails.hello;

  // Toggle Webcam Camera Stream
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setMediaStream(null);
      setIsCameraActive(false);
    } else {
      try {
        setIsProcessing(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
        });
        setMediaStream(stream);
        setIsCameraActive(true);
      } catch (err) {
        console.warn("Webcam access error:", err);
        alert("Camera permission denied or camera is in use by another app: " + (err.message || err));
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Attach media stream whenever available and video is mounted
  useEffect(() => {
    if (videoRef.current && mediaStream && isCameraActive) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(err => console.warn("Video play error:", err));
    }
  }, [mediaStream, isCameraActive]);

  // Clean up media stream on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const [isAiConnected, setIsAiConnected] = useState(false);
  const canvasRef = useRef(null);

  // Send real camera frames to Python Gesture AI backend (http://localhost:5005/predict)
  useEffect(() => {
    let intervalId;
    let isRequestInProgress = false;

    if (isOpen && isCameraActive) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
        canvasRef.current.width = 320;
        canvasRef.current.height = 240;
      }

      intervalId = setInterval(async () => {
        if (!videoRef.current || isRequestInProgress || videoRef.current.readyState < 2) {
          return;
        }

        try {
          isRequestInProgress = true;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const base64Image = canvas.toDataURL("image/jpeg", 0.7);

          const res = await fetch("http://localhost:5005/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image })
          });

          if (res.ok) {
            const data = await res.json();
            setIsAiConnected(true);
            if (data.gesture && data.gesture !== "buffering") {
              setDetectedGesture(data.gesture);
              setConfidence(Math.round(data.confidence));
            }
          }
        } catch (err) {
          setIsAiConnected(false);
        } finally {
          isRequestInProgress = false;
        }
      }, 33);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, isCameraActive]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div className="card" style={{
        width: "100%",
        maxWidth: "760px",
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        padding: "0",
        overflow: "hidden",
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.3)"
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          backgroundColor: "#0F4C3A",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Hand size={18} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700" }}>
                Live ISL Gesture AI Recognizer
              </div>
              <div style={{ fontSize: "11px", opacity: 0.85 }}>
                MediaPipe 126 Keypoints + LSTM Model (`gestures/predict_live_lstm.py`)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#FFFFFF",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Container */}
        <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          
          {/* Left Column: Camera Feed & Video Overlay */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{
              position: "relative",
              height: "240px",
              borderRadius: "12px",
              backgroundColor: "#18181B",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid var(--border-medium)"
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                  display: isCameraActive ? "block" : "none"
                }}
              />
              {!isCameraActive && (
                <div style={{ textAlign: "center", color: "#A1A1AA", padding: "20px" }}>
                  <Camera size={36} color="#A1A1AA" style={{ marginBottom: "8px" }} />
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>Camera Disconnected</div>
                  <div style={{ fontSize: "11px", marginTop: "2px" }}>Click button below to enable camera feed</div>
                </div>
              )}

              {/* Hand Keypoint Overlay Chip */}
              {isCameraActive && (
                <div style={{
                  position: "absolute",
                  top: "10px", left: "10px",
                  backgroundColor: isAiConnected ? "rgba(15, 76, 58, 0.9)" : "rgba(220, 38, 38, 0.9)",
                  color: "#FFFFFF",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: isAiConnected ? "#34D399" : "#F87171" }}></span>
                  <span>{isAiConnected ? "Real Python LSTM AI Connected" : "Connecting to gestures/gesture_api.py..."}</span>
                </div>
              )}

              {/* Live Detected Gesture Overlay Banner */}
              {isCameraActive && (
                <div style={{
                  position: "absolute",
                  bottom: "10px", left: "10px", right: "10px",
                  backgroundColor: "rgba(24, 24, 27, 0.9)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "#A1A1AA", textTransform: "uppercase" }}>Detected Gesture</div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#34D399" }}>{currentInfo.label}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", color: "#A1A1AA" }}>Confidence</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#FBBF24" }}>{confidence}%</div>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <button
              onClick={toggleCamera}
              className={isCameraActive ? "btn-secondary" : "btn-primary"}
              style={{ width: "100%", justifyContent: "center", padding: "10px" }}
            >
              <Camera size={15} />
              <span>{isCameraActive ? "Stop Camera Feed" : "Start Live Camera Recognition"}</span>
            </button>
          </div>

          {/* Right Column: Model Output & Gesture Library */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Active Output Card */}
            <div style={{
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "var(--green-light)",
              border: "1.5px solid var(--green-border)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span className="badge-green" style={{ fontSize: "10px" }}>{currentInfo.category} Gesture</span>
                <AudioPlayButton text={currentInfo.roman || currentInfo.label} size="sm" label="Pronounce" />
              </div>

              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)", marginBottom: "2px" }}>
                {currentInfo.script}
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--green-primary)", fontStyle: "italic" }}>
                "{currentInfo.roman}"
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-sub)", marginTop: "4px" }}>
                <strong>Hindi Meaning:</strong> {currentInfo.hindi}
              </div>
            </div>

            {/* Supported Model Gestures List (from isl_labels.json) */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                Trained Gestures (`gestures/isl_labels.json`)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {Object.entries(gestureDetails).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => { setDetectedGesture(key); setConfidence(96); }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: detectedGesture === key ? "1.5px solid var(--green-primary)" : "1px solid var(--border-medium)",
                      backgroundColor: detectedGesture === key ? "#FFFFFF" : "var(--bg-main)",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-main)" }}>{info.label}</div>
                    <div style={{ fontSize: "10px", color: "var(--green-primary)", marginTop: "1px" }}>{info.script}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Offline Script Note */}
            <div style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              padding: "8px 10px",
              backgroundColor: "var(--bg-main)",
              borderRadius: "8px",
              border: "1px solid var(--border-medium)"
            }}>
              <strong>Local Execution:</strong> Run <code>python gestures/predict_live_lstm.py</code> for native desktop MediaPipe window.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
