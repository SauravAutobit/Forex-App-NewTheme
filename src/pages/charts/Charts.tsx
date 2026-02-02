import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch } from "react-redux"; // 1. Import useDispatch
import type { AppDispatch, RootState } from "../../store/store"; // 2. Import AppDispatch
// import { useOutletContext } from "react-router-dom";
// import ChartComponent from "../../components/chartComponent/ChartComponent";
import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";
// import BottomDrawer from "../../components/common/drawer/BottomDrawer";
// import TradeButtonsDrawer from "../../components/tradeButtonsDrawer/TradeButtonsDrawer";
// import type { OutletContextType } from "../../layout/MainLayout";
// import { mockTimeframes } from "../../mockData";
import Overview from "../overview/Overview";
import Info from "../info/Info";
import Calender from "../../components/calender/Calender";
import type { OutletContextType } from "../../layout/MainLayout";
import { useOutletContext } from "react-router-dom";
import BottomDrawer from "../../components/bottomDrawer/BottomDrawer";
import CheckList, {
  type OptionItem,
} from "../../components/checkList/CheckList";
import { useAppSelector } from "../../store/hook";
import { placeNewOrder } from "../../store/slices/ordersSlice";
import { subscribeToInstruments } from "../../services/socketService";
// import { setSelectedInstrument } from "../../store/slices/instrumentsSlice";
import PositionCard from "../../components/positionCard/PositionCard";
import ChartModule from "../../components/chartModule/ChartModule";
// import ChartsWithButtons from "../chartsWithButtons/ChartsWithButtons";

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

  // Load one-touch trading state from localStorage
  const loadOneTouchState = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const key = user.username
        ? `oneTouchTrading_${user.username}`
        : "oneTouchTrading";
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  };

  const [activeOptions, setActiveOptions] = useState<Record<string, boolean>>(
    () => {
      return {
        ...makeInitialState(tradingOptions),
        oneTouchTrading: loadOneTouchState(),
      };
    },
  );

  const [chartToolsOptions, setChartToolsOptions] = useState<
    Record<string, boolean>
  >(makeInitialState(chartOptions));

  // Save one-touch trading state to localStorage whenever it changes
  useEffect(() => {
    if (activeOptions.oneTouchTrading !== undefined) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const key = user.username
        ? `oneTouchTrading_${user.username}`
        : "oneTouchTrading";
      localStorage.setItem(key, JSON.stringify(activeOptions.oneTouchTrading));
    }
  }, [activeOptions.oneTouchTrading]);

  // Use a ref to prevent closing drawer on first mount
  const isMounted = useRef(false);

  // Close drawer whenever One Touch Trading is toggled (enabled or disabled)
  useEffect(() => {
    if (isMounted.current) {
      setIsDrawerOpen((prev) => ({ ...prev, chartDrawer: false }));
    } else {
      isMounted.current = true;
    }
  }, [activeOptions.oneTouchTrading, setIsDrawerOpen]);

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

  // Update chartButtonsData context
  const { setChartButtonsData } = useOutletContext<OutletContextType>();

  useEffect(() => {
    const shouldShowButtons =
      active !== "Chart" || activeOptions.oneTouchTrading;

    if (shouldShowButtons) {
      setChartButtonsData({
        handlePlaceOrder,
        volume: selectedLot * contractSize,
        setVolume: (v) => setSelectedLot(v / contractSize),
        step: contractSize,
        min: contractSize,
      });
    } else {
      setChartButtonsData(null);
    }

    return () => {
      setChartButtonsData(null);
    };
  }, [
    selectedLot,
    contractSize,
    selectedInstrumentId,
    setChartButtonsData,
    activeOptions.oneTouchTrading,
    active,
  ]);

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

  // 192:
  const apiStatus = useAppSelector(
    (state: RootState) => state.websockets.apiStatus,
  );

  // const heightWithButtons = "calc(100vh - 250px)";
  // "Info",
  // NEW: Select Open Positions and Open (Pending) Orders
  const openPositions = useAppSelector((state) => state.positions.positions);
  const openOrders = useAppSelector((state) => state.openOrders.orders);

  const filteredOpenPositions = openPositions.filter(
    (p) => p.instrument_id === selectedInstrumentId,
  );
  const filteredOpenOrders = openOrders.filter(
    (o) => o.instrument_id === selectedInstrumentId,
  );

  const tabs = useMemo(() => {
    // "Calendar",
    const baseTabs = ["Chart", "Overview", "Info"];
    if (filteredOpenPositions.length > 0) baseTabs.push("Positions");
    if (filteredOpenOrders.length > 0) baseTabs.push("Orders");
    return baseTabs;
  }, [filteredOpenPositions.length, filteredOpenOrders.length]);

  // Ensure active tab is valid if it was Positions/Orders and they disappear
  useEffect(() => {
    if (!tabs.includes(active)) {
      setActive("Chart");
    }
  }, [tabs, active, setActive]);

  // 6. Effect to subscribe to quotes for the selected instrument
  useEffect(() => {
    if (selectedInstrumentId && apiStatus === "connected") {
      subscribeToInstruments([selectedInstrumentId]);
    }
  }, [selectedInstrumentId, apiStatus]);

  // Sort them if needed (optional, e.g. by time)
  // const sortedPositions = [...filteredOpenPositions].sort((a,b) => b.created_at - a.created_at);

  // const theme = useAppSelector((s: RootState) => s.theme.mode);

  // const height = `calc(100vh - 180px)`;

  return (
    // <div className="relative">
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <MarketsNavbar
        active={active}
        setActive={setActive}
        tabs={tabs}
        paddingLeft="20px"
        paddingRight="20px"
      />
      {active === "Chart" && (
        <>
          <ChartModule />
          {/* {!activeOptions.oneTouchTrading ? (
            <ChartComponent
              // height={height}
              instruments={instrumentsForDropdown}
              selectedInstrumentId={selectedInstrumentId}
              selectedTimeframe={selectedTimeframe} //  Passing state
              onTimeframeChange={setSelectedTimeframe} //  Passing setter
              timeframeGroups={mockTimeframes} //  Passing the mock data
              onInstrumentChange={(id) => {
                setSelectedInstrumentId(id);
                dispatch(setSelectedInstrument(id));
              }}
              stopLossPrice={null}
              targetPrice={null}
            />
          ) : (
            <>
              <ChartsWithButtons
                oneTouchTrading={activeOptions.oneTouchTrading}
              />
            </>
          )} */}
        </>
      )}

      {active === "Overview" && <Overview />}

      {active === "Calendar" && (
        <Calender
        // width={285}
        // handlePlaceOrder={handlePlaceOrder}
        // volume={selectedLot * contractSize}
        // setVolume={(val) => setSelectedLot(val / contractSize)}
        // step={contractSize}
        // min={contractSize}
        />
      )}

      {active === "Info" && <Info instrument={foundInstrument} />}

      {active === "Positions" && (
        //250px h-[calc(100vh-280px)]
        <div className="overflow-auto">
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
          </div>
        </div>
      )}

      {active === "Orders" && (
        // 250px h-[calc(100vh-270px)]
        <div className="overflow-auto">
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
                readOnly
              />
            </div>
          </div>
        }
      </BottomDrawer>
    </div>
  );
};
export default Charts;
