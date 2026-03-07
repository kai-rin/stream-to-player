import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY } from "../utils/styles";

type MockVideoPlayerProps = {
  state: "buffering" | "error";
};

export const MockVideoPlayer: React.FC<MockVideoPlayerProps> = ({ state }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        position: "relative",
      }}
    >
      {state === "buffering" && (
        <>
          {/* Cluttered overlays representing noisy browser UI */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 180,
              height: "100%",
              background: "rgba(30,30,30,0.85)",
              display: "flex",
              flexDirection: "column",
              padding: "12px 8px",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>おすすめ</div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 64, height: 36, background: "#444", borderRadius: 3, flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ width: 90, height: 8, background: "#555", borderRadius: 2 }} />
                  <div style={{ width: 60, height: 6, background: "#444", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
          {/* Notification popup */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(50,50,50,0.9)",
              border: "1px solid #555",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: "#ccc",
              maxWidth: 200,
            }}
          >
            🔔 通知を許可しますか？
          </div>
          {/* Cookie banner */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(40,40,40,0.95)",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              color: "#aaa",
            }}
          >
            <span>Cookie を受け入れますか？</span>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ background: "#555", padding: "4px 10px", borderRadius: 3, color: "#ddd", fontSize: 10 }}>拒否</div>
              <div style={{ background: "#4285f4", padding: "4px 10px", borderRadius: 3, color: "white", fontSize: 10 }}>同意</div>
            </div>
          </div>
        </>
      )}

      {state === "error" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "85%",
          }}
        >
          {/* Different control bars representing inconsistent UIs */}
          {[
            { label: "Site A", controls: ["▶", "━━━━━━━━", "🔊", "⚙", "🖵"], bg: "#1a1a1a", accent: "#e53935" },
            { label: "Site B", controls: ["⏯", "⏮", "⏭", "━━━━━━", "♫", "CC"], bg: "#1a1a2e", accent: "#6200ea" },
            { label: "Site C", controls: ["►", "00:00", "━━━━", "🔈", "HD", "PiP", "⛶"], bg: "#1a2e1a", accent: "#2e7d32" },
          ].map((site, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 9, color: "#666", paddingLeft: 4 }}>{site.label}</div>
              <div
                style={{
                  background: site.bg,
                  border: "1px solid #333",
                  borderRadius: 4,
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {site.controls.map((c, j) => (
                  <span key={j} style={{
                    fontSize: c.includes("━") ? 10 : 12,
                    color: j === 0 ? site.accent : "#888",
                    flex: c.includes("━") ? 1 : undefined,
                  }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
