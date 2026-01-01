/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { Position, TOrder } from "../../store/slices/positionsSlice";
import type { Deal } from "../../store/slices/dealsSlice";
import type { HistoryOrder } from "../../store/slices/historyOrdersSlice";
import type { OpenOrder } from "../../store/slices/openOrdersSlice";
import rightArrow from "../../assets/icons/rightArrow.svg";
import rightArrowLight from "../../assets/icons/rightArrowLight.svg";
import cardIcon from "../../assets/icons/cardIcon.svg";

// NEW: Union type for the main data object
type DataObject = Position | OpenOrder;

/**
 * Minimal type shape for closed-history "position" objects returned in history.
 * Only includes fields used by this component.
 */
interface HistoryPosition {
  id: string;
  closed_pnl: number;
  created_at: number;
  updated_at: number;
  side: "buy" | "sell";
  price: number;
  qty: number;
  status: string;
  tid: string;
  instrument_id: string;
  trading_name?: string;
  instruments?: { contract_size?: number; trading_name?: string }[];
  trades: {
    type: "in" | "out";
    price: number;
    qty: number;
    charges?: { charge: number; name: string; type: string }[];
  }[];
  // NOTE: Redefined torders to match the expected structure if they were included
  // in the History Position fetch, matching PositionSlice's TOrder, but only
  // keeping the relevant fields for this logic.
  torders?: Pick<TOrder, "order_type" | "price" | "status">[];
}
interface PositionCardProps {
  label?: "Position" | "Orders" | "Deals" | "Trade" | "History" | string;
  position: DataObject;
  onClick: () => void;
  onLongPress?: () => void;
  isDeal?: boolean;
  dealData?: Deal | null;
  historyOrderData?: HistoryOrder | null;
  historyPositionData?: HistoryPosition | null;
  openOrderData?: OpenOrder | null;
  instrumentName?: string | null;
  hideBorder?: boolean;
}

