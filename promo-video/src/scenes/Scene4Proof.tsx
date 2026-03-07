import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, FONT_FAMILY } from "../utils/styles";
import { sec } from "../utils/time";
import { exitOpacity } from "../utils/animations";
import { SiteLogoBadge, SITE_DATA } from "../mocks/SiteLogoBadge";

export const Scene4Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const SCENE_DURATION = sec(5);

  // Title entrance
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Player section
  const playerSectionProgress = spring({
    frame: frame - sec(1.5),
    fps,
    config: { damping: 200 },
  });
  const playerSectionY = interpolate(playerSectionProgress, [0, 1], [20, 0]);

  // Divider
  const dividerHeight = interpolate(
    spring({ frame: frame - sec(0.3), fps, config: { damping: 200 } }),
    [0, 1],
    [0, 100],
  );

  // Exit
  const exit = exitOpacity(frame, SCENE_DURATION - sec(0.5), SCENE_DURATION);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgDarkest,
        fontFamily: FONT_FAMILY,
        opacity: exit,
      }}
    >
      {/* Two-column layout, top-aligned */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "120px 120px",
          gap: 0,
        }}
      >
        {/* Left column: Sites */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              opacity: titleProgress,
              marginBottom: 8,
            }}
          >
            対応サイト
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {SITE_DATA.map((site, i) => {
              const staggerDelay = i * 2;
              const badgeProgress = spring({
                frame: frame - sec(0.5) - staggerDelay,
                fps,
                config: { damping: 14, mass: 0.3, stiffness: 200 },
              });
              const badgeY = interpolate(badgeProgress, [0, 1], [20, 0]);
              return (
                <div
                  key={site.name}
                  style={{
                    opacity: badgeProgress,
                    transform: `translateY(${badgeY}px)`,
                  }}
                >
                  <SiteLogoBadge name={site.name} color={site.color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center divider */}
        <div
          style={{
            width: 1,
            background: "rgba(255,255,255,0.15)",
            height: `${dividerHeight}%`,
            alignSelf: "center",
          }}
        />

        {/* Right column: Players */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            opacity: playerSectionProgress,
            transform: `translateY(${playerSectionY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              marginBottom: 8,
            }}
          >
            対応プレイヤー
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {[
              { name: "mpv", sub: "推奨" },
              { name: "VLC", sub: "" },
            ].map((player) => (
              <div
                key={player.name}
                style={{
                  width: 300,
                  height: 80,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {player.name}
                </span>
                {player.sub && (
                  <span
                    style={{
                      fontSize: 16,
                      color: COLORS.textSecondary,
                      fontWeight: 500,
                    }}
                  >
                    {player.sub}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
