// import React from "react";

const PerformanceCard = () => {
  return (
    <div className="bg-cardBg rounded-xl p-4 mb-4 border border-primary">
      <h2 className="text-primary font-secondary text-lg mb-4">Performance</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {/* Row 1 */}
        <div className="flex justify-between">
          <span className="text-primary font-secondary">Today</span>
          <span className="text-profit font-tertiary">+0.6%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary font-secondary">This Week</span>
          <span className="text-profit font-tertiary">+0.6%</span>
        </div>

        {/* Row 2 */}
        <div className="flex justify-between">
          <span className="text-primary font-secondary">This Month</span>
          <span className="text-profit font-tertiary">+0.6%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary font-secondary">Overall</span>
          <span className="text-profit font-tertiary">+0.6%</span>
        </div>

        {/* Row 3 */}
        <div className="flex justify-between">
          <span className="text-primary font-secondary">Max Drawndown</span>
          <span className="text-loss font-tertiary">-6.2%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary font-secondary">Current Drawdown</span>
          <span className="text-loss font-tertiary">-1.4%</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCard;
