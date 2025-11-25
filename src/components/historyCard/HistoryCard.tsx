import React, { useState } from "react";

// Define a new interface for the component signature
interface HistoryCardPropsStatic {
  label: "Position" | "Orders" | "Deals";
  index?: number;
  // NEW PROPS for the tutorial feature
  onCardClick: () => void;
  isTutorialTarget: boolean; // Flag to identify the card the arrow points to
}

const HistoryCard = ({
  label,
  index,
  onCardClick,
  isTutorialTarget,
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

  // --- (Static Dummy Data Simulation - REMAINING LOGIC IS UNCHANGED) ---

  // Determine the type being rendered
  const isHistoryPosition = label === "Position";
  const isHistoryOrder = label === "Orders";
  const isDeal = label === "Deals";

  // Shared Dummy Data
  const resolvedInstrumentName = "EURUSD";
  const buySellSide = isHistoryOrder ? "buy" : "sell";

  // Data that varies by type
  let pnl: number = 0;
  let statusValue: string = "N/A";
  let orderSideLabel: string = "";
  let qtyDisplayString: string = "N/A";
  let dateTimeString: string = "2024.01.25 | 14:30:15";

  // History Position (Closed Position)
  if (isHistoryPosition) {
    pnl = 85.75;
    orderSideLabel = `${buySellSide.toUpperCase()} Qty:`;
    qtyDisplayString = "11.00";
    dateTimeString = "2024.10.15 | 09:15:30"; // Time of closing
    statusValue = "CLOSED";
  }
  // History Orders (Filled/Canceled)
  else if (isHistoryOrder) {
    pnl = 0; // Orders don't have PnL
    orderSideLabel = `${buySellSide.toUpperCase()} Limit:`;
    qtyDisplayString = "1.50 @ Market";
    dateTimeString = "2024.10.15 | 09:15:00"; // Time of completion
    statusValue = "FILLED";
  }
  // Deals (Trade Records)
  else if (isDeal) {
    pnl = 123.45;
    orderSideLabel = `${buySellSide.toUpperCase()} Out:`;
    qtyDisplayString = "0.50 @ 1.08600";
    dateTimeString = "2024.10.15 | 09:15:30"; // Time of deal
    statusValue = "DEAL";
  }

  // Common formatting
  const pnlColorClass =
    pnl > 0 ? "text-profit" : pnl < 0 ? "text-loss" : "text-secondary";
  const topLeftPrice = 1.17282; // Entry/Order Price
  const topRightPrice = 1.17427; // Close/Deal Price or N/A
  const totalCharges = 2.5;
  const sl = 1.08;
  const tp = 1.095;
  const tid = isDeal
    ? "#7619388856"
    : isHistoryOrder
    ? "#9619388856"
    : "#8619388856";

  const formatPriceOrEmpty = (p: number | null) =>
    p == null ? " " : Number(p).toFixed(5);
  const formatSlTp = (v: number | string | null) =>
    v == null || v === 0 || v === "-" ? "-" : Number(v).toFixed(5);

  // --- JSX Layouts for Detail Section (Conditionals) ---

  // 1. History Order Details
  const renderOrderDetails = () => (
    <div className="mt-2">
      <div className="grid grid-cols-4 text-sm text-secondary gap-x-4 mb-2">
        {/* Left Column Group */}
        <div>
          <div>S/L:</div>
          <div className="mt-2">T/P:</div>
          {/* <div className="mt-2">Type:</div> */}
        </div>
        <div className="text-right text-primary">
          <div className="no-underline">{formatSlTp(sl)}</div>
          <div className="mt-2 no-underline">{formatSlTp(tp)}</div>
          {/* <div className="mt-2 no-underline">Market</div> */}
        </div>
        {/* Right Column Group (Placeholders for alignment) */}
        <div className="text-left">
          {/* <div className="pb-2"></div> */}
          {/* <div className="mt-2">Time:</div> */}
          {/* <div className="mt-2"></div> */}
        </div>
        <div className="text-right text-primary">
          {/* <div className="pb-2"></div> */}
          {/* <div className="mt-2">{dateTimeString.split(" | ")[1]}</div> */}
          <div className="mt-[26px] ml-[-6px]">{tid}</div>
        </div>
      </div>
    </div>
  );

  // 2. History Position Details (Closed)
  const renderHistoryPositionDetails = () => (
    <div className="mt-2">
      <div className="grid grid-cols-4 text-sm text-secondary gap-x-2 mb-2">
        {/* Left Column Group */}
        <div>
          <div>S/L:</div>
          <div className="mt-2">Open:</div>
          <div className="mt-2">Id:</div>
        </div>
        <div className="text-right text-primary">
          <div className="no-underline">{formatSlTp(sl)}</div>
          <div className="mt-2 no-underline ml-[-34px]">{dateTimeString}</div>
          <div className="mt-2 no-underline">{tid}</div>
        </div>
        {/* Right Column Group */}
        <div className="text-left">
          <div>T/P:</div>
          <div className="mt-2">Swap:</div>
          <div className="mt-2">Charges:</div>
        </div>
        <div className="text-right text-primary">
          <div className="no-underline">{formatSlTp(tp)}</div>
          <div className="mt-2 no-underline">0.00</div>
          <div className="mt-2 no-underline">{totalCharges.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );

  // 3. Deals Details
  const renderDealDetails = () => (
    <div className="mt-2">
      <div className="grid grid-cols-4 text-sm text-secondary gap-x-4 mb-2">
        {/* Left Column Group */}
        <div>
          <div>Deal:</div>
          <div className="mt-2">Order:</div>
          <div className="mt-2">Position:</div>
        </div>
        <div className="text-right text-primary">
          <div>{tid}</div>
          <div className="mt-2">O555666</div> {/* Dummy Order ID */}
          <div className="mt-2">P456789</div> {/* Dummy Position ID */}
        </div>
        {/* Right Column Group */}
        <div className="text-left">
          <div>Swap:</div>
          <div className="mt-2">Charges:</div>
          {/* <div className="mt-2">Time:</div> */}
        </div>
        <div className="text-right text-primary">
          <div>0.00</div>
          <div className="mt-2">{totalCharges.toFixed(2)}</div>
          {/* <div className="mt-2">{dateTimeString.split(" | ")[1]}</div> */}
        </div>
      </div>
    </div>
  );

  // Determine which detail content to render
  let detailContent: React.ReactNode;
  if (isHistoryPosition) {
    detailContent = renderHistoryPositionDetails();
  } else if (isDeal) {
    detailContent = renderDealDetails();
  } else if (isHistoryOrder) {
    detailContent = renderOrderDetails();
  } else {
    detailContent = (
      <div className="text-center text-secondary">
        No historical details available.
      </div>
    );
  }

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
            <div className="w-full flex justify-between items-center mb-3">
              {/* Trading Name and Prices/Status */}
              <div className={`flex w-full justify-between`}>
                <div className="flex items-center">
                  <div className="font-tertiary text-primary">
                    {resolvedInstrumentName}
                  </div>
                  {/* Price Transition or Simple Price (For History Items) */}
                  {isHistoryPosition && (
                    <div className="flex items-center gap-3">
                      <span className={`text-secondary pl-2 text-sm`}>
                        {formatPriceOrEmpty(topLeftPrice)} &gt;{" "}
                        {formatPriceOrEmpty(topRightPrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Time (Always shown for history tabs) */}
              <div className="text-sm text-primary whitespace-nowrap">
                {dateTimeString}
              </div>
            </div>

            <div className="flex justify-between items-center">
              {/* Buy/Sell with Qty/At/In Label */}
              <div className="text-sm text-secondary">{orderSideLabel}</div>
              {/* P&L or Status Label */}
              <div className="flex items-center gap-3">
                {isHistoryOrder ? (
                  <span className="text-sm text-secondary">Status</span>
                ) : !isDeal ? (
                  <span className="text-sm text-secondary">Profit & Loss</span>
                ) : (
                  ""
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-primary">
              {/* Quantity or Price Value */}
              <div>{qtyDisplayString}</div>
              {/* P&L or Status Value */}
              {isHistoryOrder ? (
                <div>{statusValue}</div>
              ) : !isDeal ? (
                <div className={pnlColorClass}>{pnl.toFixed(2)}</div>
              ) : (
                ""
              )}
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
              <div className="mt-4">
                {detailContent}

                {/* "Hide Details" button */}
                <div
                  className="flex justify-end items-center mt-4 cursor-pointer text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDetails();
                  }}
                >
                  Hide Details
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryCard;
