// import { useState } from "react";
import History from "../../pages/history/History"; // Assuming your page component is named History
// import DirectionArrow from "../directionArrow/DirectionArrow";

const HistoryScreenContainer = () => {
  return (
    // h-screen
    <div className="relative bg-darkBg">
      {/* --- Main History Page Content --- */}
      <History />
    </div>
  );
};

export default HistoryScreenContainer;
