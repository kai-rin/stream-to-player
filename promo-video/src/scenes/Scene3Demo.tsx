import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { COLORS, FONT_FAMILY } from "../utils/styles";
import { SAFE_AREA, SIZES, SPACE, TYPE } from "../utils/layout";
import { sec } from "../utils/time";
import { exitOpacity } from "../utils/animations";
import { MockBrowser } from "../mocks/MockBrowser";
import { MockPopup } from "../mocks/MockPopup";
import { MockExternalPlayer } from "../mocks/MockExternalPlayer";

export const Scene3Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const SCENE_DURATION = sec(13);

  // --- Sub-phase boundaries ---
  const POPUP_OPEN = sec(1);
  const PLAY_CLICK = sec(4.5);
  const LOADING_START = sec(4.5);
  const SUCCESS = sec(5.5);
  const PLAYER_OPEN = sec(6);
  const FEATURES_START = sec(9);

  // --- Browser positioning ---
  // Before player opens: centered. After: slides left
  const browserX = interpolate(
    frame,
    [PLAYER_OPEN, PLAYER_OPEN + sec(1)],
    [0, -300],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const browserScale = interpolate(
    frame,
    [PLAYER_OPEN, PLAYER_OPEN + sec(1)],
    [1, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // --- Popup entrance ---
  const popupScale = spring({
    frame: frame - POPUP_OPEN,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 120 },
  });
  const showPopup = frame >= POPUP_OPEN;

  // --- Popup status ---
  let popupStatus: { text: string; type: "ok" | "loading" | "error" } | null =
    null;
  let highlightPlay = false;

  if (frame >= LOADING_START && frame < SUCCESS) {
    popupStatus = { text: "起動中...", type: "loading" };
  } else if (frame >= SUCCESS) {
    popupStatus = { text: "再生を開始しました", type: "ok" };
  }
  if (frame >= sec(3.5) && frame < PLAY_CLICK) {
    highlightPlay = true;
  }

  // --- External player entrance ---
  const playerX = spring({
    frame: frame - PLAYER_OPEN,
    fps,
    config: { damping: 200 },
  });
  const playerTranslateX = interpolate(playerX, [0, 1], [400, 0]);
  const showPlayer = frame >= PLAYER_OPEN;

  // --- Caption text with per-segment fade ---
  type CaptionSegment = { text: string; start: number; end: number };
  const segments: CaptionSegment[] = [
    { text: "対応サイトを自動検出", start: 0, end: sec(3.5) },
    { text: "画質を選んで再生", start: sec(3.5), end: PLAYER_OPEN },
    { text: "外部プレイヤーで高品質再生", start: PLAYER_OPEN, end: FEATURES_START },
  ];

  const currentSegment = segments.find((s) => frame >= s.start && frame < s.end);
  const captionText = currentSegment?.text ?? "";

  let captionOpacity = 0;
  if (currentSegment && captionText.length > 0) {
    const fadeIn = interpolate(frame, [currentSegment.start, currentSegment.start + sec(0.3)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(frame, [currentSegment.end - sec(0.3), currentSegment.end], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    captionOpacity = Math.min(fadeIn, fadeOut);
  }

  // --- Feature badges ---
  const features = [
    { text: "ながら見に最適", emoji: "👀" },
    { text: "キーボードで自在に操作", emoji: "🎮" },
    { text: "動画だけのシンプル画面", emoji: "🎬" },
  ];

  // --- Step counter ---
  let step = "Step 1/3";
  if (frame >= sec(3)) step = "Step 2/3";
  if (frame >= SUCCESS) step = "Step 3/3";

  // --- Exit ---
  const exit = exitOpacity(frame, SCENE_DURATION - sec(0.5), SCENE_DURATION);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgDarkest,
        fontFamily: FONT_FAMILY,
        opacity: exit,
      }}
    >
      {/* Step counter */}
      <div
        style={{
          position: "absolute",
          top: SAFE_AREA.title.y,
          right: SAFE_AREA.title.x,
          fontSize: TYPE.body.fontSize,
          color: COLORS.textSecondary,
          fontWeight: 600,
          zIndex: 10,
        }}
      >
        {frame < FEATURES_START ? step : ""}
      </div>

      {/* Browser + Popup container — offset upward to balance caption bar */}
      <div
        style={{
          position: "absolute",
          top: "46%",
          left: "50%",
          transform: `translate(calc(-50% + ${browserX}px), -50%) scale(${browserScale})`,
        }}
      >
        <MockBrowser
          url="https://www.twitch.tv/streamer_name"
          title="配信中 - Twitch"
        >
          {/* Simulated Twitch content */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, #1a0a2e, #0a0a2a, #2a1a3e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "60%",
                borderRadius: 12,
                background:
                  "radial-gradient(ellipse, rgba(145,70,255,0.25), transparent)",
              }}
            />
          </div>
        </MockBrowser>

        {/* Popup overlay */}
        {showPopup && (
          <div
            style={{
              position: "absolute",
              top: 80,
              right: 160,
              transform: `scale(${popupScale})`,
              transformOrigin: "top right",
              zIndex: 20,
            }}
          >
            <MockPopup
              siteName="Twitch"
              pageTitle="配信中のストリーム - streamer_name"
              streamType="live"
              quality="最高画質 (best)"
              tool="streamlink"
              status={popupStatus}
              highlightPlay={highlightPlay}
            />
          </div>
        )}
      </div>

      {/* External player */}
      {showPlayer && (
        <div
          style={{
            position: "absolute",
            top: "46%",
            right: SAFE_AREA.action.x,
            transform: `translateY(-50%) translateX(${playerTranslateX}px)`,
            width: SIZES.player.width,
            height: SIZES.player.height,
          }}
        >
          <Sequence from={0}>
            <MockExternalPlayer
              playerName="mpv"
              title="twitch.tv/streamer_name"
            />
          </Sequence>
        </div>
      )}

      {/* Feature badges — vertical stack for readability */}
      {frame >= FEATURES_START && (
        <div
          style={{
            position: "absolute",
            bottom: SPACE["2xl"],
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: SPACE.lg,
          }}
        >
          {features.map((f, i) => {
            const badgeProgress = spring({
              frame: frame - FEATURES_START - i * sec(0.3),
              fps,
              config: { damping: 12, mass: 0.5, stiffness: 120 },
            });
            const badgeY = interpolate(badgeProgress, [0, 1], [30, 0]);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACE.md,
                  opacity: badgeProgress,
                  transform: `translateY(${badgeY}px)`,
                }}
              >
                <span style={{ fontSize: TYPE.h3.fontSize }}>{f.emoji}</span>
                <span
                  style={{
                    fontSize: TYPE.h3.fontSize,
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {f.text}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Caption bar */}
      {captionText && (
        <div
          key={captionText}
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
            paddingBottom: SPACE.xl,
            opacity: captionOpacity,
          }}
        >
          <div style={{ fontSize: TYPE.h2.fontSize, color: "white", textAlign: "center" }}>
            {captionText}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
