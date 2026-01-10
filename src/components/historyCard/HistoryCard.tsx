import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { Deal } from "../../store/slices/dealsSlice";
import type { HistoryOrder } from "../../store/slices/historyOrdersSlice";
import type { HistoryPosition } from "../../store/slices/historyPositionsSlice";

interface HistoryCardProps {
  label: "Position" | "Orders" | "Deals" | string;
  index?: number;
  onCardClick?: () => void;
  isTutorialTarget?: boolean;
  historyPositionData?: HistoryPosition | null;
  historyOrderData?: HistoryOrder | null;
  dealData?: Deal | null;
  instrumentName?: string;
  defaultExpanded?: boolean;
}

const HistoryCard = ({
  index,
  onCardClick,
  historyPositionData,
  historyOrderData,
  dealData,
  instrumentName,
  defaultExpanded = false,
}: HistoryCardProps) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(defaultExpanded);
  const instrumentsMap = useSelector((s: RootState) => s.instruments.data);

  // console.log("instrumentsMap", instrumentsMap, instrumentName);
  // Determine type
  const isHistoryPosition = !!historyPositionData;
  const isHistoryOrder = !!historyOrderData;
  const isDeal = !!dealData;

  // Consolidate data source
  const data =
    historyPositionData || historyOrderData || dealData || ({} as any);

  // Build id -> instrument object map from instruments store
  const instrumentById = useMemo(() => {
    const map = new Map<string, any>();
    // Iterate over categories (keys) in instrumentsMap
    for (const key of Object.keys(instrumentsMap)) {
      const arr = (instrumentsMap as any)[key];
      if (Array.isArray(arr)) {
        // Iterate over instruments in each category array
        for (const ins of arr) {
          if (ins && typeof ins.id === "string") {
            map.set(ins.id, ins);
          }
        }
      }
    }
    return map;
  }, [instrumentsMap]);

  const findInstrumentTradingName = useMemo(() => {
    return (id?: string | null) => {
      if (!id) return null;
      const found = instrumentById.get(id);
      return found?.trading_name ?? null;
    };
  }, [instrumentById]);

  const toggleDetails = () => {
    setIsDetailsVisible((s) => !s);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleDetails();
    if (onCardClick) {
      onCardClick();
    }
  };

  // --- Dynamic Data Logic ---

  // Instrument Name Logic (Ported from PositionCard/Old App)
  const resolvedInstrumentName = useMemo(() => {
    // Priority 1: Use the explicit prop passed from the parent.
    if (instrumentName) {
      return instrumentName;
    }

    // Priority 2: Check for a trading_name directly on the primary data object.
    if (data && "trading_name" in data && data.trading_name) {
      return data.trading_name;
    }

    // Priority 3: Look up the name from the Redux store using the instrument_id.
    if (data && "instrument_id" in data && data.instrument_id) {
      // Ensure ID is string for lookup
      const idStr = String(data.instrument_id);
      const storeName = findInstrumentTradingName(idStr);
      // console.log("HistoryCard Lookup:", { id: data.instrument_id, idStr, storeName });
      if (storeName) {
        return storeName;
      }
    }

    // Final Fallback
    return "Unknown Instrument";
  }, [instrumentName, data, findInstrumentTradingName]);

  // console.log("resolvedInstrumentName", resolvedInstrumentName);
  // Side
  const side = data.side ? data.side.toLowerCase() : "buy";

  // PnL & Status
  let pnl: number = 0;
  let statusValue: string = "N/A";

  if (isHistoryPosition) {
    pnl = historyPositionData?.closed_pnl ?? 0;
    statusValue = "CLOSED";
  } else if (isDeal) {
    pnl = dealData?.closed_pnl ?? 0;
    statusValue = "DEAL";
  } else if (isHistoryOrder) {
    pnl = 0;
    statusValue = (historyOrderData?.status || "FILLED").toUpperCase();
  }

  // Row 2 Labels & Values
  let orderSideLabel: string = "";
  let qtyDisplayString: string = "N/A";

  // Data helpers
  const formatPrice = (p: number | undefined | null) =>
    p != null ? Number(p).toFixed(5) : "0.00000";

  // For HistoryPosition: "BUY Qty: 0.01"
  // For HistoryOrder: "BUY Limit: 0.01 @ 1.23456"
  // For Deal: "BUY Out: 0.01 @ 1.23456"

  if (isHistoryPosition) {
    orderSideLabel = `${side.toUpperCase()} Qty:`;
    const contractSize =
      historyPositionData?.instruments?.[0]?.contract_size || 1;
    const inTrade = historyPositionData?.trades?.find(
      (t: any) => t.type === "in"
    );
    // Use inTrade qty if available (which is usually the open qty)
    const rawQty = inTrade?.qty ?? historyPositionData?.qty ?? 0;
    const qty = rawQty / contractSize;

    qtyDisplayString = qty.toFixed(2);
  } else if (isHistoryOrder) {
    orderSideLabel = `${side.toUpperCase()} Qty:`;
    const contractSize = historyOrderData?.instruments?.[0]?.contract_size || 1;
    const qty =
      (historyOrderData?.filled_qty || historyOrderData?.placed_qty || 0) /
      contractSize;
    qtyDisplayString = qty.toFixed(2);
  } else if (isDeal) {
    orderSideLabel = `${side.toUpperCase()} ${
      dealData?.type === "out" ? "Out" : "In"
    }:`;
    const qty = dealData?.qty ?? 0;
    qtyDisplayString = `${qty.toFixed(2)} @ ${formatPrice(dealData?.price)}`;
  }

  // Time String
  const rawTime =
    historyPositionData?.created_at || // Close time? updated_at is close time usually
    historyPositionData?.updated_at ||
    dealData?.time ||
    historyOrderData?.placed_time ||
    0;

  const dateObj = new Date(rawTime * 1000);
  // Format: YYYY.MM.DD | HH:MM:SS
  const datePart = dateObj
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");
  const timePart = dateObj.toLocaleTimeString("en-US", { hour12: false });
  const dateTimeString = `${datePart} | ${timePart}`;

  // Formatting helpers
  const pnlColorClass =
    pnl > 0 ? "text-profit" : pnl < 0 ? "text-loss" : "text-secondary";

  // Prices (For history position arrow display)
  // Entry Price -> Close Price ??
  // HistoryPosition has 'price' (open) and we can maybe find close price?
  // HistoryPosition typically has 'price' (entry). Close price isn't always explicit field in concise types,
  // but let's  check. If unavailable, hide arrow or use current.
  // Actually, closed history positions usually have open price and close price.
  // The interface has 'price' (entry). Close price might be inferred or missing.
  // Let's use 'price' as left. Right can be computed if we have close info or hiding it.
  // The 'HistoryPosition' type shows 'price'. Let's assume Entry.
  // For Close price, it's often not in the basic view unless we have 'close_price'.
  // If not available, we can hide the arrow part or show Entry only.
  // Users OLD APP layout showed arrow. Logic: Entry > Exit.

  // Let's use existing fields. If we don't have exit price, maybe just show Entry.
  const topLeftPrice = data.price;
  let topRightPrice: number | null = null;

  if (isHistoryPosition) {
    const outTrade = historyPositionData?.trades?.find(
      (t: any) => t.type === "out"
    );
    if (outTrade && typeof outTrade.price === "number") {
      topRightPrice = outTrade.price;
    }
  }

  // Charges

  // Charges
  // Helper to sum charges
  const totalCharges = useMemo(() => {
    if (historyPositionData?.trades) {
      return historyPositionData.trades.reduce((sum, t) => {
        const ch = t.charges || [];
        return sum + ch.reduce((s, c) => s + (c.charge || 0), 0);
      }, 0);
    }
    if (dealData?.charges) {
      // @ts-ignore
      return dealData.charges.reduce((s, c) => s + (c.charge || 0), 0);
    }
    return 0;
  }, [historyPositionData, dealData]);

  const sl = (data as any).sl || data.metadata?.legs?.stoploss || 0;
  const tp = (data as any).tp || data.metadata?.legs?.target || 0;
  const tid = data.tid || data.id || "";

  const formatSlTp = (v: number | string | null | undefined) =>
    v == null || v === 0 || v === "-" || v === "0" ? "-" : Number(v).toFixed(5);

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
          <div className="mt-[26px] ml-[-25px]">#{tid}</div>
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
          <div className="mt-2 no-underline ml-[-12px]">#{tid}</div>
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
          <div className="ml-[-15px]">{tid}</div>
          <div className="mt-2 ml-[-15px]">
            {(dealData as any).orders[0] || "-"}
          </div>
          <div className="mt-2 ml-[-15px]">{dealData?.tid || "-"}</div>
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
            isDetailsVisible ? "bg-cardBg" : "bg-primaryBg"
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
                  {/* Only show if we explicitly have prices to show comparison, else maybe hide or show single price? */}
                  {isHistoryPosition && topRightPrice && (
                    <div className="flex items-center gap-3">
                      <span className={`text-secondary pl-2 text-sm`}>
                        {formatPrice(topLeftPrice)} &gt;{" "}
                        {formatPrice(topRightPrice)}
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
                ) : !isHistoryOrder ? (
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
              ) : !isHistoryOrder ? (
                <div className={`${pnlColorClass} font-secondary`}>
                  {pnl.toFixed(2)}
                </div>
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
