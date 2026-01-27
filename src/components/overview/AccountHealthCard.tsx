import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface AccountHealthCardProps {
  balance: number;
  equity?: number;
  freeMargin?: number;
  leverage?: string; // e.g. "1:100"
  healthLevel?: number; // 0-100
}

const AccountHealthCard: React.FC<AccountHealthCardProps> = ({
  balance,
  equity = 0,
  freeMargin = 0,
  leverage = "1:100",
  healthLevel = 60,
}) => {
  const theme = useSelector((state: RootState) => state.theme.mode);

  return (
    <div className="bg-cardBg rounded-xl p-4 mb-4 border border-[#2D2D2D]">
      <h2 className="text-white font-secondary text-sm mb-1">Account Health</h2>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-tertiary text-2xl text-white block">
            {balance.toFixed(2)}
          </span>
          <span className="text-secondary text-xs">
            Live Account - <span className="text-profit">{leverage}</span>
          </span>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <div className="text-white font-tertiary text-lg">
              {equity.toLocaleString()}
            </div>
            <div className="text-secondary text-xs">Equity</div>
          </div>
          <div>
            <div className="text-white font-tertiary text-lg">
              {freeMargin.toLocaleString()}
            </div>
            <div className="text-secondary text-xs">Free Margin</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-6 bg-[#2ed12e33] rounded overflow-hidden mt-3">
        <div
          className="bg-profit h-full"
          style={{ width: `${healthLevel}%` }}
        ></div>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-black opacity-60">
          {healthLevel}%
        </span>
      </div>
    </div>
  );
};

export default AccountHealthCard;
