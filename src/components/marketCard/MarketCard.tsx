import cardIcon from "../../assets/icons/cardIcon.svg";

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
}

const MarketCard = ({ code, timestamp, onClick }: CardProps) => {
  return (
    <div
      className="text-primary py-2.5 border-b border-primary"
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
              <div className="text-right pr-2">
                <div className="flex justify-between items-center mt-1">
                  <span>2025.09.15</span>
                </div>
              </div>

              <div className="w-px bg-[#FAFAFA]"></div>

              {/* Middle: Ask Price (Red) */}
              <div className="text-right pl-2">
                <div className="flex justify-between items-center mt-1">
                  <span>{timestamp}</span>
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
