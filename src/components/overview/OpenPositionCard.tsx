import React from "react";

interface OpenPositionCardProps {
  balanceCount?: number;
  equityCount?: number;
  bestPnL?: number;
  dailyLossLimit?: number;
}

const OpenPositionCard: React.FC<OpenPositionCardProps> = ({
  balanceCount = 3,
  equityCount = 3,
  bestPnL = 86,
  dailyLossLimit = 86,
}) => {
  return (
    <div className="bg-cardBg rounded-xl p-4 mb-4 border border-[#2D2D2D]">
      <h2 className="text-white font-secondary text-sm mb-4">Open Position</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Balance Column */}
        <div>
          <div className="text-white text-sm mb-1">
            Balance - {balanceCount}
          </div>
          <div className="flex items-center bg-[#2ed12e33] rounded h-5 overflow-hidden">
            <div className="bg-profit h-full" style={{ width: "60%" }}></div>
            <span className="ml-auto pr-2 text-xs text-profit font-bold">
              60%
            </span>
          </div>
          <div className="text-white text-xs mt-2">
            Best <span className="text-profit">+{bestPnL}</span>
          </div>
        </div>

        {/* Equity Column */}
        <div>
          <div className="text-white text-sm mb-1">Equity - {equityCount}</div>
          <div className="flex items-center bg-[#2ed12e33] rounded h-5 overflow-hidden">
            <div className="bg-profit h-full" style={{ width: "60%" }}></div>
            <span className="ml-auto pr-2 text-xs text-profit font-bold">
              60%
            </span>
          </div>
          <div className="text-white text-xs mt-2">
            Daily Loss Limit{" "}
            <span className="text-profit">+{dailyLossLimit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenPositionCard;
