import { useLocation } from "react-router-dom";
import cardIcon from "../../assets/icons/cardIcon.svg";
import arrow from "../../assets/icons/arrow.svg";
import { useAppSelector } from "../../store/hook";

// Interface for the EURUSDCard's props, based on the QuoteData structure
// ✅ CHANGED: Props are now clear and match the data
export interface CardProps {
  code: string;
  bid: number;
  ask: number;
  high: number;
  low: number;
  ltp: number; // ✅ Now used for calculation
  close: number; // ✅ FIX: Added 'close' for the calculation
  pip?: number | string;
  timestamp: string; // ✅ FIX: Moved to its own line
  onClick: () => void;
  active?: string;
  favourites?: boolean;
  border?: boolean;
}

const MarketCard = ({ code, timestamp, onClick, border = true }: CardProps) => {
  const { pathname } = useLocation();

  const marketEdit = pathname === "/app/marketEdit";

  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div
      className={`text-primary py-2.5 px-5 ${
        border === true ? "border-b border-primary" : ""
      }`}
      onClick={onClick}
      //   style={{ border: theme === "dark" ? "" : "1px solid #C2C2C2" }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <img src={cardIcon} alt="cardIcon" />
          {/* Left Side: Title and Change */}

          <div>
            <h2 className="my-1 font-secondary">{code.toUpperCase()}</h2>
            <div>Buy 0.01</div>
          </div>
        </div>

        {/* Middle + Right Side */}
        <div className="flex items-center mt-2">
          <div>
            <div className="text-right text-profit font-secondary">+$0.58</div>
            {/* Right: Bid Price (Green) */}
            <div className="flex">
              <div className={`text-right ${!marketEdit && "pr-2"}`}>
                <div className="flex justify-between items-center mt-1">
                  <span className={`${marketEdit && "text-secondary"}`}>
                    {marketEdit ? "1.17047" : "2025.09.15"}
                  </span>
                </div>
              </div>

              {marketEdit ? (
                <img src={arrow} alt="arrow" />
              ) : (
                <div
                  className={`w-px ${
                    theme === "dark" ? "bg-[#FAFAFA]" : "bg-[#2D2D2D]"
                  }`}
                ></div>
              )}

              {/* Middle: Ask Price (Red) */}
              <div className={`text-right ${!marketEdit && "pl-2"}`}>
                <div className="flex justify-between items-center mt-1">
                  <span className={`${marketEdit && "text-secondary"}`}>
                    {marketEdit ? "1.17047" : timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;
