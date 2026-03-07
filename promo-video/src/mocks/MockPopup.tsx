import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT_FAMILY } from "../utils/styles";

type StatusType = { text: string; type: "ok" | "loading" | "error" } | null;

type MockPopupProps = {
  siteName: string;
  pageTitle: string;
  streamType: "live" | "vod";
  quality: string;
  tool: string;
  status?: StatusType;
  highlightPlay?: boolean;
};

const SCALE = 2.5;

export const MockPopup: React.FC<MockPopupProps> = ({
  siteName,
  pageTitle,
  streamType,
  quality,
  tool,
  status = null,
  highlightPlay = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spinner rotation driven by frame (no CSS animation)
  const spinnerRotation = (frame / fps) * 360 * 1.25;

  const glowIntensity = highlightPlay
    ? interpolate(Math.sin(frame * 0.3), [-1, 1], [4, 12])
    : 0;

  return (
    <div
      style={{
        width: 320,
        padding: 12,
        fontFamily: FONT_FAMILY,
        fontSize: 13,
        background: COLORS.bgDark,
        color: COLORS.textPrimary,
        borderRadius: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        transform: `scale(${SCALE})`,
        transformOrigin: "top left",
      }}
    >
      {/* Site Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          padding: "6px 8px",
          background: COLORS.bgSecondary,
          borderRadius: 6,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 12 }}>{siteName}</span>
        <span
          style={{
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 3,
            fontWeight: "bold",
            textTransform: "uppercase",
            background:
              streamType === "live" ? COLORS.accentRed : COLORS.accentBlue,
            color: "white",
          }}
        >
          {streamType === "live" ? "LIVE" : "VOD"}
        </span>
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 11,
            color: COLORS.textSecondary,
          }}
        >
          {pageTitle}
        </span>
      </div>

      {/* Quality Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <label style={{ fontSize: 11, color: COLORS.textSecondary, whiteSpace: "nowrap" }}>
          品質:
        </label>
        <div
          style={{
            flex: 1,
            background: COLORS.bgSecondary,
            color: COLORS.textPrimary,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 4,
            padding: "4px 6px",
            fontSize: 12,
          }}
        >
          {quality}
        </div>
      </div>

      {/* Tool Indicator */}
      <div
        style={{
          fontSize: 11,
          color: COLORS.textMuted,
          textAlign: "right",
          marginBottom: 8,
        }}
      >
        ツール: {tool}
      </div>

      {/* Play Button */}
      <button
        style={{
          width: "100%",
          padding: "8px 0",
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          background: COLORS.accentRed,
          color: "white",
          cursor: "pointer",
          boxShadow: highlightPlay
            ? `0 0 ${glowIntensity}px ${COLORS.accentRed}`
            : "none",
        }}
      >
        ▶ 再生
      </button>

      {/* Status */}
      {status && (
        <div
          style={{
            marginTop: 8,
            minHeight: 16,
            fontSize: 12,
            textAlign: "center",
            color:
              status.type === "ok"
                ? COLORS.successGreen
                : status.type === "loading"
                  ? COLORS.warningOrange
                  : COLORS.errorRed,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {status.type === "loading" && (
            <div
              style={{
                width: 12,
                height: 12,
                border: `2px solid ${COLORS.warningOrange}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                transform: `rotate(${spinnerRotation}deg)`,
              }}
            />
          )}
          {status.text}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: 11, color: "#555" }}>⚙ 設定</span>
      </div>
    </div>
  );
};
