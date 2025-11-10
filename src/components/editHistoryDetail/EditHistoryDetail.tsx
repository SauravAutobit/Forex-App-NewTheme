import { useState } from "react";
import downArrowWhite from "../../assets/icons/downArrowWhite.svg";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../editOrderList/EditOrderList";
interface HistoryCardPropsStatic {
  index?: number;
  // NEW PROPS for the tutorial feature
  onCardClick: () => void;
  isTutorialTarget: boolean; // Flag to identify the card the arrow points to
  type?: "market" | "pending" | "closed"; // dynamic from state
}

const EditHistoryDetail = ({
  index,
  onCardClick,
  isTutorialTarget,
  type,
}: HistoryCardPropsStatic) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const toggleDetails = () => {
    setIsDetailsVisible((s) => !s);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. Dismiss the tutorial arrow if this is the target card
    if (isTutorialTarget) {
      onCardClick();
    }

    // 2. Toggle the card details
    toggleDetails();
  };

  const profitBalanceProps: ProfitBalanceProps = {
    balanceItems: [
      { label: "Device", value: "Android" },
      { label: "Order type", value: "Buy Stop" },
      { label: "Target price", value: "1.31324" },
      { label: "Volume", value: "0.01 lots" },
      { label: "Take profit", value: "1.21374" },
      { label: "Stop loss", value: "1.21274" },
    ],
    marginTop: "16px",
  };

  return (
    <>
      <div key={index} className="flex flex-col gap-4 select-none no-select">
        <div
          // Added a visual cue (border/shadow) when it's the target card
          className={`${
            isDetailsVisible ? "bg-cardBg" : "bg-inherit"
          } border-b border-primary px-5 py-4 backdrop-blur-[32px] cursor-pointer`}
          onClick={handleClick}
        >
          {/* --- Main card content that is always visible --- */}
          <div className="w-full">
            <div className="w-full flex justify-between items-center mb-2">
              {/* Trading Name and Prices/Status */}
              <div className={`flex w-full justify-between`}>
                <div className="flex items-center">
                  <div>
                    {type !== "pending"
                      ? "Order Closed"
                      : "Pending ordercreated"}
                  </div>
                  {/* Price Transition or Simple Price (For History Items) */}
                </div>
              </div>

              {/* Date and Time (Always shown for history tabs) */}
              {type !== "pending" && (
                <div className="text-loss whitespace-nowrap">-$0.45</div>
              )}
              <img src={downArrowWhite} alt="downArrowWhite" />
            </div>

            <div className="flex justify-between items-center">
              {/* Buy/Sell with Qty/At/In Label */}
              <div className="text-sm text-secondary">
                {type !== "pending"
                  ? "Executed Trailing Stop"
                  : "Manual operation"}
              </div>
              {/* P&L or Status Label */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-secondary">
                  -$0.45 2025/10/16 17:39:25
                </span>
              </div>
            </div>
          </div>

          {/* --- Collapsible Details Section --- */}
          <div
            className={`grid transition-all duration-300 ease-in-out overflow-hidden
              ${
                isDetailsVisible
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
          >
            <div className="overflow-hidden">
              <div className="mt-4 border-t border-primary">
                <EditOrderList {...profitBalanceProps} />
                {/* "Hide Details" button */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditHistoryDetail;
