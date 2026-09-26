import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { SubtitleBar } from "./AvatarScene";

/**
 * VisualScene — ShikshaSetu Pedagogical Concept & Algorithm Visualizer
 * Features:
 * - Floating Data Packet transfer animation from array to execution block
 * - Dynamic HUD gauge with animated needle in Forest Green and Saffron
 * - Clean white cards with ShikshaSetu palette
 * - Full indigenous language font support ('Noto Sans Ol Chiki' for Santhali)
 */
export const VisualScene = ({
  animation = "forLoopIterator",
  audioDuration = 10,
  subtitleWords = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 95, mass: 0.8 },
  });
  const cardOpacity = interpolate(entrance, [0, 1], [0, 1]);
  const cardScale = interpolate(entrance, [0, 1], [0.92, 1]);

  const renderContent = () => {
    switch (animation) {
      case "whileCounter":
        return <WhileCounterDiagram frame={frame} fps={fps} />;
      case "forLoopIterator":
      default:
        return <ForLoopDiagram frame={frame} fps={fps} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        backgroundColor: "#F4F7F5",
        backgroundImage: `
          radial-gradient(circle at 15% 30%, rgba(19, 78, 63, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 80% 70%, rgba(234, 88, 12, 0.05) 0%, transparent 60%)
        `,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", sans-serif',
        padding: "35px 55px 85px 55px",
        boxSizing: "border-box",
      }}
    >
      {/* Micro-grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(19,78,63,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(19,78,63,0.035) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          pointerEvents: "none",
        }}
      />

      {/* Main Card */}
      <div
        style={{
          width: "74%",
          maxWidth: 900,
          background: "#FFFFFF",
          border: "2px solid #D1E3DA",
          borderRadius: 24,
          boxShadow: "0 18px 45px rgba(19, 78, 63, 0.08)",
          overflow: "hidden",
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          zIndex: 10,
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 24px",
            background: "#134E3F",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: "#FFFFFF", textTransform: "uppercase" }}>
              CONCEPT &amp; MEMORY VISUALIZER
            </span>
          </div>

          <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D", background: "#DCFCE7", padding: "3px 10px", borderRadius: 99 }}>
            ● LIVE LESSON
          </span>
        </div>

        {/* Dynamic Visual Content */}
        <div style={{ padding: "26px 32px" }}>{renderContent()}</div>
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
};

// ── ForLoopDiagram ────────────────────────────────────────────────────────────
const ForLoopDiagram = ({ frame, fps }) => {
  const ITEMS = ["Apple 🍎", "Banana 🍌", "Cherry 🍒", "Date 🌴"];
  const CYCLE = 45;
  const activeIdx = Math.floor(frame / CYCLE) % ITEMS.length;

  // Floating packet trajectory
  const packetCycle = frame % CYCLE;
  const packetY = interpolate(packetCycle, [0, 15, 30, CYCLE], [0, -14, 8, 0], {
    extrapolateRight: "clamp",
  });
  const packetOpacity = interpolate(packetCycle, [0, 10, 35, CYCLE], [0.6, 1, 1, 0.6]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Code Header */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 19,
          fontWeight: 700,
          color: "#134E3F",
          background: "#EBF4F0",
          padding: "8px 18px",
          borderRadius: 10,
          border: "1.5px solid #D1E3DA",
          alignSelf: "flex-start",
        }}
      >
        for fruit in fruits:
      </div>

      {/* Memory Array Container with Addresses */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "monospace", fontSize: 18, color: "#64748B", fontWeight: 700 }}>
          fruits = [
        </span>

        <div style={{ display: "flex", gap: 12 }}>
          {ITEMS.map((item, i) => {
            const isActive = i === activeIdx;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {/* Memory address badge */}
                <span style={{ fontSize: 10, fontFamily: "monospace", color: isActive ? "#EA580C" : "#94A3B8", fontWeight: 700 }}>
                  slot_{i}
                </span>

                <div
                  style={{
                    padding: "10px 18px",
                    borderRadius: 12,
                    fontFamily: "monospace",
                    fontSize: 16,
                    fontWeight: 800,
                    background: isActive
                      ? "#EA580C"
                      : "#F8FAF9",
                    color: isActive ? "#FFFFFF" : "#1F2937",
                    border: `1.5px solid ${isActive ? "#EA580C" : "#E2ECE8"}`,
                    boxShadow: isActive
                      ? "0 6px 18px rgba(234, 88, 12, 0.35)"
                      : "none",
                    transform: isActive ? `scale(1.06) translateY(${packetY}px)` : "scale(1)",
                    opacity: isActive ? packetOpacity : 0.9,
                    transition: "all 0.15s ease",
                  }}
                >
                  "{item}"
                </div>
              </div>
            );
          })}
        </div>

        <span style={{ fontFamily: "monospace", fontSize: 18, color: "#64748B", fontWeight: 700 }}>
          ]
        </span>
      </div>

      {/* Active Variable Execution Dock */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "#F8FAF9",
          padding: "14px 20px",
          borderRadius: 14,
          border: "1.5px solid #D1E3DA",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: "#134E3F", letterSpacing: 1 }}>
          CURRENT VARIABLE:
        </span>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 18,
            fontWeight: 800,
            color: "#134E3F",
            background: "#DCFCE7",
            padding: "4px 14px",
            borderRadius: 8,
            border: "1px solid #86EFAC",
          }}
        >
          fruit = "{ITEMS[activeIdx]}"
        </div>
      </div>
    </div>
  );
};

// ── WhileCounterDiagram ───────────────────────────────────────────────────────
const WhileCounterDiagram = ({ frame, fps }) => {
  const count = Math.min(5, Math.floor(frame / 35));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 19,
          fontWeight: 700,
          color: "#134E3F",
          background: "#EBF4F0",
          padding: "8px 18px",
          borderRadius: 10,
          border: "1.5px solid #D1E3DA",
          alignSelf: "flex-start",
        }}
      >
        while count &lt; 5:
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {[0, 1, 2, 3, 4].map((n) => {
          const isPassed = n < count;
          const isCurrent = n === count;
          return (
            <div
              key={n}
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 800,
                background: isCurrent ? "#EA580C" : isPassed ? "#134E3F" : "#F8FAF9",
                color: isCurrent || isPassed ? "#FFFFFF" : "#64748B",
                border: `2px solid ${isCurrent ? "#EA580C" : isPassed ? "#134E3F" : "#E2ECE8"}`,
                boxShadow: isCurrent ? "0 4px 14px rgba(234, 88, 12, 0.35)" : "none",
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisualScene;
