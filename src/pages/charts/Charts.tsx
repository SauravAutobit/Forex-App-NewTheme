// src/pages/Charts/Charts.tsx

import { useState, useMemo, useEffect } from "react";
import { useDispatch } from "react-redux"; // 1. Import useDispatch
import type { AppDispatch, RootState } from "../../store/store"; // 2. Import AppDispatch
// import { useOutletContext } from "react-router-dom";
import ChartComponent from "../../components/chartComponent/ChartComponent";
import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";
// import BottomDrawer from "../../components/common/drawer/BottomDrawer";
// import TradeButtonsDrawer from "../../components/tradeButtonsDrawer/TradeButtonsDrawer";
// import type { OutletContextType } from "../../layout/MainLayout";

import { fetchChartData } from "../../store/slices/chartSlice";
import { mockTimeframes } from "../../mockData";
import Overview from "../overview/Overview";
import Info from "../info/Info";
import Calender from "../../components/calender/Calender";
import Button from "../../components/button/Button";
import Counter from "../../components/counter/Counter";
import type { OutletContextType } from "../../layout/MainLayout";
import { useOutletContext } from "react-router-dom";
import BottomDrawer from "../../components/bottomDrawer/BottomDrawer";
import CheckList, {
  type OptionItem,
} from "../../components/checkList/CheckList";
import { useAppSelector } from "../../store/hook";
import { placeNewOrder } from "../../store/slices/ordersSlice";
import { subscribeToInstruments } from "../../services/socketService";

import PositionCard from "../../components/positionCard/PositionCard";
import ChartsWithButtons from "../chartsWithButtons/ChartsWithButtons";

