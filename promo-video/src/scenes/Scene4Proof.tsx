import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, FONT_FAMILY } from "../utils/styles";
import { SIZES, SPACE, TYPE } from "../utils/layout";
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
    frame: frame - sec(1),
    fps,
    config: { damping: 200 },
  });
  const playerSectionY = interpolate(playerSectionProgress, [0, 1], [20, 0]);

  // Divider width animation
  const dividerWidth = interpolate(
    spring({ frame: frame - sec(0.8), fps, config: { damping: 200 } }),
    [0, 1],
    [0, 600],
  );

  // Exit
  const exit = exitOpacity(frame, SCENE_DURATION - sec(0.5), SCENE_DURATION);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgDarkest,
        fontFamily: FONT_FAMILY,
        opacity: exit,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACE["2xl"],
      }}
    >
      {/* Sites section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: SPACE.lg,
        }}
      >
        <div
          style={{
            ...TYPE.h1,
            color: "white",
            opacity: titleProgress,
          }}
        >
          対応サイト
        </div>
        {/* Row 1: 3 sites */}
        <div style={{ display: "flex", gap: SPACE.lg }}>
          {SITE_DATA.slice(0, 3).map((site, i) => {
            const badgeProgress = spring({
              frame: frame - sec(0.5) - i * 2,
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
        {/* Row 2: 2 sites */}
        <div style={{ display: "flex", gap: SPACE.lg }}>
          {SITE_DATA.slice(3).map((site, i) => {
            const badgeProgress = spring({
              frame: frame - sec(0.5) - (i + 3) * 2,
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

      {/* Horizontal divider */}
      <div
        style={{
          width: dividerWidth,
          height: 1,
          background: "rgba(255,255,255,0.15)",
        }}
      />

      {/* Players section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: SPACE.lg,
          opacity: playerSectionProgress,
          transform: `translateY(${playerSectionY}px)`,
        }}
      >
        <div
          style={{
            ...TYPE.h1,
            color: "white",
          }}
        >
          対応プレイヤー
        </div>
        <div style={{ display: "flex", gap: SPACE.lg }}>
          {[
            { name: "mpv", sub: "推奨" },
            { name: "VLC", sub: "" },
          ].map((player) => (
            <div
              key={player.name}
              style={{
                width: SIZES.badge.width,
                height: SIZES.badge.height,
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
                  fontSize: TYPE.body.fontSize,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {player.name}
              </span>
              {player.sub && (
                <span
                  style={{
                    fontSize: TYPE.small.fontSize,
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
    </AbsoluteFill>
  );
};
