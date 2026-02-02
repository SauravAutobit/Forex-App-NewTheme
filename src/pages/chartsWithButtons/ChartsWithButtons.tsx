import { useEffect, useMemo, useState } from "react";

import ChartComponent from "../../components/chartComponent/ChartComponent";
import type { AppDispatch, RootState } from "../../store/store";
import { useDispatch } from "react-redux";
import { mockTimeframes } from "../../mockData";
import { useAppSelector } from "../../store/hook";
import { placeNewOrder } from "../../store/slices/ordersSlice";
import { subscribeToInstruments } from "../../services/socketService";
import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "../../layout/MainLayout";

const ChartsWithButtons = ({
  oneTouchTrading,
}: {
  oneTouchTrading: boolean | undefined;
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const allInstrumentsData = useAppSelector(
    (state: RootState) => state.instruments.data,
  );

  const instrumentsForDropdown = useMemo(() => {
    return Object.values(allInstrumentsData)
      .flat()
      .map((inst: any) => ({
        id: inst.id,
        name: inst.trading_name,
      }));
  }, [allInstrumentsData]);

  const reduxSelectedId = useAppSelector(
    (state: RootState) => state.instruments.selectedInstrumentId,
  );

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
    setChartButtonsData({
      handlePlaceOrder,
      volume: selectedLot * contractSize,
      setVolume: (v) => setSelectedLot(v / contractSize),
      step: contractSize,
      min: contractSize,
    });

    // Cleanup
    return () => setChartButtonsData(null);
  }, [selectedLot, contractSize, selectedInstrumentId, setChartButtonsData]);

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

  const apiStatus = useAppSelector(
    (state: RootState) => state.websockets.apiStatus,
  );

  // Subscribe to quotes for the selected instrument in ChartsWithButtons
  useEffect(() => {
    if (selectedInstrumentId && apiStatus === "connected") {
      subscribeToInstruments([selectedInstrumentId]);
    }
  }, [selectedInstrumentId, apiStatus]);

  //250px
  const height = `calc(100dvh - 250px)`;

  return (
    <div>
      <ChartComponent
        height={height}
        instruments={instrumentsForDropdown}
        selectedInstrumentId={selectedInstrumentId}
        selectedTimeframe={selectedTimeframe} //  Passing state
        onTimeframeChange={setSelectedTimeframe} //  Passing setter
        timeframeGroups={mockTimeframes} // Passing the mock data
        onInstrumentChange={(id) => setSelectedInstrumentId(id)}
        stopLossPrice={null}
        targetPrice={null}
        oneTouchTrading={oneTouchTrading}
      />
    </div>
  );
};

export default ChartsWithButtons;
