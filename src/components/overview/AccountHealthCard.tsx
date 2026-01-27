import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../store/store";

interface AccountHealthCardProps {
  balance: number;
  equity?: number;
  freeMargin?: number;
  leverage?: string; // e.g. "1:100"
  healthLevel?: number | string; // 0-100
}

const AccountHealthCard: React.FC<AccountHealthCardProps> = ({
  balance,
  equity = 0,
  freeMargin = 0,
  leverage = "1:100",
  healthLevel = 60,
}) => {
  //   const theme = useSelector((state: RootState) => state.theme.mode);

  // Ensure numeric value
  const numericHealth =
    typeof healthLevel === "string" ? parseFloat(healthLevel) : healthLevel;

  // Calculate width percentage (0 to 100)
  const widthPercentage = Math.max(0, Math.min(100, numericHealth));

  // Determine color based on health
  // You can adjust thresholds: e.g. < 50 is warning/bad?
  // If negative, definitely loss color.
  const barColor = numericHealth < 0 ? "bg-loss" : "bg-profit";
  const textColor = numericHealth < 0 ? "text-loss" : "text-black";

  const theme = useSelector((state: RootState) => state.theme.mode);
  return (
    <div className="bg-cardBg rounded-xl p-4 mb-4 border border-primary">
      <h2 className="text-primary font-secondary text-sm mb-1">
        Account Health
      </h2>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-tertiary text-2xl text-primary block">
            {balance.toFixed(2)}
          </span>
          <span className="text-secondary text-xs">
            Live Account - <span className="text-profit">{leverage}</span>
          </span>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <div className="text-primary font-tertiary text-lg">
              {equity.toLocaleString()}
            </div>
            <div className="text-secondary text-xs">Equity</div>
          </div>
          <div>
            <div className="text-primary font-tertiary text-lg">
              {freeMargin.toLocaleString()}
            </div>
            <div className="text-secondary text-xs">Free Margin</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {/* Changed track background to neutral (white/10) instead of green tint */}
      <div
        className={`relative w-full h-6 rounded overflow-hidden mt-3 ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`}
      >
        <div
          className={`${barColor} h-full transition-all duration-300`}
          style={{ width: `${widthPercentage}%` }}
        ></div>
        <span
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold ${textColor} opacity-80`}
        >
          {healthLevel}%
        </span>
      </div>
    </div>
  );
};

export default AccountHealthCard;
