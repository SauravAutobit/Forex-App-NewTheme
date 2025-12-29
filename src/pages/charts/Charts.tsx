// src/pages/Charts/Charts.tsx

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // 1. Import useDispatch
import type { AppDispatch, RootState } from "../../store/store"; // 2. Import AppDispatch
// import { useOutletContext } from "react-router-dom";
import ChartComponent from "../../components/chartComponent/ChartComponent";
import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";
// import BottomDrawer from "../../components/common/drawer/BottomDrawer";
// import TradeButtonsDrawer from "../../components/tradeButtonsDrawer/TradeButtonsDrawer";
// import type { OutletContextType } from "../../layout/MainLayout";

// 3. Import the async thunk
import { fetchChartData } from "../../store/slices/chartSlice";
import { mockInstruments, mockTimeframes } from "../../mockData";
import Overview from "../overview/Overview";
import Info from "../info/Info";
import HistoryCard from "../../components/historyCard/HistoryCard";
import Calender from "../../components/calender/Calender";
import Button from "../../components/button/Button";
import Counter from "../../components/counter/Counter";
import type { OutletContextType } from "../../layout/MainLayout";
import { useOutletContext } from "react-router-dom";
import BottomDrawer from "../../components/bottomDrawer/BottomDrawer";
import CheckList, {
  type OptionItem,
} from "../../components/checkList/CheckList";
import ChartsWithButtons from "../chartsWithButtons/ChartsWithButtons";

const Charts = () => {
  const { active, setActive, isDrawerOpen, setIsDrawerOpen } =
    useOutletContext<OutletContextType>();

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
    makeInitialState(tradingOptions)
  );

  const [chartToolsOptions, setChartToolsOptions] = useState(
    makeInitialState(chartOptions)
  );

  // //   const allActiveQuotes = useSelector(
  // //     (state: RootState) => state.quotes.quotes
  // //   );

  const allActiveQuotes = mockInstruments;
  const instrumentsForDropdown = useMemo(() => {
    return allActiveQuotes.map((quote) => ({
      id: quote.id,
      name: quote.name,
    }));
  }, [allActiveQuotes]);

  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1m");

  const [selectedInstrumentId, setSelectedInstrumentId] = useState<
    string | null
  >(instrumentsForDropdown[0]?.id || null);

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
        (i) => i.id === selectedInstrumentId
      );
      if (!exists) {
        setSelectedInstrumentId(instrumentsForDropdown[0].id);
      }
    }
  }, [instrumentsForDropdown, selectedInstrumentId]);

  // 5. Effect to fetch data whenever the selected instrument ID changes
  useEffect(() => {
    if (selectedInstrumentId && selectedTimeframe) {
      // Dispatch the thunk to fetch/mock data for the new instrument.
      // Since your thunk currently returns 100 mock points,
      // we can use a fixed range (e.g., [0:99]) for initial load.
      dispatch(
        fetchChartData({
          instrumentId: selectedInstrumentId,
          timeframe: selectedTimeframe,
          startIndex: 0,
          endIndex: 99,
        })
      );
    }
  }, [selectedInstrumentId, dispatch, selectedTimeframe]); // Re-run whenever the ID changes

  // const { isFlag, active, setActive } = useOutletContext<OutletContextType>();
  const height = `calc(100vh - 160px)`;
  // 250 160

  // const heightWithButtons = "calc(100vh - 250px)";

  const tabs = ["Chart", "Overview", "Calendar", "Info", "Positions", "Orders"];

  // console.log("active options", activeOptions);

  const theme = useSelector((s: RootState) => s.theme.mode);

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

      {active === "Overview" && <Overview />}

      {active === "Calendar" && <Calender />}

      {active === "Info" && <Info />}

      {active === "Positions" && (
        <div className="h-[calc(100vh-250px)] overflow-auto">
          <div className="flex flex-col justify-between h-full">
            <div className="">
              {Array.from({ length: 10 }).map((_, index) => {
                return (
                  <div key={index}>
                    <HistoryCard
                      index={index}
                      label={"Position"}
                      onCardClick={() => {}}
                      isTutorialTarget={false}
                    />
                  </div>
                );
              })}
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
              />
              <Counter label="Take Profit" />

              <Button
                label={"Buy"}
                width="82px"
                height="44px"
                bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
                textShadow="0px 0px 10px 0px #008508"
                textColor="#FAFAFA"
                fontWeight={600}
              />
            </div>
          </div>
        </div>
      )}

      {active === "Orders" && (
        <div className="h-[calc(100vh-250px)] overflow-auto">
          <div className="flex flex-col justify-between h-full">
            <div className="">
              {Array.from({ length: 10 }).map((_, index) => {
                return (
                  <HistoryCard
                    index={index}
                    label="Orders"
                    onCardClick={() => {}}
                    isTutorialTarget={false}
                  />
                );
              })}
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
              />
              <Counter label="Take Profit" />

              <Button
                label={"Buy"}
                width="82px"
                height="44px"
                bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
                textShadow="0px 0px 10px 0px #008508"
                textColor="#FAFAFA"
                fontWeight={600}
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
