// src/pages/Charts/Charts.tsx

import { useState, useMemo, useEffect } from "react";
import { useDispatch } from "react-redux"; // 1. Import useDispatch
import type { AppDispatch } from "../../store/store"; // 2. Import AppDispatch
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
import RadioButton from "../../components/radioButton/RadioButton";

const Charts = () => {
  const { active, setActive, isDrawerOpen, setIsDrawerOpen } =
    useOutletContext<OutletContextType>();

  const [selectedOption, setSelectedOption] = useState("");

  const options = [
    "All currently Open",
    "All profitable",
    "All loosing",
    "All long",
    "All short",
    "Use(-) this if data not available",
  ];

  // const [active, setActive] = useState("Chart");
  // //   // Use the typed dispatch hook
  const dispatch = useDispatch<AppDispatch>();

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
  const height = "calc(100vh - 160px)";

  const tabs = ["Chart", "Overview", "Calendar", "Info", "Positions", "Orders"];
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
        <ChartComponent
          height={height}
          instruments={instrumentsForDropdown}
          selectedInstrumentId={selectedInstrumentId}
          selectedTimeframe={selectedTimeframe} // ✅ Passing state
          onTimeframeChange={setSelectedTimeframe} // ✅ Passing setter
          timeframeGroups={mockTimeframes} // ✅ Passing the mock data
          stopLossPrice={null}
          targetPrice={null}
        />
      )}

      {active === "Overview" && <Overview />}

      {active === "Calendar" && <Calender />}

      {active === "Info" && <Info />}

      {active === "Positions" && (
        <div className="h-[calc(100vh-250px)] mt-[40px] overflow-auto">
          <div className="flex flex-col justify-between h-full">
            <div className="">
              {Array.from({ length: 10 }).map((_, index) => {
                return (
                  <HistoryCard
                    index={index}
                    label={"Position"}
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
                zIndex: 1000,
              }}
            >
              <Button
                label={"Sell"}
                width="82px"
                height="44px"
                bgColor="#FE0000"
                textColor="#FAFAFA"
                fontWeight={600}
                textShadow="0px 0px 10px 0px #950101"
              />
              <Counter label="Take Profit" />

              <Button
                label={"Buy"}
                width="82px"
                height="44px"
                bgColor="#02F511"
                textShadow="0px 0px 10px 0px #008508"
                textColor="#FAFAFA"
                fontWeight={600}
              />
            </div>
          </div>
        </div>
      )}

      {active === "Orders" && (
        <div className="h-[calc(100vh-250px)] mt-[40px] overflow-auto">
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
                zIndex: 1000,
              }}
            >
              <Button
                label={"Sell"}
                width="82px"
                height="44px"
                bgColor="#FE0000"
                textColor="#FAFAFA"
                fontWeight={600}
                textShadow="0px 0px 10px 0px #950101"
              />
              <Counter label="Take Profit" />

              <Button
                label={"Buy"}
                width="82px"
                height="44px"
                bgColor="#02F511"
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
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xl font-tertiary mb-2.5 pb-5 border-b border-primary">
              Which position would you like to close at market prices?
            </div>

            <div className="flex flex-col gap-2.5">
              {options.map((option, index) => (
                <div key={option} className="flex items-center justify-between">
                  <span
                    className={`${
                      index === options.length - 1 ? "text-secondary" : ""
                    }`}
                  >
                    {option}
                  </span>
                  <div className="flex items-center gap-5">
                    <span className="font-secondary text-profit">+$0.13</span>
                    <RadioButton
                      isChecked={selectedOption === option}
                      onClick={() => setSelectedOption(option)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-5 mb-2.5">
              <Button
                label="cancel"
                width="176.5px"
                height="41px"
                bgColor="#2D2D2D"
                textColor="#FAFAFA"
                border="1px solid #505050"
              />
              <Button
                label="Confirm"
                width="176.5px"
                height="41px"
                bgColor="#AEED09"
                textColor="#2D2D2D"
                border="1px solid #AEED09"
              />
            </div>
          </div>
        }
      </BottomDrawer>
    </div>
  );
};
export default Charts;
