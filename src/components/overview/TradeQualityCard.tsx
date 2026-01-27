// import React from "react";

interface TradeQualityCardProps {
  winRate?: number;
  avgWin?: number;
  avgLoss?: number;
  totalTrades?: number;
}

const TradeQualityCard: React.FC<TradeQualityCardProps> = ({
  winRate = 58,
  avgWin = 92,
  avgLoss = -54,
  totalTrades = 1107,
}) => {
  return (
    <div className="bg-cardBg rounded-xl p-4 mb-4 border border-primary">
      <h2 className="text-primary font-secondary text-lg mb-4">
        Trade Quality
      </h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
        {/* Row 1 */}
        <div className="flex justify-between">
          <span className="text-primary font-secondary">Win Rate</span>
          <span className="text-profit font-tertiary">{winRate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary font-secondary">Avg Win</span>
          <span className="text-profit font-tertiary">{avgWin.toFixed(2)}</span>
        </div>

        {/* Row 2 */}
        <div className="flex justify-between">
          <span className="text-primary font-secondary">Avg Loss</span>
          <span className="text-loss font-tertiary">{avgLoss.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary font-secondary">Overall</span>
          <span className="text-primary font-tertiary">{totalTrades}</span>
        </div>
      </div>
    </div>
  );
};

export default TradeQualityCard;
