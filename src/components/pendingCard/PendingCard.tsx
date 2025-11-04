import rightArrow from "../../assets/icons/rightArrow.svg";

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

const PendingCard = ({ code, timestamp, onClick }: CardProps) => {
  return (
    <div
      className="text-primary py-2.5 border-b border-primary"
      onClick={onClick}
      //   style={{ border: theme === "dark" ? "" : "1px solid #C2C2C2" }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          {/* Left Side: Title and Change */}

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="my-1 font-tertiary">{code.toUpperCase()}</h2>
              <span className="w-[18px] h-[18px] bg-tertiary text-sm text-secondary flex justify-center items-center rounded-[4px]">
                TP
              </span>{" "}
              <span className="w-[18px] h-[18px] bg-tertiary text-sm text-secondary flex justify-center items-center rounded-[4px]">
                SL
              </span>
            </div>{" "}
            <div>
              Buy limit <span className="text-secondary">0.01</span>
            </div>
          </div>
        </div>

        {/* Middle + Right Side */}
        <div className="flex items-center mt-2">
          <div>
            <div className="flex items-center gap-2.5 text-secondary">
              0.0670
              <img src={rightArrow} alt="rightArrow" />
              <span className="font-tertiary text-primary">0.0690</span>
            </div>
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

export default PendingCard;
