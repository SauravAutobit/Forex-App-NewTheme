import Counter from "../../components/counter/Counter";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import CheckList from "../../components/checkList/CheckList";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useSearchParams, useOutletContext } from "react-router-dom";
import type { OutletContextType } from "../../layout/MainLayout";
import OrderButtons from "../../components/orderButtons/OrderButtons";
import { setOrderStatus } from "../../store/slices/orderStatusSlice";
import { useAppDispatch } from "../../store/hook";
import { subscribeToInstruments } from "../../services/socketService";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const NewOrder = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { setIsFlag } = useOutletContext<OutletContextType>();

  useEffect(() => {
    setIsFlag((prev) => ({ ...prev, newOrder: { status: true } }));
    return () => {
      setIsFlag((prev) => ({ ...prev, newOrder: { status: false } }));
    };
  }, [setIsFlag]);

  useEffect(() => {
    // Reset status on mount
    dispatch(setOrderStatus({ status: "idle", message: "" }));
    return () => {
      dispatch(setOrderStatus({ status: "idle", message: "" }));
    };
  }, [dispatch]);

  const mode =
    (searchParams.get("mode") as
      | "newOrder"
      | "closePosition"
      | "modifyPosition") || "newOrder";
  const positionId = searchParams.get("positionId") || undefined;

  const selectedInstrumentId = useSelector(
    (state: RootState) => state.instruments.selectedInstrumentId
  );
  const instrumentsData = useSelector(
    (state: RootState) => state.instruments.data
  );
  const positions = useSelector(
    (state: RootState) => state.positions.positions
  );
  const quotes = useSelector((state: RootState) => state.quotes.quotes);
  const liveQuotes = useSelector((state: RootState) => state.quotes.liveQuotes);

  const selectedPosition = useMemo(
    () => positions.find((p) => p.id === positionId),
    [positions, positionId]
  );

  const instrumentId =
    mode === "closePosition"
      ? selectedPosition?.instrument_id
      : selectedInstrumentId;

  // ROBUST SELECTOR: Check both watchlist and liveQuotes with string normalization
  const selectedQuote = useMemo(() => {
    if (!instrumentId) return null;
    const instrumentIdStr = String(instrumentId).trim().toLowerCase();

    // 1. Check Watchlist
    const quote = quotes.find(
      (q) => String(q.id).trim().toLowerCase() === instrumentIdStr
    );
    if (quote) return quote;

    // 2. Check LiveQuotes (Direct Key)
    if (liveQuotes[instrumentIdStr]) return liveQuotes[instrumentIdStr];

    // 3. Check LiveQuotes (Case-Insensitive Keys)
    const keys = Object.keys(liveQuotes);
    const matchKey = keys.find(
      (k) => k.trim().toLowerCase() === instrumentIdStr
    );
    if (matchKey) return liveQuotes[matchKey];

    return null;
  }, [quotes, liveQuotes, instrumentId]);

  // ROBUST INSTRUMENT FINDER
  const foundInstrument = useMemo(() => {
    if (!instrumentId) return null;
    const instrumentIdStr = String(instrumentId).trim().toLowerCase();

    for (const category in instrumentsData) {
      const found = instrumentsData[category].find(
        (inst) => String(inst.id).trim().toLowerCase() === instrumentIdStr
      );
      if (found) return found;
    }
    return null;
  }, [instrumentsData, instrumentId]);

  // Explicit Subscription
  useEffect(() => {
    if (instrumentId) {
      // console.log(`[NewOrder] Subscribing to: ${instrumentId}`);
      subscribeToInstruments([instrumentId]);
    }
  }, [instrumentId]);

  const [activeTabId, setActiveTabId] = useState<"market" | "limit" | "stop">(
    "market"
  );
  const [selectedLot, setSelectedLot] = useState(1);
  const [price, setPrice] = useState<number | null>(null);
  const [stoploss, setStoploss] = useState(0);
  const [target, setTarget] = useState(0);
  const [priceStep, setPriceStep] = useState(0.01);

  // Initialize price for limit/stop orders
  useEffect(() => {
    if (price === null && selectedQuote) {
      setPrice(selectedQuote.ask);
    }
  }, [selectedQuote, price]);

  // Determine ticksize/pip step
  useEffect(() => {
    if (foundInstrument) {
      let step = 0.01;
      const staticData = foundInstrument.static_data;
      if (staticData?.ticksize) {
        step = Number(staticData.ticksize);
      } else if (staticData?.tick_size) {
        step = Number(staticData.tick_size);
      } else if (staticData?.pip) {
        step = Number(staticData.pip);
      }
      setPriceStep(step);
    }
  }, [foundInstrument]);

  // Initialize values from selected position (Close/Modify mode)
  useEffect(() => {
    if (selectedPosition) {
      const contractSize =
        Number(foundInstrument?.static_data?.contractsize) ||
        Number(foundInstrument?.static_data?.contract_size) ||
        1;
      setSelectedLot(selectedPosition.qty / contractSize);

      const slOrder = selectedPosition.torders.find(
        (o) => o.order_type === "stop"
      );
      const tpOrder = selectedPosition.torders.find(
        (o) => o.order_type === "limit"
      );

      setStoploss(slOrder?.metadata?.legs?.stoploss || 0);
      setTarget(tpOrder?.metadata?.legs?.target || 0);
    }
  }, [selectedPosition, foundInstrument]);

  const editOptions = [
    { label: "Trailing stop", key: "trailingStop" },
    { label: "Break even", key: "breakEven" },
    { label: "Order expiration", key: "orderExpiration" },
  ];

  const [activeOptions, setActiveOptions] = useState<Record<string, boolean>>(
    () => editOptions.reduce((acc, curr) => ({ ...acc, [curr.key]: false }), {})
  );

  const getContractSize = () => {
    return (
      Number(foundInstrument?.static_data?.contractsize) ||
      Number(foundInstrument?.static_data?.contract_size) ||
      1
    );
  };

  const renderContent = (type: "market" | "limit" | "stop") => {
    const contractSize = getContractSize();

    return (
      <div className="px-5 h-[calc(100vh-179px)] overflow-y-auto">
        <div className="mt-5 flex flex-col gap-2.5 justify-between h-full">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1">
              <Counter
                label="Vol"
                initialValue={selectedLot * contractSize}
                min={1 * contractSize}
                step={1 * contractSize}
                onValueChange={(val) => setSelectedLot(val / contractSize)}
              />
              <span className="text-secondary mt-7">or</span>
              <Counter
                label="Lot"
                initialValue={selectedLot}
                min={1}
                step={1}
                onValueChange={(val) => setSelectedLot(val)}
              />
            </div>

            {type !== "market" && (
              <Counter
                label="Price"
                initialValue={price || 0}
                step={priceStep}
                onValueChange={setPrice}
              />
            )}

            <Counter
              label="Take Profit"
              initialValue={target}
              step={priceStep}
              onValueChange={setTarget}
            />
            <Counter
              label="Stop Loss"
              initialValue={stoploss}
              step={priceStep}
              onValueChange={setStoploss}
            />

            <CheckList
              activeOptions={activeOptions}
              setActiveOptions={setActiveOptions}
              options={editOptions}
            />
          </div>
          <div className="mb-9">
            <div className="flex items-center justify-between text-secondary text-sm">
              Required margin/Free margin
              <span>
                1216.36 /<span className="text-loss">0.00</span>
              </span>
            </div>
            <OrderButtons
              instrumentId={instrumentId || null}
              selectedOrderType={type}
              contractSize={contractSize}
              selectedLot={selectedLot}
              orderPrice={price}
              stoploss={stoploss}
              target={target}
              mode={mode}
              originalSide={selectedPosition?.side as any}
              positionIdToClose={positionId}
            />
          </div>
        </div>
      </div>
    );
  };

  const tabsData: TabItem[] = [
    { id: "market", label: "Market order", content: renderContent("market") },
    { id: "limit", label: "Limit", content: renderContent("limit") },
    { id: "stop", label: "Stop", content: renderContent("stop") },
  ];

  return (
    <>
      <NavigationTabs
        tabs={tabsData}
        defaultActiveTab={activeTabId}
        onActiveTabChange={(id) => setActiveTabId(id as any)}
        className="max-w-md mx-auto"
      />
    </>
  );
};

export default NewOrder;