const PositionCard = ({
  label,
  position,
  onClick,
  onLongPress,
  isDeal = false,
  dealData = null,
  historyOrderData = null,
  historyPositionData = null,
  openOrderData = null,
  instrumentName: instrumentNameProp = null,
  hideBorder = false,
}: PositionCardProps) => {
  const longPressTimer = useRef<number | null>(null);
  const instrumentsMap = useSelector((s: RootState) => s.instruments.data);
  const theme = useSelector((s: RootState) => s.theme.mode);

  // === FIX: Define isHistoryOrder to resolve TS2304 error ===
  const isHistoryOrder = !!historyOrderData;

  // NEW: Determine the primary data source
  const data =
    historyPositionData ||
    dealData ||
    historyOrderData ||
    openOrderData ||
    position;

  // Use openOrderData to determine if it's a live order
  const isLiveOrder = !!openOrderData;

  // Check if it's a history item (order/position/deal)
  const isHistoryItem = isHistoryOrder || !!historyPositionData || !!isDeal;

  // This flag determines if we are rendering a LIVE TRADING POSITION (not an open order, not history)
  const isLivePosition = !isHistoryItem && !isLiveOrder;

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

  const findInstrumentContractSize = useMemo(() => {
    return (id?: string | null) => {
      if (!id) return undefined;
      const found = instrumentById.get(id);
      if (found && (found as any).static_data?.contract_size != null) {
        // Check for static_data.contract_size first (from instrument slice data)
        const cs = Number((found as any).static_data.contract_size);
        return Number.isFinite(cs) && cs > 0 ? cs : undefined;
      }
      if (found && found.contract_size != null) {
        // Fallback to direct contract_size field (less common in full slice structure)
        const cs = Number(found.contract_size);
        return Number.isFinite(cs) && cs > 0 ? cs : undefined;
      }
      return undefined;
    };
  }, [instrumentById]);

  const handleTouchStart = () => {
    longPressTimer.current = window.setTimeout(() => {
      onLongPress?.();
      longPressTimer.current = null;
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (longPressTimer.current === null) {
      e.stopPropagation();
      onClick();
    }
  };

  // ----- PnL calculation -----
  let pnl = 0;
  if (historyPositionData) {
    pnl = historyPositionData.closed_pnl ?? 0;
  } else if (isDeal && dealData) {
    pnl = typeof dealData.closed_pnl === "number" ? dealData.closed_pnl : 0;
  } else if (isLiveOrder) {
    // Live orders don't display PnL
    pnl = 0;
  } else {
    // open/live position: use buy -> live_ask, sell -> live_bid
    const currentPrice =
      (position as Position)?.side === "buy"
        ? (position as Position)?.live_ask
        : (position as Position)?.live_bid;
    if (
      currentPrice !== undefined &&
      typeof (position as Position)?.price === "number"
    ) {
      if ((position as Position)?.side === "buy") {
        pnl =
          (currentPrice - (position as Position).price) *
          ((position as Position)?.qty ?? 0);
      } else if ((position as Position)?.side === "sell") {
        pnl =
          ((position as Position).price - currentPrice) *
          ((position as Position)?.qty ?? 0);
      }
    } else {
      pnl = 0;
    }
  }
  const pnlColorClass = pnl >= 0 ? "text-profit" : "text-loss";

  // ----- Timestamp formatting -----
  const timestamp =
    (historyPositionData && historyPositionData.updated_at) ||
    (isDeal && (dealData as any)?.time) ||
    (isLiveOrder && (openOrderData as OpenOrder)?.placed_time) ||
    (position as any)?.created_at ||
    Math.floor(Date.now() / 1000);

  const createdAtTimestamp = new Date(timestamp * 1000);
  const formattedDate = createdAtTimestamp
    .toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/-/g, ".");
  const formattedTime = createdAtTimestamp.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateTimeString = `${formattedDate} | ${formattedTime}`;

  // Live instrument price to show on right side for live positions/trades
  const instrumentLivePrice =
    (position as Position)?.side === "buy"
      ? (position as Position)?.live_ask
      : (position as Position)?.live_bid;

  // ⭐️⭐️⭐️ MAJOR FIX: Simplified and corrected instrument name resolution ⭐️⭐️⭐️
  const resolvedInstrumentName = useMemo(() => {
    // Priority 1: Use the explicit prop passed from the parent (History.tsx).
    if (instrumentNameProp) {
      return instrumentNameProp;
    }

    // Priority 2: Look up the name from the Redux store using the instrument_id.
    if (data && "instrument_id" in data && data.instrument_id) {
      const storeName = findInstrumentTradingName(data.instrument_id);
      if (storeName) {
        return storeName;
      }
    }

    // Final Fallback: If no name can be found through any method.
    return "Unknown Instrument";
  }, [instrumentNameProp, data, findInstrumentTradingName]);

  // ----- Resolve contract_size (Priority: OpenOrder/History > Deal > Store > fallback 1) -----
  const resolvedContractSize = useMemo(() => {
    // 1. Check live order contract_size (from openOrdersSlice mapping)
    if (isLiveOrder && openOrderData?.contract_size) {
      const cs = Number(openOrderData.contract_size);
      if (Number.isFinite(cs) && cs > 0) return cs;
    }

    // 2. Check history data (position/order)
    if (historyPositionData?.instruments?.[0]?.contract_size) {
      const cs = Number(historyPositionData.instruments[0].contract_size);
      if (Number.isFinite(cs) && cs > 0) return cs;
    }
    if (historyOrderData?.instruments?.[0]?.contract_size) {
      const cs = Number(historyOrderData.instruments[0].contract_size);
      if (Number.isFinite(cs) && cs > 0) return cs;
    }

    // 3. Check deal data
    if (
      Array.isArray(dealData?.instruments) &&
      dealData!.instruments.length > 0
    ) {
      const first = dealData!.instruments[0];
      if (
        typeof first === "object" &&
        first !== null &&
        (first as any).contract_size != null
      ) {
        const cs = Number((first as any).contract_size);
        if (Number.isFinite(cs) && cs > 0) return cs;
      }
    }

    // 4. Look up from Redux store using instrument_id
    const instrumentId =
      (openOrderData as OpenOrder)?.instrument_id ??
      (historyPositionData as HistoryPosition)?.instrument_id ??
      (position as Position)?.instrument_id ??
      (isDeal && dealData?.instrument_id) ??
      (isDeal &&
      dealData &&
      Array.isArray(dealData.instruments) &&
      typeof dealData.instruments[0] === "object"
        ? (dealData.instruments[0] as any).instrument_id
        : null);

    const fromStore = findInstrumentContractSize(instrumentId);
    if (fromStore && Number.isFinite(fromStore) && fromStore > 0)
      return fromStore;

    // 5. Final fallback
    return 1;
  }, [
    dealData,
    position,
    findInstrumentContractSize,
    historyOrderData,
    historyPositionData,
    openOrderData,
    isLiveOrder,
    isDeal,
  ]);

  // ----- Display quantity (qty / contract_size) -----
  const displayQty = useMemo(() => {
    if (isLiveOrder && openOrderData) {
      const qty = openOrderData.placed_qty ?? 0;
      return qty / (resolvedContractSize || 1);
    }

    if (historyPositionData) {
      const qty =
        typeof historyPositionData.qty === "number"
          ? historyPositionData.qty
          : 0;
      return qty / (resolvedContractSize || 1);
    }

    if (isDeal && dealData) {
      const qty =
        typeof (dealData as any).qty === "number"
          ? (dealData as any).qty
          : Number((position as Position)?.qty ?? 0);
      return qty / (resolvedContractSize || 1);
    }

    const qty =
      typeof (position as Position)?.qty === "number"
        ? (position as Position).qty
        : Number((position as Position)?.qty ?? 0);
    return qty / (resolvedContractSize || 1);
  }, [
    position,
    isDeal,
    dealData,
    resolvedContractSize,
    historyPositionData,
    openOrderData,
    isLiveOrder,
  ]);

  // ----- orderSideLabel (used in JSX) -----
  const capitalize = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  const orderSideLabel = useMemo(() => {
    const side = data?.side ? capitalize(data.side) : "";

    if (label === "Orders" || isLiveOrder || isHistoryOrder) {
      const orderType = (historyOrderData || openOrderData)?.order_type
        ? capitalize((historyOrderData || openOrderData)!.order_type)
        : "";

      if ((historyOrderData || openOrderData)?.order_type === "market") {
        return `${side}:`;
      }
      return `${side} ${orderType}:`;
    }

    if (label === "Position" && historyPositionData) return `${side} Qty:`;
    if (label === "Position") return `${side} Qty:`;
    if (label === "History") return `${side} Qty:`;
    if (label === "Deals") return `${side} In`;
    return `${side} at:`;
  }, [
    label,
    historyOrderData,
    openOrderData,
    data?.side,
    historyPositionData,
    isLiveOrder,
    isHistoryOrder,
  ]);

  // ----- Generate the main qty/price display string -----
  const qtyDisplayString = useMemo(() => {
    if (isLiveOrder && openOrderData) {
      if (openOrderData.order_type === "market") {
        return `${displayQty.toFixed(2)} at market`;
      }
      return `${displayQty.toFixed(2)} @ ${Number(
        openOrderData.price ?? 0
      ).toFixed(5)}`;
    }

    if (label === "Orders" && historyOrderData) {
      const qty =
        (historyOrderData.filled_qty ?? 0) / (resolvedContractSize || 1);
      if ((historyOrderData as any).order_type === "market") {
        return `${qty.toFixed(2)} at market`;
      }
      return `${qty.toFixed(2)} @ ${Number(historyOrderData.price ?? 0).toFixed(
        5
      )}`;
    }
    if (label === "Position") {
      if (historyPositionData) {
        const inTrade = historyPositionData.trades.find((t) => t.type === "in");
        const entryPrice = inTrade?.price ?? historyPositionData.price ?? 0;
        return `${displayQty.toFixed(2)} @ ${Number(entryPrice).toFixed(5)}`;
      }
      return `${displayQty.toFixed(2)}`;
    }
    if (label === "Deals") {
      const price =
        typeof (position as any)?.price === "number"
          ? (position as any).price.toFixed(5)
          : dealData && (dealData as any).price
          ? Number((dealData as any).price).toFixed(5)
          : "0.00000";
      return `${displayQty.toFixed(2)} @ ${price}`;
    }
    return `${displayQty.toFixed(2)}`;
  }, [
    label,
    historyOrderData,
    historyPositionData,
    openOrderData,
    isLiveOrder,
    displayQty,
    position,
    dealData,
    resolvedContractSize,
  ]);

  // ----- Price display logic for top row (Left Price) -----
  const topLeftPrice = useMemo(() => {
    if (isLiveOrder && openOrderData) {
      return openOrderData.price;
    }
    if (historyPositionData) {
      const inTrade = historyPositionData.trades.find((t) => t.type === "in");
      return (
        inTrade?.price ??
        historyPositionData.price ??
        (typeof (position as Position)?.price === "number"
          ? (position as Position).price
          : 0)
      );
    }
    return typeof (position as Position)?.price === "number"
      ? (position as Position).price
      : 0;
  }, [historyPositionData, position, isLiveOrder, openOrderData]);

  const topRightPrice: number | null = useMemo(() => {
    if (historyPositionData) {
      const outTrade = historyPositionData.trades.find((t) => t.type === "out");
      if (outTrade && typeof outTrade.price === "number") return outTrade.price;
      return null;
    }
    if (isLiveOrder) return null;

    return instrumentLivePrice !== undefined ? instrumentLivePrice : null;
  }, [historyPositionData, instrumentLivePrice, isLiveOrder]);

  const formatPriceOrEmpty = (p: number | null | undefined) =>
    p == null ? "" : Number(p).toFixed(5);

  const renderMarketView = () => {
    return (
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2.5">
          <img src={cardIcon} alt="cardIcon" />
          <div>
            <h2 className="my-1 font-secondary text uppercase">
              {resolvedInstrumentName}
            </h2>
            <div className="text-primary">
              {orderSideLabel.replace(" Qty:", "")} {displayQty.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className={`font-secondary ${pnlColorClass}`}>
            {pnl >= 0 ? "+" : "-"}
            {Math.abs(pnl).toFixed(2)}
          </div>
          <div className="text-primary mt-1 uppercase">{dateTimeString}</div>
        </div>
      </div>
    );
  };

  const renderPendingView = () => {
    // Determine if we should show SL or TP badge based on order type and position_id
    const hasPositionId = openOrderData?.position_id;
    const orderType = openOrderData?.order_type?.toLowerCase();
    const showSL = hasPositionId && orderType === "limit";
    const showTP = hasPositionId && orderType === "stop";

    return (
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="my-1 font-tertiary uppercase text-primary">
                {resolvedInstrumentName}
              </h2>
              {showTP && (
                <span className="w-[18px] h-[18px] bg-tertiary text-sm text-secondary flex justify-center items-center rounded-[4px]">
                  TP
                </span>
              )}
              {showSL && (
                <span className="w-[18px] h-[18px] bg-tertiary text-sm text-secondary flex justify-center items-center rounded-[4px]">
                  SL
                </span>
              )}
            </div>
            <div className="text-primary capitalize">
              {orderSideLabel.replace(":", "")} {displayQty.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2.5 text-secondary">
            {topLeftPrice.toFixed(5)}
            <img
              src={theme === "dark" ? rightArrow : rightArrowLight}
              alt="rightArrow"
            />
            <span className="font-tertiary text-primary">
              {(openOrderData?.price ?? 0).toFixed(5)}
            </span>
          </div>
          <div className="text-primary mt-1 uppercase">{dateTimeString}</div>
        </div>
      </div>
    );
  };

  const renderHistoryView = () => {
    return (
      <div className="w-full">
        <div className="font-secondary text-quaternary mb-1">
          {formattedDate}
        </div>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="mt-2.5 mb-2 font-tertiary uppercase text-primary">
                {resolvedInstrumentName}
              </h2>
              <div className="text-primary">
                {orderSideLabel.replace(" Qty:", "")} {displayQty.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className={`font-secondary ${pnlColorClass}`}>
              {pnl >= 0 ? "+" : "-"}
              {Math.abs(pnl).toFixed(2)}
            </div>
            <div className="text-primary mt-1 uppercase">{dateTimeString}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultView = () => {
    return (
      <div className="w-full">
        <div className="w-full flex justify-between items-center mb-3">
          <div
            className={`flex ${isLivePosition ? "w-full justify-between" : ""}`}
          >
            <div className="font-tertiary text-primary uppercase">
              {resolvedInstrumentName}
            </div>
            {(isLivePosition || historyPositionData || label === "Trade") && (
              <div className="flex items-center gap-3">
                <span className="text-secondary pl-2 text-sm">
                  {formatPriceOrEmpty(topLeftPrice)} &gt;{" "}
                  {topRightPrice == null
                    ? " "
                    : formatPriceOrEmpty(topRightPrice)}
                </span>
              </div>
            )}
          </div>
          {!isLivePosition && (
            <div className="text-sm text-primary">{dateTimeString}</div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-secondary">{orderSideLabel}</div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary">Profit & Loss</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-primary">
          <div className="font-secondary">{qtyDisplayString}</div>
          <div className={`font-secondary ${pnlColorClass}`}>
            {pnl.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="select-none no-select">
      <div
        className={`text-primary px-5 py-2.5 cursor-pointer ${
          !hideBorder ? "border-b border-primary" : ""
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {label === "Position" && renderMarketView()}
        {label === "Orders" && renderPendingView()}
        {label === "History" && renderHistoryView()}
        {label !== "Position" &&
          label !== "Orders" &&
          label !== "History" &&
          renderDefaultView()}
      </div>
    </div>
  );
};
export default PositionCard;
