import { useEffect, useRef, useState } from "react";
import cardIcon from "../../assets/icons/cardIcon.svg";
import notFavouriteTick from "../../assets/icons/notFavrouiteTick.svg";
import favouriteTick from "../../assets/icons/favrouiteTick.svg";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

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

// ✅ NEW: Rewritten helper to format price based on pip value
interface FormattedPrice {
  isPipFormatted: boolean;
  main: string;
  pipsOrSmall: string; // This will hold 'pips' for pip-style or 'small' for original-style
  small: string;
}

const formatPrice = (price: number, pip?: number | string): FormattedPrice => {
  // console.log("formatPrice called with price:", price, "and pip:", pip);
  if (price === 0)
    return { isPipFormatted: false, main: "0.00", pipsOrSmall: "", small: "" };

  const pipValue = typeof pip === "string" ? parseFloat(pip) : pip;

  // Pip-specific logic: Only apply if pipValue is a valid number less than 0.1
  if (pipValue && !isNaN(pipValue) && pipValue < 0.1) {
    const priceStr = price.toString();
    const parts = priceStr.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1] || "";
    const pipDecimalPlaces = Math.round(Math.log10(1 / pipValue));

    // Check if there are enough decimal places to apply pip formatting
    if (decimalPart.length >= pipDecimalPlaces - 2) {
      const normalDecimalPlaces = pipDecimalPlaces - 2;
      return {
        isPipFormatted: true,
        main: `${integerPart}.${decimalPart.slice(0, normalDecimalPlaces)}`,
        pipsOrSmall: decimalPart.slice(normalDecimalPlaces, pipDecimalPlaces),
        small: decimalPart.slice(pipDecimalPlaces),
      };
    }
  }

  // Fallback to original logic if pip formatting is not applicable
  const priceStr = price.toFixed(4); // Use toFixed(4) as a standard fallback
  const parts = priceStr.split(".");
  return {
    isPipFormatted: false,
    main: `${parts[0]}.${parts[1].slice(0, 2)}`,
    pipsOrSmall: parts[1].slice(2),
    small: "",
  };
};

const Card = ({
  code,
  bid,
  ask,
  high,
  low,
  ltp,
  close,
  pip,
  timestamp,
  onClick,
  active,
  favourites,
}: CardProps) => {
  const askPrice = formatPrice(ask, pip);
  const bidPrice = formatPrice(bid, pip);
  // console.log(lowValue, hightValue, close);

  // ✅ State to hold the dynamic color classes
  const [askColor, setAskColor] = useState("text-primary"); // Start neutral
  const [bidColor, setBidColor] = useState("text-primary"); // Start neutral

  const [star, setStar] = useState(false);

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

  //  Calculate change and percentage
  const change = ltp - close;
  const percentageChange = close !== 0 ? (change / close) * 100 : 0;
  const changeColor = change >= 0 ? "text-profit" : "text-loss";
  const changeSign = change >= 0 ? "+" : "";
  // console.log("change", change, percentageChange, changeColor, changeSign);

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
            <div className="flex justify-between items-center text-secondary text-xs">
              <span>{timestamp}</span>
            </div>
            <h2 className="my-1">{code.toUpperCase()}</h2>

            <p className={`text-xs ${changeColor}`}>
              {changeSign}
              {change.toFixed(2)} <span>({percentageChange.toFixed(3)}%)</span>
            </p>
          </div>
        </div>

        {/* Middle + Right Side */}
        <div className="flex items-center mt-2">
          {/* Right: Bid Price (Green) */}
          <div className="text-right pr-2">
            {bidPrice.isPipFormatted ? (
              //    font-secondary
              <p
                className={`${bidColor} leading-5 transition-colors duration-200 flex items-baseline`}
              >
                {/* text-xl text-3xl text-sm */}
                <span className="">{bidPrice.main}</span>
                <span className="">{bidPrice.pipsOrSmall}</span>
                <span className="">{bidPrice.small}</span>
              </p>
            ) : (
              // text-xl font-secondary
              <p
                className={`${bidColor} leading-5 transition-colors duration-200`}
              >
                <span>{bidPrice.main}</span>
                {/* text-sm */}
                <span className="">{bidPrice.pipsOrSmall}</span>
              </p>
            )}
            <p className="text-sm text-secondary">
              {/* font-tertiary text-base pr-2.5 */}
              <span className="">L: </span>
              {low.toFixed(2)}
            </p>
          </div>

          {/* Vertical Divider */}
          {/* <div className="w-px h-10 bg-gray-600 mx-2"></div> */}

          {/* Middle: Ask Price (Red) */}
          <div className="text-right pl-2">
            {askPrice.isPipFormatted ? (
              //   font-secondary
              <p
                className={`${askColor} leading-5 transition-colors duration-200 flex items-baseline`}
              >
                {/* text-xl text-3xl text-sm */}
                <span className="">{askPrice.main}</span>
                <span className="">{askPrice.pipsOrSmall}</span>
                <span className="">{askPrice.small}</span>
              </p>
            ) : (
              // text-xl font-secondary
              <p
                className={`${askColor} leading-5 transition-colors duration-200`}
              >
                <span>{askPrice.main}</span>
                {/* text-sm */}
                <span className="">{askPrice.pipsOrSmall}</span>
              </p>
            )}
            <p className="text-sm text-secondary">
              {/* font-tertiary text-base pr-2.5 */}
              <span className="">H: </span>
              {high.toFixed(2)}
            </p>
          </div>
        </div>
        {active !== "Favorites" && favourites === true ? (
          <img
            src={star === false ? notFavouriteTick : favouriteTick}
            alt="notFavouriteTick"
            onClick={(e) => {
              e.stopPropagation(); // ⭐️ Stop click event from triggering the parent card's onClick/swipe
              setStar(!star);
            }}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Card;
