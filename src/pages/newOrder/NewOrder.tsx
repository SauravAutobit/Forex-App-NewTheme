import Counter from "../../components/counter/Counter";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import CheckList from "../../components/checkList/CheckList";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useSearchParams } from "react-router-dom";
import OrderButtons from "../../components/orderButtons/OrderButtons";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const NewOrder = () => {
  const [searchParams] = useSearchParams();

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

  const selectedPosition = useMemo(
    () => positions.find((p) => p.id === positionId),
    [positions, positionId]
  );

  const instrumentId =
    mode === "closePosition"
      ? selectedPosition?.instrument_id
      : selectedInstrumentId;

  const selectedQuote = useMemo(
    () => quotes.find((q) => q.id === instrumentId),
    [quotes, instrumentId]
  );

  const foundInstrument = useMemo(() => {
    for (const category in instrumentsData) {
      const found = instrumentsData[category].find(
        (inst) => inst.id === instrumentId
      );
      if (found) return found;
    }
    return null;
  }, [instrumentsData, instrumentId]);

  console.log("foundInstrument", foundInstrument);

  const [activeTabId, setActiveTabId] = useState<"market" | "limit" | "stop">(
    "market"
  );
  const [selectedLot, setSelectedLot] = useState(0.01);
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
      const staticData = foundInstrument.static_data;
      let step = 0.01;
      if (staticData?.ticksize) {
        step = Number(staticData.ticksize);
      } else if (staticData?.pip) {
        step = Number(staticData.pip);
      }
      setPriceStep(step);
    }
  }, [foundInstrument]);

  // Initialize values from selected position (Close/Modify mode)
  useEffect(() => {
    if (selectedPosition) {
      setSelectedLot(
        selectedPosition.qty /
          (Number(foundInstrument?.static_data?.contractsize) || 1)
      );

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

  useEffect(() => {
    if (foundInstrument) {
      const contractSize =
        Number(foundInstrument.static_data?.contractsize) || 1;
      const vol = selectedLot * contractSize;
      console.log(
        `[NewOrder] Lot: ${selectedLot.toFixed(2)}, Volume: ${vol.toFixed(
          2
        )} (Contract Size: ${contractSize})`
      );
    }
  }, [selectedLot, foundInstrument]);

  const editOptions = [
    { label: "Trailing stop", key: "trailingStop" },
    { label: "Break even", key: "breakEven" },
    { label: "Order expiration", key: "orderExpiration" },
  ];

  const [activeOptions, setActiveOptions] = useState<Record<string, boolean>>(
    () => editOptions.reduce((acc, curr) => ({ ...acc, [curr.key]: false }), {})
  );

  const renderContent = (type: "market" | "limit" | "stop") => (
    <div className="px-5 h-[calc(100vh-179px)] overflow-y-auto">
      <div className="mt-5 flex flex-col gap-2.5 justify-between h-full">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1">
            <Counter
              label="Vol"
              initialValue={
                selectedLot *
                (Number(foundInstrument?.static_data?.contractsize) || 1)
              }
              min={
                0.01 * (Number(foundInstrument?.static_data?.contractsize) || 1)
              }
              step={
                0.01 * (Number(foundInstrument?.static_data?.contractsize) || 1)
              }
              onValueChange={(val) =>
                setSelectedLot(
                  val /
                    (Number(foundInstrument?.static_data?.contractsize) || 1)
                )
              }
            />
            <span className="text-secondary mt-7">or</span>
            <Counter
              label="Lot"
              initialValue={selectedLot}
              min={0.01}
              step={0.01}
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
            contractSize={
              Number(foundInstrument?.static_data?.contractsize) || 1
            }
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
