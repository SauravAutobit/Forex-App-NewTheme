import { useEffect, useMemo, useState } from "react";
import Button from "../../components/button/Button";
import Counter from "../../components/counter/Counter";
import { fetchChartData } from "../../store/slices/chartSlice";
import ChartComponent from "../../components/chartComponent/ChartComponent";
import type { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { mockInstruments, mockTimeframes } from "../../mockData";

const ChartsWithButtons = () => {
  const dispatch = useDispatch<AppDispatch>();

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

  const height = `calc(100vh - 250px)`;
  const theme = useSelector((s: RootState) => s.theme.mode);

  return (
    <div>
      <ChartComponent
        height={height}
        instruments={instrumentsForDropdown}
        selectedInstrumentId={selectedInstrumentId}
        selectedTimeframe={selectedTimeframe} //  Passing state
        onTimeframeChange={setSelectedTimeframe} //  Passing setter
        timeframeGroups={mockTimeframes} // Passing the mock data
        stopLossPrice={null}
        targetPrice={null}
      />
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
          textShadow={theme === "dark" ? "0px 0px 10px 0px #950101" : ""}
        />
        <Counter label="Take Profit" />

        <Button
          label={"Buy"}
          width="82px"
          height="44px"
          bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
          textShadow={theme === "dark" ? "0px 0px 10px 0px #008508" : ""}
          textColor="#FAFAFA"
          fontWeight={600}
        />
      </div>
    </div>
  );
};

export default ChartsWithButtons;
