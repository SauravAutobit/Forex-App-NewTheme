import React from "react";

const NeonGlowBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mainBgColor = "#0c0c0c";
  //   const neonColor = "#7cfc00"; // Neon Green

  const neonColor = "#AEED0980";

  // --- Figma Coordinates ---
  // Top/Left coordinates are relative to the viewport/page for a full screen background.
  const figmaGlowStyle = {
    position: "absolute" as const,
    width: "329px",
    height: "329px",
    // Setting the position based on Figma values.
    // We use 'top' and 'left' directly.
    top: "523px",
    left: "-103px",
    // Color and blur are key to the shade effect
    backgroundColor: neonColor,
    filter: "blur(150px)", // A very strong blur is required for a soft, ambient glow
    opacity: 0.8, // Increased opacity to 0.8 to make the blur noticeable, matching the density of a Figma glow object
    borderRadius: "50%", // Make it circular before blurring
    pointerEvents: "none" as const,
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: mainBgColor }}
    >
      {/* 1. The new Figma-based fixed glow element */}
      <div style={figmaGlowStyle} />

      {/* Container for all the actual UI content (z-10 is fine) */}
      <div className="relative z-10 w-full min-h-screen">{children}</div>
    </div>
  );
};

export default NeonGlowBackground;
