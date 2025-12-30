import { useRef, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import cardIcon from "../../assets/icons/cardIcon.svg";
import { useAppSelector } from "../../store/hook";
import type { RootState } from "../../store/store";
import type { Position, TOrder } from "../../store/slices/positionsSlice";
import type { OpenOrder } from "../../store/slices/openOrdersSlice";
import type { Deal } from "../../store/slices/dealsSlice";
import type { HistoryOrder } from "../../store/slices/historyOrdersSlice";

// Minimal type shape for closed-history "position" objects
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
  torders?: Pick<TOrder, "order_type" | "price" | "status">[];
}

interface PositionCardProps {
  label?: "Position" | "Orders" | "Deals" | "Trade" | string;
  position: Position | OpenOrder | any; // Support various data sources
  onLongPress: () => void;
  isDeal?: boolean;
  dealData?: Deal | null;
  historyOrderData?: HistoryOrder | null;
  historyPositionData?: HistoryPosition | null;
  openOrderData?: OpenOrder | null;
  instrumentName?: string | null;
}

const PositionCard = ({
  position,
  onLongPress,
  isDeal = false,
  dealData = null,
  historyOrderData = null,
  historyPositionData = null,
  openOrderData = null,
  instrumentName: instrumentNameProp = null,
}: PositionCardProps) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const instrumentsMap = useSelector((s: RootState) => s.instruments.data);
  const liveQuotes = useAppSelector((state) => state.quotes.liveQuotes);

  const isHistoryOrder = !!historyOrderData;
  const data =
    historyPositionData ||
    dealData ||
    historyOrderData ||
    openOrderData ||
    position;
  const isLiveOrder = !!openOrderData;

  // Determine if this is a history item (closed position, deal, or history order)
  // The User specifically asked for this behavior "in history".
  // "Trade" page items (Live Positions/Open Orders) use specific edit navigation, so we might NOT want header click to expand there,
  // OR we might want to allow it if they desire.
  // For now, let's assume "History" tab items should expand.
  // We can infer this context if isDeal, historyPositionData, or historyOrderData is present.
  const isHistoryItem = isDeal || !!historyPositionData || !!historyOrderData;

  // Build instrument map for fast lookup
  const instrumentById = useMemo(() => {
    const map = new Map<string, any>();
    for (const key of Object.keys(instrumentsMap)) {
      const arr = (instrumentsMap as any)[key];
      if (Array.isArray(arr)) {
        for (const ins of arr) {
          if (ins && typeof ins.id === "string") {
            map.set(ins.id, ins);
          }
        }
      }
    }
    return map;
  }, [instrumentsMap]);

  const findInstrumentTradingName = (id?: string | null) => {
    if (!id) return null;
    return instrumentById.get(id)?.trading_name ?? null;
  };

  const findInstrumentContractSize = (id?: string | null) => {
    if (!id) return 1;
    const found = instrumentById.get(id);
    return found?.static_data?.contract_size || found?.contract_size || 1;
  };

  const toggleDetails = () => {
    setIsDetailsVisible((prev) => !prev);
  };

  const handleTouchStart = () => {
    longPressTimer.current = window.setTimeout(() => {
      onLongPress();
      longPressTimer.current = null; // Clear timer preventing click
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    // If it's a history item, toggle details.
    if (isHistoryItem) {
      toggleDetails();
    } else {
      // If it's a live item (Trade page), preserve the direct navigation behavior
      // established in the previous turn (Click -> Edit).
      // Unless the user wants expansion there too?
      // "in history the card was epandable... but right now its onw expanding"
      // Implies specific concern for History.
      onLongPress();
    }
  };

  // P&L calculation
  let pnl = 0;
  if (historyPositionData) {
    pnl = historyPositionData.closed_pnl ?? 0;
  } else if (isDeal && dealData) {
    pnl = typeof dealData.closed_pnl === "number" ? dealData.closed_pnl : 0;
  } else if (!isLiveOrder) {
    const quote = liveQuotes[data.instrument_id];
    const currentPrice = data.side === "buy" ? quote?.bid : quote?.ask;
    if (currentPrice && data.price && data.qty) {
      if (data.side === "buy") {
        pnl = (currentPrice - data.price) * data.qty;
      } else {
        pnl = (data.price - currentPrice) * data.qty;
      }
    }
  }

  const pnlColorClass = pnl >= 0 ? "text-profit" : "text-loss";
  const pnlSign = pnl >= 0 ? "+" : "";

  // Instrument Name
  const resolvedInstrumentName = useMemo(() => {
    if (instrumentNameProp) return instrumentNameProp;
    if (data.trading_name && data.trading_name !== "N/A")
      return data.trading_name;
    return (
      findInstrumentTradingName(data.instrument_id) || "Unknown Instrument"
    );
  }, [instrumentNameProp, data, findInstrumentTradingName]);

  // Contract Size
  const resolvedContractSize = useMemo(() => {
    if (isLiveOrder && openOrderData?.contract_size)
      return openOrderData.contract_size;
    return findInstrumentContractSize(data.instrument_id) || 1;
  }, [data.instrument_id, openOrderData]);

  // Quantity
  const displayQty =
    (data.qty || data.placed_qty || 0) / (resolvedContractSize || 1);

  // Side Label
  const side = data.side
    ? data.side.charAt(0).toUpperCase() + data.side.slice(1)
    : "";

  // Timestamp
  const rawTime =
    historyPositionData?.updated_at ||
    (dealData as any)?.time ||
    openOrderData?.placed_time ||
    position?.created_at ||
    Date.now() / 1000;

  const dateObj = new Date(rawTime * 1000);
  const displayDate = dateObj
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");
  const displayClock = dateObj.toLocaleTimeString("en-US", { hour12: false });
  const displayTime = `${displayDate} | ${displayClock}`;

  const formatPrice = (p: number | undefined) =>
    p !== undefined ? p.toFixed(5) : "0.00000";

  // SL/TP formatting helpers
  const getSlTp = () => {
    if (historyPositionData?.torders) {
      // Similar logc to Old App for HistoryPosition torders
      // But typically provided in torders array
      // Placeholder if not populated
      return { sl: "-", tp: "-" };
    }
    // Metadata fallback
    if (data.metadata?.legs) {
      return {
        sl: formatPrice(data.metadata.legs.stoploss) || "-",
        tp: formatPrice(data.metadata.legs.target) || "-",
      };
    }
    return { sl: "-", tp: "-" };
  };
  const { sl, tp } = getSlTp();

  // Total Charges helper (Old App logic simulation for display)
  const totalCharges = useMemo(() => {
    // Logic handled in parent History.tsx usually, but for card details:
    // If we have historyPositionData, we can sum trades charges
    if (historyPositionData?.trades) {
      return historyPositionData.trades
        .reduce((sum, t) => {
          const ch = t.charges || [];
          return sum + ch.reduce((s, c) => s + (c.charge || 0), 0);
        }, 0)
        .toFixed(2);
    }
    if (dealData?.charges) {
      // @ts-ignore
      return dealData.charges
        .reduce((s, c) => s + (c.charge || 0), 0)
        .toFixed(2);
    }
    return "0.00";
  }, [historyPositionData, dealData]);

  return (
    <div
      className={`text-primary px-5 py-2.5 border-b border-primary cursor-pointer transition-colors active:bg-secondaryBg ${
        isDetailsVisible ? "bg-secondaryBg" : ""
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress();
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <img src={cardIcon} alt="card" />
          <div>
            <h2 className="font-tertiary text-base uppercase">
              {resolvedInstrumentName}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`text-sm ${
                  side === "Buy" ? "text-profit" : "text-loss"
                }`}
              >
                {side.toUpperCase()}
              </span>
              <span className="text-secondary text-sm">
                {displayQty.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          {isLiveOrder || isHistoryOrder ? (
            <>
              <div className="font-tertiary text-base uppercase text-secondary">
                {data.status || "Pending"}
              </div>
              <div className="text-secondary text-[10px] mt-1">
                {displayTime}
              </div>
            </>
          ) : (
            <>
              <div className={`font-tertiary text-lg ${pnlColorClass}`}>
                {pnlSign}
                {pnl.toFixed(2)}
              </div>
              <div className="text-secondary text-[10px] mt-1">
                LTP:{" "}
                {(data.side === "buy"
                  ? liveQuotes[data.instrument_id]?.bid
                  : liveQuotes[data.instrument_id]?.ask
                )?.toFixed(5) || formatPrice(data.price)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Collapsible Details Section - ONLY for History Items */}
      <div
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
          isDetailsVisible
            ? "grid-rows-[1fr] opacity-100 mt-4"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {/* History Position Details */}
          {historyPositionData && (
            <div className="grid grid-cols-4 text-xs text-secondary gap-y-2">
              <div>S/L:</div>
              <div className="text-right text-primary">{sl}</div>
              <div className="pl-4">T/P:</div>
              <div className="text-right text-primary">{tp}</div>

              <div>Open:</div>
              <div className="text-right text-primary col-span-3">
                {new Date(
                  historyPositionData.created_at * 1000
                ).toLocaleString()}
              </div>

              <div>Swap:</div>
              <div className="text-right text-primary">0.00</div>
              <div className="pl-4">Charges:</div>
              <div className="text-right text-primary">{totalCharges}</div>

              <div>Id:</div>
              <div className="text-right text-primary">
                #{historyPositionData.tid || historyPositionData.id}
              </div>
            </div>
          )}

          {/* Deal Details */}
          {isDeal && dealData && (
            <div className="grid grid-cols-4 text-xs text-secondary gap-y-2">
              <div>Deal:</div>
              <div className="text-right text-primary">
                #{dealData.tid || dealData.id}
              </div>
              <div className="pl-4">Order:</div>
              <div className="text-right text-primary">
                {(dealData as any).order_id || "-"}
              </div>

              <div>Pos ID:</div>
              <div className="text-right text-primary col-span-3">
                {dealData.position_id || "-"}
              </div>

              <div>Charges:</div>
              <div className="text-right text-primary">{totalCharges}</div>
              <div className="pl-4">Price:</div>
              <div className="text-right text-primary">
                {formatPrice(dealData.price)}
              </div>
            </div>
          )}

          {/* History Order Details */}
          {historyOrderData && (
            <div className="grid grid-cols-4 text-xs text-secondary gap-y-2">
              <div>S/L:</div>
              <div className="text-right text-primary">{sl}</div>
              <div className="pl-4">T/P:</div>
              <div className="text-right text-primary">{tp}</div>

              <div>Time:</div>
              <div className="text-right text-primary col-span-3">
                {new Date(
                  (historyOrderData.placed_time || 0) * 1000
                ).toLocaleString()}
              </div>

              <div>Id:</div>
              <div className="text-right text-primary">
                #{historyOrderData.tid || historyOrderData.id}
              </div>
            </div>
          )}

          <div
            className="flex justify-end items-center mt-3 cursor-pointer text-xs text-primary underline"
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
  );
};

export default PositionCard;
