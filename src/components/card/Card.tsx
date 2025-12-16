import { useEffect, useState } from "react";
import cardIcon from "../../assets/icons/cardIcon.svg";
import notFavouriteTick from "../../assets/icons/notFavrouiteTick.svg";
import favouriteTick from "../../assets/icons/favrouiteTick.svg";
import { formatPrice, usePrevious } from "../../utils/helperFunctions";
import notFavouriteTickLight from "../../assets/icons/notFavrouiteTickLight.svg";
import favouriteTickLight from "../../assets/icons/favrouiteTickLight.svg";
import { useAppSelector } from "../../store/hook";
import type { OutletContextType } from "../../layout/MainLayout";
import { useOutletContext } from "react-router-dom";

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
}

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

  const { favouriteInstrument, setFavouriteInstrument } =
    useOutletContext<OutletContextType>();
  const [star, setStar] = useState(false);

  const theme = useAppSelector((state) => state.theme.mode);

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

  const iconSrc =
    theme === "light"
      ? star
        ? favouriteTickLight
        : notFavouriteTickLight
      : star
      ? favouriteTick
      : notFavouriteTick;
  return (
    <div
      className="text-primary px-5 py-2.5 border-b border-primary"
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
            src={iconSrc}
            alt="favouriteStar"
            onClick={(e) => {
              e.stopPropagation(); // Stop click event from triggering the parent card's onClick/swipe
              setFavouriteInstrument((prev) => {
                if (prev.includes(code)) {
                  return prev.filter((item) => item !== code);
                } else {
                  return [...prev, code];
                }
              });
              setStar(!star);
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Card;
