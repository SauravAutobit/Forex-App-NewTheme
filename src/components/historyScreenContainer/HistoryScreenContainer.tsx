import { useState } from "react";
import History from "../../pages/history/History"; // Assuming your page component is named History
// import DirectionArrow from "../directionArrow/DirectionArrow";

const HistoryScreenContainer = () => {
  // State to control the visibility of the tutorial arrow/message
  // Use a proper mechanism (like localStorage) in a real app to check if
  // the user has seen it before. For this demo, we use simple state.
  const [showTutorial, setShowTutorial] = useState(true);

  // Function to dismiss the arrow when a card is clicked
  const handleDismissTutorial = () => {
    setShowTutorial(false);
  };
  const ARROW_TOP_POSITION = "190px";
  const ARROW_RIGHT_POSITION = "20px"; // Adjust to point exactly to the P&L

  console.log("showTutorial", showTutorial);
  return (
    <div className="relative h-screen bg-darkBg">
      {/* --- Global Fixed Overlay for the Tutorial Arrow --- */}
      {showTutorial && (
        <div
          className="fixed z-[1000] pointer-events-none" // z-index 1000 ensures it's on top
          style={{ top: ARROW_TOP_POSITION, right: ARROW_RIGHT_POSITION }}
        >
          {/* pointer-events-none prevents this entire container from blocking clicks */}
          {/* <DirectionArrow
            // Add a class to the Arrow component's container to re-enable clicks
            // on the message box, but the arrow image will be click-through.
            className="pointer-events-auto"
          /> */}
        </div>
      )}

      {/* --- Main History Page Content --- */}
      <History
        onDismissTutorial={handleDismissTutorial}
        showTutorial={showTutorial}
      />
    </div>
  );
};

export default HistoryScreenContainer;
