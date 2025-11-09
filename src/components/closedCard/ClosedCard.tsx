import { useLocation } from "react-router-dom";
import cardIcon from "../../assets/icons/cardIcon.svg";
import arrow from "../../assets/icons/arrow.svg";

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

const ClosedCard = ({ code, timestamp, onClick }: CardProps) => {
  const { pathname } = useLocation();

  const closedEdit = pathname === "/app/closedEdit";

  return (
    <div
      className="text-primary px-5 py-2.5 border-b border-primary"
      onClick={onClick}
      //   style={{ border: theme === "dark" ? "" : "1px solid #C2C2C2" }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          {/* Left Side: Title and Change */}
          {closedEdit && <img src={cardIcon} alt="cardIcon" />}

          <div>
            {!closedEdit && (
              <div className="text-quaternary font-secondary">25/06/2025</div>
            )}
            <div className="flex items-center gap-2.5">
              <h2 className="my-1 font-tertiary">{code.toUpperCase()}</h2>
            </div>{" "}
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
                  <span className={`${closedEdit && "text-secondary"}`}>
                    {closedEdit ? "1.17047" : "2025.09.15"}
                  </span>
                </div>
              </div>

              {closedEdit ? (
                <img src={arrow} alt="arrow" />
              ) : (
                <div className="w-px bg-[#FAFAFA]"></div>
              )}

              {/* Middle: Ask Price (Red) */}
              <div className="text-right pl-2">
                <div className="flex justify-between items-center mt-1">
                  <span className={`${closedEdit && "text-secondary"}`}>
                    {closedEdit ? "1.17047" : timestamp}
                  </span>{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosedCard;
