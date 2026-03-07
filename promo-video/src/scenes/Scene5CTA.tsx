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
import { SIZES, SPACE, TYPE } from "../utils/layout";
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
          width: SIZES.iconLg,
          height: SIZES.iconLg,
          transform: `scale(${iconScale})`,
          marginBottom: SPACE["2xl"],
        }}
      />

      {/* Title */}
      <div
        style={{
          ...TYPE.display,
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
          fontSize: TYPE.h2.fontSize,
          color: COLORS.textSecondary,
          opacity: subtextOpacity,
          marginTop: SPACE.xl,
        }}
      >
        ブラウザ動画をもっと自由に
      </div>

      {/* GitHub URL */}
      <div
        style={{
          fontSize: TYPE.h3.fontSize,
          color: COLORS.accentBlue,
          opacity: urlOpacity,
          marginTop: SPACE["2xl"],
          background: "rgba(255,255,255,0.05)",
          padding: `${SPACE.md}px ${SPACE["2xl"]}px`,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        github.com/kai-rin/stream-to-player
      </div>
    </AbsoluteFill>
  );
};
