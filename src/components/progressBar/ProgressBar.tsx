import React from "react";

interface ProgressBarProps {
  timeframe: string; // e.g., "5 minutes (M5)"
  buyPercentage: number; // e.g., 60
  sellPercentage: number; // e.g., 40
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  timeframe,
  buyPercentage,
  sellPercentage,
}) => {
  // Ensure percentages add up to 100 for proper layout,
  // though the component visually handles the split based on prop values.
  const buyWidth = `${buyPercentage}%`;
  const sellWidth = `${sellPercentage}%`;

  // Define custom colors for the trading app look
  const buyColor = "#02F511"; // Neon Green
  const sellColor = "#FF0000"; // Bright Red

  return (
    <div className="text-white font-secondary mt-5 first:mt-0">
      {/* Timeframe Label */}
      <p className="mb-1">{timeframe}</p>

      {/* Progress Bar Container */}
      <div className="relative h-[22px] w-full rounded-[4px] overflow-hidden flex shadow-inner shadow-black/50">
        {/* Buy Sentiment Bar (Green) */}
        <div
          className="h-full"
          style={{ width: buyWidth, backgroundColor: buyColor }}
        >
          {/* Buy Percentage Label */}
          <span
            className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary text-sm font-tertiary"
            // Ensure visibility for small percentages
            style={{ color: "#2d2d2d" }}
          >
            {buyPercentage}%
          </span>
        </div>

        {/* Sell Sentiment Bar (Red) */}
        <div
          className="h-full"
          style={{ width: sellWidth, backgroundColor: sellColor }}
        >
          {/* Sell Percentage Label */}
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary text-sm font-tertiary"
            // Ensure visibility for small percentages
            style={{ color: "#2d2d2d" }}
          >
            {sellPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
