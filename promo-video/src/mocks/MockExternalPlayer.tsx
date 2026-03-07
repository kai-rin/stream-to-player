import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT_FAMILY } from "../utils/styles";

type MockExternalPlayerProps = {
  playerName: "mpv" | "VLC";
  title: string;
};

export const MockExternalPlayer: React.FC<MockExternalPlayerProps> = ({
  playerName,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Simulated seek position
  const progress = interpolate(frame, [0, 10 * fps], [0.15, 0.65], {
    extrapolateRight: "clamp",
  });

  // Simulated elapsed time
  const elapsed = Math.floor(frame / fps);
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;
  const timeStr = `${elapsedMin}:${String(elapsedSec).padStart(2, "0")}`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT_FAMILY,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          height: 32,
          background: "#222",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
          {playerName} — {title}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: "#555",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: "#555",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: "#e53935",
            }}
          />
        </div>
      </div>

      {/* Video Area */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #1a1a3e, #0a0a1a, #1a0a2e)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Simulated video content glow */}
        <div
          style={{
            width: "60%",
            height: "50%",
            borderRadius: 12,
            background:
              "radial-gradient(ellipse, rgba(100,80,180,0.3), transparent)",
          }}
        />
      </div>

      {/* Controls Bar */}
      <div
        style={{
          height: 36,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Play button */}
        <span style={{ fontSize: 14, color: "white" }}>▶</span>
        {/* Seek bar */}
        <div
          style={{
            flex: 1,
            height: 4,
            background: "#444",
            borderRadius: 2,
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: COLORS.accentRed,
              borderRadius: 2,
            }}
          />
        </div>
        {/* Time */}
        <span style={{ fontSize: 11, color: COLORS.textSecondary }}>
          {timeStr}
        </span>
        {/* Volume */}
        <span style={{ fontSize: 14, color: "white" }}>🔊</span>
      </div>
    </div>
  );
};
