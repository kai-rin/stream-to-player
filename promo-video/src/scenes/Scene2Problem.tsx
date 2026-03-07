import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONT_FAMILY } from "../utils/styles";
import { SIZES, SPACE, TYPE } from "../utils/layout";
import { sec } from "../utils/time";
import { trapezoidFade, exitOpacity } from "../utils/animations";
import { MockBrowser } from "../mocks/MockBrowser";
import { MockVideoPlayer } from "../mocks/MockVideoPlayer";

type PlayerState = "buffering" | "error";

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const SCENE_DURATION = sec(5);

  // Browser entrance
  const browserScale = spring({ frame, fps, config: { damping: 200 } });

  // Determine player state based on frame (2 states)
  let playerState: PlayerState = "buffering";
  let captionText = "画面がごちゃごちゃ...";

  if (frame >= sec(2)) {
    playerState = "error";
    captionText = "操作もサイトごとにバラバラ";
  }

  // Caption for first two states (fades out before frustration takeover)
  const captionOpacity = trapezoidFade(frame, sec(0.3), sec(0.6), sec(2.8), sec(3.2));

  // --- Frustration finale (3s ~ end) ---
  const frustrationStart = sec(3);

  // Browser dims and shrinks
  const browserDim = interpolate(frame, [frustrationStart, frustrationStart + sec(0.4)], [1, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const browserShrink = interpolate(frame, [frustrationStart, frustrationStart + sec(0.5)], [1, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Vignette glow
  const vignetteOpacity = interpolate(frame, [frustrationStart, frustrationStart + sec(0.5)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Main frustration text spring
  const textScale = spring({
    frame: frame - frustrationStart - sec(0.1),
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 160 },
  });

  // Exit
  const exit = exitOpacity(frame, SCENE_DURATION - sec(0.5), SCENE_DURATION);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.bgDarkest}, ${COLORS.bgDark})`,
        fontFamily: FONT_FAMILY,
        alignItems: "center",
        justifyContent: "center",
        opacity: exit,
      }}
    >
      {/* Browser — offset upward to balance caption bar */}
      <div
        style={{
          transform: `scale(${browserScale * browserShrink})`,
          opacity: browserDim,
          transition: "none",
          marginBottom: SIZES.captionBarHeight / 2,
        }}
      >
        <MockBrowser
          url="https://www.youtube.com/watch?v=example"
          title="配信アーカイブ - YouTube"
        >
          <MockVideoPlayer state={playerState} />
        </MockBrowser>
      </div>

      {/* Red vignette */}
      {frame >= frustrationStart && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(180,30,30,0.25) 100%)",
            opacity: vignetteOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Frustration text */}
      {frame >= frustrationStart && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            inset: 0,
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              color: "white",
              textAlign: "center",
              transform: `scale(${textScale})`,
              textShadow: "0 0 60px rgba(200,40,40,0.5), 0 4px 12px rgba(0,0,0,0.6)",
              letterSpacing: "0.05em",
            }}
          >
            ブラウザ再生のストレス
          </div>
        </div>
      )}

      {/* Caption bar (first two states only) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: SIZES.captionBarHeight,
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: SPACE["2xl"],
          opacity: captionOpacity,
        }}
      >
        <div
          style={{
            fontSize: TYPE.h2.fontSize,
            fontWeight: TYPE.h2.fontWeight,
            color: "white",
            textAlign: "center",
          }}
        >
          {captionText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
