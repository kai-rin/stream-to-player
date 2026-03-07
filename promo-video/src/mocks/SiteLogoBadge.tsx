import React from "react";
import { FONT_FAMILY } from "../utils/styles";

type SiteLogoBadgeProps = {
  name: string;
  color: string;
};

export const SiteLogoBadge: React.FC<SiteLogoBadgeProps> = ({
  name,
  color,
}) => {
  return (
    <div
      style={{
        width: 300,
        height: 80,
        background: color,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        fontSize: 28,
        fontWeight: 700,
        color: "white",
        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }}
    >
      {name}
    </div>
  );
};

export const SITE_DATA: { name: string; color: string }[] = [
  { name: "YouTube", color: "#ff0000" },
  { name: "Twitch", color: "#9146ff" },
  { name: "ABEMA", color: "#19c526" },
  { name: "TVer", color: "#149ad7" },
  { name: "ニコニコ動画", color: "#e64980" },
];
