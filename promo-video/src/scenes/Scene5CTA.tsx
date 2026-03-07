import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, FONT_FAMILY } from "../utils/styles";
import { sec } from "../utils/time";

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Icon entrance
  const iconScale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 120 },
  });

  // Title entrance
  const titleProgress = spring({
    frame: frame - sec(0.7),
    fps,
    config: { damping: 200 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [20, 0]);

  // Subtext entrance
  const subtextOpacity = interpolate(frame, [sec(1.2), sec(1.7)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // URL entrance
  const urlOpacity = interpolate(frame, [sec(1.5), sec(2)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${COLORS.bgSecondary}, ${COLORS.bgDarkest})`,
        fontFamily: FONT_FAMILY,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Icon */}
      <Img
        src={staticFile("icon128.png")}
        style={{
          width: 160,
          height: 160,
          transform: `scale(${iconScale})`,
          marginBottom: 32,
        }}
      />

      {/* Title */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 700,
          color: "white",
          opacity: titleProgress,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Stream to Player
      </div>

      {/* Subtext */}
      <div
        style={{
          fontSize: 44,
          color: COLORS.textSecondary,
          opacity: subtextOpacity,
          marginTop: 16,
        }}
      >
        ブラウザ動画をもっと自由に
      </div>

      {/* GitHub URL */}
      <div
        style={{
          fontSize: 36,
          color: COLORS.accentBlue,
          opacity: urlOpacity,
          marginTop: 32,
          background: "rgba(255,255,255,0.05)",
          padding: "12px 32px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        github.com/kai-rin/stream-to-player
      </div>
    </AbsoluteFill>
  );
};
