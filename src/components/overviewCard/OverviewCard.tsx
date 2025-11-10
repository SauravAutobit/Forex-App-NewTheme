import cardIcon from "../../assets/icons/cardIcon.svg";
import type { CardProps } from "../card/Card";
import { useEffect, useState } from "react";
import { usePrevious } from "../../utils/helperFunctions";
import tooltip from "../../assets/icons/tooltip.svg";

const OverviewCard = ({ code, bid, ask, ltp, close, onClick }: CardProps) => {
  // console.log(lowValue, hightValue, close);

  // ✅ State to hold the dynamic color classes
  const [, setAskColor] = useState("text-primary"); // Start neutral
  const [, setBidColor] = useState("text-primary"); // Start neutral

  // ✅ Get the previous values
  const prevAsk = usePrevious(ask);
  const prevBid = usePrevious(bid);

  // ✅ useEffect to compare current and previous prices and set color
  useEffect(() => {
    // Check for Ask price change
    if (prevAsk !== undefined && ask !== 0) {
      if (ask > prevAsk) {
        setAskColor("text-profit"); // Price went up (green)
      } else if (ask < prevAsk) {
        setAskColor("text-loss"); // Price went down (red)
      }
      // If ask === prevAsk, the color remains unchanged
    }
  }, [ask, prevAsk]);

  useEffect(() => {
    // Check for Bid price change
    if (prevBid !== undefined && bid !== 0) {
      if (bid > prevBid) {
        setBidColor("text-profit"); // Price went up (green)
      } else if (bid < prevBid) {
        setBidColor("text-loss"); // Price went down (red)
      }
      // If bid === prevBid, the color remains unchanged
    }
  }, [bid, prevBid]);

  // console.log("ltp close", ltp, close);
  const change = ltp - close;
  const percentageChange = close !== 0 ? (change / close) * 100 : 0;
  const changeColor = change >= 0 ? "text-profit" : "text-loss";
  const changeSign = change >= 0 ? "+" : "";

  return (
    <div className="text-primary py-2.5 px-5" onClick={onClick}>
      <div className="flex justify-between items-center">
        <div className="flex items-start gap-2.5">
          <img src={cardIcon} alt="cardIcon" />

          <div>
            <div className="flex justify-between items-center text-secondary text-xs"></div>
            <h2 className="my-1">{code.toUpperCase()}</h2>
            <p className={`ml-[-43px] mt-1 ${changeColor}`}>
              <span className="font-tertiary text-[28px] text-[#FAFAFA] mr-1.5">
                15048.12
              </span>
              {changeSign}
              {change.toFixed(2)} <span>({percentageChange.toFixed(3)}%)</span>
            </p>
          </div>
        </div>

        <img src={tooltip} alt="tooltip" />
      </div>
    </div>
  );
};

export default OverviewCard;
