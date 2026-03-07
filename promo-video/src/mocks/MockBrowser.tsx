import React from "react";
import { Img, staticFile } from "remotion";
import { COLORS, FONT_FAMILY } from "../utils/styles";
import { SIZES } from "../utils/layout";

type MockBrowserProps = {
  url: string;
  title: string;
  children: React.ReactNode;
  width?: number;
  height?: number;
};

export const MockBrowser: React.FC<MockBrowserProps> = ({
  url,
  title,
  children,
  width = SIZES.browser.width,
  height = SIZES.browser.height,
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          height: 40,
          background: COLORS.browserBar,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Traffic Lights */}
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ff5f57",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#febc2e",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#28c840",
            }}
          />
        </div>
        {/* Tab */}
        <div
          style={{
            marginLeft: 16,
            fontSize: 12,
            color: COLORS.textSecondary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 200,
          }}
        >
          {title}
        </div>
      </div>

      {/* Address Bar */}
      <div
        style={{
          height: 36,
          background: COLORS.browserBar,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
          borderBottom: `1px solid ${COLORS.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            background: COLORS.browserAddress,
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 12,
            color: "#999",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {url}
        </div>
        {/* Extension Icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Img
            src={staticFile("icon128.png")}
            style={{ width: 20, height: 20, borderRadius: 4 }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          background: "#111",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
