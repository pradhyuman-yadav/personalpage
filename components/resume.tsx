"use client";

import React from "react";
import { useTheme } from "next-themes";

const FullScreenSVG: React.FC = () => {
    const { theme } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* SVG Display */}
      <img
        src="/Resume.svg"
        alt="Text as SVG"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: theme === "dark" ? "invert(1)" : "none",
        }}
      />
    </div>
  );
};

export function PDFEmbed() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="/Resume.pdf"
        width="100%"
        height="100%"
      />
    </div>
  );
}

// export default FullScreenSVG;
