import { useRef, useMemo } from "react";
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
  const dateTimeString = new Date(rawTime * 1000)
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/(\d+)\/(\d+)\/(\d+),/, "$3.$1.$2 |");

  // Format the time string to show just the relevant part if needed
  // For the requested "below it will show the time", usually just HH:MM:SS or Date Time
  // User requested "show date and time both"
  const displayTime = dateTimeString.replace("|", "").trim();

  return (
    <div
      className="text-primary px-5 py-2.5 border-b border-primary cursor-pointer active:bg-secondaryBg transition-colors"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onLongPress}
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
                )?.toFixed(5) || data.price?.toFixed(5)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionCard;
