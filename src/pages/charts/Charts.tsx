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

const Charts = () => {
  // const { isDrawerOpen, setIsDrawerOpen } =
  //   useOutletContext<OutletContextType>();
  const [active, setActive] = useState("Chart");
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
  const height = "calc(100vh - 150px)";

  const tabs = ["Chart", "Overview", "Calendar", "Info", "Positions", "Orders"];
  return (
    <div className="relative">
      <MarketsNavbar
        active={active}
        setActive={setActive}
        tabs={tabs}
        paddingLeft="20px"
        paddingRight="20px"
        marginBottom="10px"
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

      {/* <BottomDrawer
        isOpen={isDrawerOpen.chartDrawer}
        onClose={() =>
          setIsDrawerOpen((prev) => ({
            ...prev,
            chartDrawer: false,
          }))
        }
      >
        <TradeButtonsDrawer selectedInstrumentId={selectedInstrumentId} />
      </BottomDrawer> */}
    </div>
  );
};
export default Charts;
