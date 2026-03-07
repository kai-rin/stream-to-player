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
import { exitOpacity } from "../utils/animations";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const SCENE_DURATION = sec(4);

  // Icon entrance: spring scale
  const iconScale = spring({ frame, fps, config: { damping: 12, mass: 0.5, stiffness: 120 } });

  // Icon slides up
  const iconY = interpolate(frame, [sec(0.5), sec(1)], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Headline entrance
  const headlineProgress = spring({
    frame: frame - sec(1),
    fps,
    config: { damping: 200 },
  });
  const headlineY = interpolate(headlineProgress, [0, 1], [30, 0]);

  // Subtext entrance
  const subtextOpacity = interpolate(frame, [sec(1.5), sec(2)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit
  const exit = exitOpacity(frame, SCENE_DURATION - sec(0.5), SCENE_DURATION);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${COLORS.bgSecondary}, ${COLORS.bgDarkest})`,
        fontFamily: FONT_FAMILY,
        alignItems: "center",
        justifyContent: "center",
        opacity: exit,
      }}
    >
      {/* Icon */}
      <Img
        src={staticFile("icon128.png")}
        style={{
          width: SIZES.iconLg,
          height: SIZES.iconLg,
          transform: `scale(${iconScale}) translateY(${iconY}px)`,
          marginBottom: SPACE["2xl"],
        }}
      />

      {/* Headline */}
      <div
        style={{
          ...TYPE.display,
          color: "white",
          opacity: headlineProgress,
          transform: `translateY(${headlineY}px)`,
          textAlign: "center",
        }}
      >
        ブラウザ動画を外部プレイヤーで
      </div>

      {/* Subtext */}
      <div
        style={{
          fontSize: TYPE.h2.fontSize,
          color: COLORS.textSecondary,
          opacity: subtextOpacity,
          marginTop: SPACE.xl,
          textAlign: "center",
        }}
      >
        mpv / VLC でストリーミングを快適再生
      </div>
    </AbsoluteFill>
  );
};