const Charts = () => {
  const { active, setActive, isDrawerOpen, setIsDrawerOpen, setIsFlag } =
    useOutletContext<OutletContextType>();

  useEffect(() => {
    setIsFlag((prev) => ({ ...prev, charts: { status: true } }));
    return () => {
      setIsFlag((prev) => ({ ...prev, charts: { status: false } }));
    };
  }, [setIsFlag]);

  // const [active, setActive] = useState("Chart");
  // //   // Use the typed dispatch hook
  const dispatch = useDispatch<AppDispatch>();
  const tradingOptions = [
    { label: "One Touch Trading", key: "oneTouchTrading" },
  ];

  const chartOptions = [
    {
      label: "Bid price",
      key: "bidPrice",
    },
    { label: "Ask price", key: "askPrice" },
    {
      label: "Open orders",
      key: "openOrders",
    },
    {
      label: "Pending orders",
      key: "pendingOrders",
    },
  ];
  const makeInitialState = (list: OptionItem[]) =>
    Object.fromEntries(list.map((item) => [item.key, false]));

  const [activeOptions, setActiveOptions] = useState(
    makeInitialState(tradingOptions),
  );

  const [chartToolsOptions, setChartToolsOptions] = useState(
    makeInitialState(chartOptions),
  );

  const allInstrumentsData = useAppSelector(
    (state: RootState) => state.instruments.data,
  );
  const reduxSelectedId = useAppSelector(
    (state: RootState) => state.instruments.selectedInstrumentId,
  );

  const instrumentsForDropdown = useMemo(() => {
    return Object.values(allInstrumentsData)
      .flat()
      .map((inst) => ({
        id: inst.id,
        name: inst.trading_name,
      }));
  }, [allInstrumentsData]);

  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1m");

  const [selectedInstrumentId, setSelectedInstrumentId] = useState<
    string | null
  >(reduxSelectedId || instrumentsForDropdown[0]?.id || null);

  useEffect(() => {
    if (reduxSelectedId) {
      setSelectedInstrumentId(reduxSelectedId);
    }
  }, [reduxSelectedId]);
  // Helper to find the full instrument object to get contract size
  const foundInstrument = useMemo(() => {
    if (!selectedInstrumentId) return null;
    const instrumentIdStr = String(selectedInstrumentId).trim().toLowerCase();

    for (const category in allInstrumentsData) {
      const found = allInstrumentsData[category].find(
        (inst) => String(inst.id).trim().toLowerCase() === instrumentIdStr,
      );
      if (found) return found;
    }
    return null;
  }, [allInstrumentsData, selectedInstrumentId]);

  const getContractSize = () => {
    return (
      Number(foundInstrument?.static_data?.contractsize) ||
      Number(foundInstrument?.static_data?.contract_size) ||
      1
    );
  };

  const contractSize = getContractSize();

  // Initialize selectedLot instead of raw volume. Default to 1 (like NewOrder)
  const [selectedLot, setSelectedLot] = useState(1);

  const handlePlaceOrder = (side: "buy" | "sell") => {
    if (!selectedInstrumentId) return;
    dispatch(
      placeNewOrder({
        instrument_id: selectedInstrumentId,
        qty: selectedLot * contractSize, // Send Units
        price: 0,
        order_type: "market",
        side,
        stoploss: 0,
        target: 0,
      }),
    );
  };

  // 4. Effect to manage selectedInstrumentId synchronization
  useEffect(() => {
    if (instrumentsForDropdown.length === 0) {
      setSelectedInstrumentId(null);
      return;
    }
    // If nothing selected yet, pick first
    if (!selectedInstrumentId) {
      setSelectedInstrumentId(instrumentsForDropdown[0].id);
      return;
    } else {
      // If currently selected instrument is not present in new list, pick first
      const exists = instrumentsForDropdown.find(
        (i) => i.id === selectedInstrumentId,
      );
      if (!exists) {
        setSelectedInstrumentId(instrumentsForDropdown[0].id);
      }
    }
  }, [instrumentsForDropdown, selectedInstrumentId]);

  // 5. Effect to fetch data whenever the selected instrument ID changes
  useEffect(() => {
    if (selectedInstrumentId && selectedTimeframe) {
      dispatch(
        fetchChartData({
          instrumentId: selectedInstrumentId,
          timeframe: selectedTimeframe,
          startIndex: 0,
          endIndex: 99,
        }),
      );
    }
  }, [selectedInstrumentId, dispatch, selectedTimeframe]);

  // 6. Effect to subscribe to quotes for the selected instrument
  useEffect(() => {
    if (selectedInstrumentId) {
      subscribeToInstruments([selectedInstrumentId]);
    }
  }, [selectedInstrumentId]);

  // Initial fetches removed: now handled centrally in socketService.ts/fetchAllAppData

  // const { isFlag, active, setActive } = useOutletContext<OutletContextType>();
  const height = `calc(100vh - 160px)`;
  // 250 160

  // const heightWithButtons = "calc(100vh - 250px)";
  // "Info",
  const tabs = ["Chart", "Overview", "Calendar", "Info", "Positions", "Orders"];

  // NEW: Select Open Positions and Open (Pending) Orders
  const openPositions = useAppSelector((state) => state.positions.positions);
  const openOrders = useAppSelector((state) => state.openOrders.orders);

  const filteredOpenPositions = openPositions.filter(
    (p) => p.instrument_id === selectedInstrumentId,
  );
  const filteredOpenOrders = openOrders.filter(
    (o) => o.instrument_id === selectedInstrumentId,
  );

  // Sort them if needed (optional, e.g. by time)
  // const sortedPositions = [...filteredOpenPositions].sort((a,b) => b.created_at - a.created_at);

  const theme = useAppSelector((s: RootState) => s.theme.mode);

  return (
    <div className="relative">
      <MarketsNavbar
        active={active}
        setActive={setActive}
        tabs={tabs}
        paddingLeft="20px"
        paddingRight="20px"
      />
      {active === "Chart" && (
        <>
          {!activeOptions.oneTouchTrading ? (
            <ChartComponent
              height={height}
              instruments={instrumentsForDropdown}
              selectedInstrumentId={selectedInstrumentId}
              selectedTimeframe={selectedTimeframe} //  Passing state
              onTimeframeChange={setSelectedTimeframe} //  Passing setter
              timeframeGroups={mockTimeframes} //  Passing the mock data
              onInstrumentChange={(id) => setSelectedInstrumentId(id)}
              stopLossPrice={null}
              targetPrice={null}
            />
          ) : (
            <>
              <ChartsWithButtons />
            </>
          )}
        </>
      )}

      {active === "Overview" && (
        <Overview
          selectedInstrumentId={selectedInstrumentId}
          handlePlaceOrder={handlePlaceOrder}
          volume={selectedLot * contractSize}
          setVolume={(val) => setSelectedLot(val / contractSize)}
          step={contractSize}
          min={contractSize}
        />
      )}

      {active === "Calendar" && (
        <Calender
          handlePlaceOrder={handlePlaceOrder}
          volume={selectedLot * contractSize}
          setVolume={(val) => setSelectedLot(val / contractSize)}
          step={contractSize}
          min={contractSize}
        />
      )}

      {active === "Info" && (
        <Info
          selectedInstrumentId={selectedInstrumentId}
          handlePlaceOrder={handlePlaceOrder}
          volume={selectedLot * contractSize}
          setVolume={(val) => setSelectedLot(val / contractSize)}
          step={contractSize}
          min={contractSize}
        />
      )}

      {active === "Positions" && (
        <div className="h-[calc(100vh-250px)] overflow-auto">
          <div className="flex flex-col justify-between h-full">
            <div className="">
              {/* Show Open Positions using PositionCard */}
              {filteredOpenPositions.map((pos) => {
                return (
                  <PositionCard
                    key={pos.id}
                    label="Position"
                    position={pos}
                    onClick={() => {
                      // Optional: Navigate to edit page if needed, similar to Trade page
                      // For now just empty or keep basic selection
                    }}
                    hideBorder={true} // Cleaner look in list
                  />
                );
              })}
              {filteredOpenPositions.length === 0 && (
                <div className="text-center mt-10 text-secondary">
                  No open positions for this instrument
                </div>
              )}
            </div>
            <div
              className="bg-primaryBg h-[90px] flex items-center justify-between gap-3.5 px-5 pt-2.5 pb-9 border-t border-primary"
              style={{
                position: "fixed",
                bottom: "65px",
                left: 0,
              }}
            >
              <Button
                label={"Sell"}
                width="82px"
                height="44px"
                bgColor={theme === "dark" ? "#FE0000" : "#DD3C48"}
                textColor="#FAFAFA"
                fontWeight={600}
                textShadow="0px 0px 10px 0px #950101"
                onClick={() => handlePlaceOrder("sell")}
              />
              <Counter
                label="0"
                initialValue={selectedLot * contractSize}
                onValueChange={(val) => setSelectedLot(val / contractSize)}
                step={contractSize}
                min={contractSize}
              />

              <Button
                label={"Buy"}
                width="82px"
                height="44px"
                bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
                textShadow="0px 0px 10px 0px #008508"
                textColor="#FAFAFA"
                fontWeight={600}
                onClick={() => handlePlaceOrder("buy")}
              />
            </div>
          </div>
        </div>
      )}

      {active === "Orders" && (
        <div className="h-[calc(100vh-250px)] overflow-auto">
          <div className="flex flex-col justify-between h-full">
            <div className="">
              {/* Show Pending Orders using PositionCard */}
              {filteredOpenOrders.map((order) => {
                return (
                  <PositionCard
                    key={order.id}
                    label="Orders"
                    position={{} as any} // Dummy prop if needed by types, but we pass openOrderData
                    openOrderData={order}
                    onClick={() => {}}
                    hideBorder={true}
                  />
                );
              })}
              {filteredOpenOrders.length === 0 && (
                <div className="text-center mt-10 text-secondary">
                  No pending orders for this instrument
                </div>
              )}
            </div>
            <div
              className="bg-primaryBg h-[90px] flex items-center justify-between gap-3.5 px-5 pt-2.5 pb-9 border-t border-primary"
              style={{
                position: "fixed",
                bottom: "65px",
                left: 0,
              }}
            >
              <Button
                label={"Sell"}
                width="82px"
                height="44px"
                bgColor={theme === "dark" ? "#FE0000" : "#DD3C48"}
                textColor="#FAFAFA"
                fontWeight={600}
                textShadow="0px 0px 10px 0px #950101"
                onClick={() => handlePlaceOrder("sell")}
              />
              <Counter
                label="0"
                initialValue={selectedLot * contractSize}
                onValueChange={(val) => setSelectedLot(val / contractSize)}
                step={contractSize}
                min={contractSize}
              />

              <Button
                label={"Buy"}
                width="82px"
                height="44px"
                bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
                textShadow="0px 0px 10px 0px #008508"
                textColor="#FAFAFA"
                fontWeight={600}
                onClick={() => handlePlaceOrder("buy")}
              />
            </div>
          </div>
        </div>
      )}

      <BottomDrawer
        isOpen={isDrawerOpen.chartDrawer}
        onClose={() =>
          setIsDrawerOpen((prev) => ({ ...prev, chartDrawer: false }))
        }
      >
        {
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-xl font-tertiary mb-2.5 pb-5">
              Chart setting
            </div>

            <div className="flex flex-col gap-[20px] border-b border-primary">
              <div>Trading flow</div>
              <CheckList
                activeOptions={activeOptions}
                setActiveOptions={setActiveOptions}
                // options={[
                //   {
                //     label: "One Touch Trading",
                //     key: "oneTouchTrading",
                //   },
                // ]}
                options={tradingOptions}
              />
            </div>

            <div className="flex flex-col gap-[20px] mt-5">
              <div>Select the trading tools you want to view</div>
              <CheckList
                activeOptions={chartToolsOptions}
                setActiveOptions={setChartToolsOptions}
                options={chartOptions}
              />
            </div>
          </div>
        }
      </BottomDrawer>
    </div>
  );
};
export default Charts;
