// import React from "react";

const TradeQualityCard = () => {
  return (
    <div className="bg-cardBg rounded-xl p-4 mb-4 border border-[#2D2D2D]">
      <h2 className="text-white font-secondary text-lg mb-4">Trade Quality</h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
        {/* Row 1 */}
        <div className="flex justify-between">
          <span className="text-white font-secondary">Win Rate</span>
          <span className="text-profit font-tertiary">58%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white font-secondary">Avg Win</span>
          <span className="text-profit font-tertiary">92</span>
        </div>

        {/* Row 2 */}
        <div className="flex justify-between">
          <span className="text-white font-secondary">Avg Loss</span>
          <span className="text-loss font-tertiary">-54</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white font-secondary">Overall</span>
          <span className="text-white font-tertiary">1,107</span>
        </div>
      </div>
    </div>
  );
};

export default TradeQualityCard;
