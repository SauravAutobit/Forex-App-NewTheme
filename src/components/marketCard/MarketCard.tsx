import { useEffect, useRef, useState } from "react";
import cardIcon from "../../assets/icons/cardIcon.svg";
// import arrow from "../../assets/icons/arrow.svg";/

// ✅ A custom hook to get the previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export interface CardProps {
  code: string;
  bid: number;
  ask: number;
  high: number;
  low: number;
  ltp: number;
  close: number;
  pip?: number | string;
  timestamp: string;
  onClick: () => void;
  active?: string;
  favourites?: boolean;
  border?: boolean;
  paddingLeft?: string;
  paddingRight?: string;
}

interface FormattedPrice {
  isPipFormatted: boolean;
  main: string;
  pipsOrSmall: string;
  small: string;
}

const formatPrice = (price: number, pip?: number | string): FormattedPrice => {
  if (price === 0)
    return { isPipFormatted: false, main: "0.00", pipsOrSmall: "", small: "" };

  const pipValue = typeof pip === "string" ? parseFloat(pip) : pip;

  if (pipValue && !isNaN(pipValue) && pipValue < 0.1) {
    const priceStr = price.toString();
    const parts = priceStr.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1] || "";
    const pipDecimalPlaces = Math.round(Math.log10(1 / pipValue));

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
  const priceStr = price.toString();
  const parts = priceStr.split(".");

  // Handle integers or limited decimals
  if (parts.length === 1) {
    return {
      isPipFormatted: false,
      main: `${parts[0]}.00`,
      pipsOrSmall: "",
      small: "",
    };
  }

  const decimals = parts[1];
  const mainDecimals = decimals.slice(0, 2);
  const restDecimals = decimals.slice(2);

  // Ensure consistent 2 decimal display for "main" even if input has only 1 decimal
  const formattedMainDecimals =
    mainDecimals.length < 2 ? mainDecimals.padEnd(2, "0") : mainDecimals;

  return {
    isPipFormatted: false,
    main: `${parts[0]}.${formattedMainDecimals}`,
    pipsOrSmall: restDecimals,
    small: "",
  };
};

const MarketCard = ({
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
  border = true,
  paddingLeft = "20px",
  paddingRight = "20px",
}: CardProps) => {
  const askPrice = formatPrice(ask, pip);
  const bidPrice = formatPrice(bid, pip);

  const [askColor, setAskColor] = useState("text-primary");
  const [bidColor, setBidColor] = useState("text-primary");

  const prevAsk = usePrevious(ask);
  const prevBid = usePrevious(bid);

  useEffect(() => {
    if (prevAsk !== undefined && ask !== 0) {
      if (ask > prevAsk) setAskColor("text-profit");
      else if (ask < prevAsk) setAskColor("text-loss");
    }
  }, [ask, prevAsk]);

  useEffect(() => {
    if (prevBid !== undefined && bid !== 0) {
      if (bid > prevBid) setBidColor("text-profit");
      else if (bid < prevBid) setBidColor("text-loss");
    }
  }, [bid, prevBid]);

  const change = ltp - close;
  const percentageChange = close !== 0 ? (change / close) * 100 : 0;
  const changeColor = change >= 0 ? "text-profit" : "text-loss";
  const changeSign = change >= 0 ? "+" : "";

  return (
    <div
      className={`text-primary py-2.5 ${
        border === true ? "border-b border-primary" : ""
      }`}
      onClick={onClick}
      style={{ paddingLeft, paddingRight }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <img src={cardIcon} alt="cardIcon" />
          <div>
            <h2 className="my-1 font-secondary">{code.toUpperCase()}</h2>
            <p className={`text-xs font-secondary ${changeColor}`}>
              {changeSign}
              {change.toFixed(2)} <span>({percentageChange.toFixed(3)}%)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="text-right pr-2">
            <div
              className={`${askColor} font-secondary transition-colors duration-200 flex items-baseline justify-end`}
            >
              <span className="text-base">{askPrice.main}</span>
              <span className="text-xl font-bold">{askPrice.pipsOrSmall}</span>
              <span className="text-[10px]">{askPrice.small}</span>
            </div>
            <p className="text-[10px] text-secondary">
              <span className="font-tertiary pr-1">H</span>
              {high.toFixed(2)}
            </p>
          </div>

          <div className="w-px h-6 bg-primary mx-1"></div>

          <div className="text-right pl-2">
            <div
              className={`${bidColor} font-secondary transition-colors duration-200 flex items-baseline justify-end`}
            >
              <span className="text-base">{bidPrice.main}</span>
              <span className="text-xl font-bold">{bidPrice.pipsOrSmall}</span>
              <span className="text-[10px]">{bidPrice.small}</span>
            </div>
            <p className="text-[10px] text-secondary">
              <span className="font-tertiary pr-1">L</span>
              {low.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="text-[10px] text-secondary mt-1 ml-9">{timestamp}</div>
    </div>
  );
};

export default MarketCard;
