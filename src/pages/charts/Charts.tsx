// src/pages/Charts/Charts.tsx

// import { useState, useMemo, useEffect } from "react";
// import { useOutletContext } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux"; // 1. Import useDispatch
// import type { RootState, AppDispatch } from "../../store/store"; // 2. Import AppDispatch
import ChartComponent from "../../components/chartComponent/ChartComponent";
// import BottomDrawer from "../../components/common/drawer/BottomDrawer";
// import TradeButtonsDrawer from "../../components/tradeButtonsDrawer/TradeButtonsDrawer";
// import type { OutletContextType } from "../../layout/MainLayout";

// 3. Import the async thunk
// import { fetchChartData } from "../../store/slices/chartSlice";

const Charts = () => {
  // //   const { isDrawerOpen, setIsDrawerOpen } =
  // //     useOutletContext<OutletContextType>();

  // //   // Use the typed dispatch hook
  // //   const dispatch = useDispatch<AppDispatch>();

  // //   const allActiveQuotes = useSelector(
  // //     (state: RootState) => state.quotes.quotes
  // //   );

  // //   const instrumentsForDropdown = useMemo(() => {
  // //     return allActiveQuotes.map((quote) => ({
  // //       id: quote.id,
  // //       name: quote.name,
  // //     }));
  // //   }, [allActiveQuotes]);

  //   const [selectedInstrumentId, setSelectedInstrumentId] = useState<
  //     string | null
  //   >(instrumentsForDropdown[0]?.id || null);

  //   // 4. Effect to manage selectedInstrumentId synchronization
  //   useEffect(() => {
  //     if (instrumentsForDropdown.length === 0) {
  //       setSelectedInstrumentId(null);
  //       return;
  //     }
  //     // If nothing selected yet, pick first
  //     if (!selectedInstrumentId) {
  //       setSelectedInstrumentId(instrumentsForDropdown[0].id);
  //       return;
  //     }
  //     // If currently selected instrument is not present in new list, pick first
  //     const exists = instrumentsForDropdown.find(
  //       (i) => i.id === selectedInstrumentId
  //     );
  //     if (!exists) {
  //       setSelectedInstrumentId(instrumentsForDropdown[0].id);
  //     }
  //   }, [instrumentsForDropdown, selectedInstrumentId]);

  //   // 5. Effect to fetch data whenever the selected instrument ID changes
  //   useEffect(() => {
  //     if (selectedInstrumentId) {
  //       // Dispatch the thunk to fetch/mock data for the new instrument.
  //       // Since your thunk currently returns 100 mock points,
  //       // we can use a fixed range (e.g., [0:99]) for initial load.
  //       dispatch(
  //         fetchChartData({
  //           instrumentId: selectedInstrumentId,
  //           startIndex: 0,
  //           endIndex: 99,
  //         })
  //       );
  //     }
  //   }, [selectedInstrumentId, dispatch]); // Re-run whenever the ID changes

  const height = "calc(100vh - 150px)";

  return (
    <div className="relative pt-4">
      <ChartComponent
        height={height}
        // instruments={instrumentsForDropdown}
        // selectedInstrumentId={selectedInstrumentId}
        // onInstrumentChange={setSelectedInstrumentId}
        stopLossPrice={null}
        targetPrice={null}
      />

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

// // src/pages/Charts/Charts.tsx

// import { useState, useMemo, useEffect } from "react";
// import { useOutletContext } from "react-router-dom";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../store/store";
// import ChartComponent from "../../components/chartComponent/ChartComponent";
// import BottomDrawer from "../../components/common/drawer/BottomDrawer";
// import TradeButtonsDrawer from "../../components/tradeButtonsDrawer/TradeButtonsDrawer";
// import type { OutletContextType } from "../../layout/MainLayout";
// // Assuming OrderStatus is imported/rendered at the root level (MainLayout or TradeLayout)

// const Charts = () => {
//   const { isDrawerOpen, setIsDrawerOpen } =
//     useOutletContext<OutletContextType>();

//   const allActiveQuotes = useSelector(
//     (state: RootState) => state.quotes.quotes
//   );

//   const instrumentsForDropdown = useMemo(() => {
//     return allActiveQuotes.map((quote) => ({
//       id: quote.id,
//       name: quote.name,
//     }));
//   }, [allActiveQuotes]);

//   const [selectedInstrumentId, setSelectedInstrumentId] = useState<
//     string | null
//   >(instrumentsForDropdown[0]?.id || null);

//   // Keep selectedInstrumentId in sync when instruments load or change.
//   useEffect(() => {
//     if (instrumentsForDropdown.length === 0) {
//       setSelectedInstrumentId(null);
//       return;
//     }
//     // if nothing selected yet, pick first
//     if (!selectedInstrumentId) {
//       setSelectedInstrumentId(instrumentsForDropdown[0].id);
//       return;
//     }
//     // if currently selected instrument is not present in new list, pick first
//     const exists = instrumentsForDropdown.find(
//       (i) => i.id === selectedInstrumentId
//     );
//     if (!exists) {
//       setSelectedInstrumentId(instrumentsForDropdown[0].id);
//     }
//   }, [instrumentsForDropdown, selectedInstrumentId]);

//   const height = "calc(100vh - 150px)";

//   return (
//     <div className="relative pt-4">
//       <ChartComponent
//         height={height}
//         instruments={instrumentsForDropdown}
//         selectedInstrumentId={selectedInstrumentId}
//         onInstrumentChange={setSelectedInstrumentId}
//         stopLossPrice={null}
//         targetPrice={null}
//       />

//       <BottomDrawer
//         isOpen={isDrawerOpen.chartDrawer}
//         onClose={() =>
//           setIsDrawerOpen((prev) => ({
//             ...prev,
//             chartDrawer: false,
//           }))
//         }
//       >
//         {/* Pass the selected instrument ID to the drawer */}
//         <TradeButtonsDrawer selectedInstrumentId={selectedInstrumentId} />
//       </BottomDrawer>

//       {/* Note: Assuming OrderStatus (your existing toast/overlay)
//         is rendered at a higher level (e.g., in MainLayout)
//         to capture status changes from any component.
//       */}
//     </div>
//   );
// };
// export default Charts;
