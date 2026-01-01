import directionArrow from "../../assets/icons/directionArrow.svg";

const DirectionArrow = ({ className }: { className?: string }) => {
  return (
    <div
      className={`relative flex flex-col items-center group pointer-events-none ${className}`}
    >
      <div className="text-white text-lg font-bold leading-tight text-center max-w-[200px] mb-4">
        Tap on Trade to <br />
        <span className="text-quaternary font-tertiary">Expand</span> and{" "}
        <span className="text-quaternary font-tertiary">Collapse</span>
      </div>
      <img
        src={directionArrow}
        alt="directionArrow"
        className="w-[124px] h-[48px] object-contain"
      />
    </div>
  );
};

export default DirectionArrow;

// position: relative;
// bottom: 150px;
// left: 166px;

// // // Assuming directionArrow is the path to your SVG icon

// const DirectionArrow = ({ className }: { className?: string }) => {
//   return (
//     // The container for the message and arrow
//     <div className={`bg-[#0C0C0CE5] p-2 rounded-lg relative ${className}`}>
//       <div className="text-sm w-[173px] text-white">
//         Tap on Trade to{" "}
//         <span className="font-tertiary text-quaternary">Expand</span> and{" "}
//         <span className="font-tertiary text-quaternary">Collapse</span>
//       </div>
//       {/* The image is positioned relative to the div, but since the parent
//           (in HistoryScreenContainer) is positioned absolutely, this works */}
//       <img
//         src={"directionArrow"} // Placeholder since the SVG import is a path
//         alt="directionArrow"
//         // These styles position the arrow image visually to point down-right
//         className="absolute left-[170px] top-[40px]  rotate-45"
//       />
//     </div>
//   );
// };

// export default DirectionArrow;

// // // position: relative;
// // // bottom: 150px;
// // // left: 166px;

// // DirectionArrow.tsx (The component you created)

// // const DirectionArrow = ({ className }: { className?: string }) => {
// //   return (
// //     // The container for the message and arrow. Use className prop here.
// //     <div className={`bg-[#0C0C0CE5] p-2 rounded-lg relative ${className}`}>
// //       <div className="text-sm w-[173px] text-white">
// //         Tap on Trade to
// //         <span className="font-tertiary text-quaternary">Expand</span> and
// //         <span className="font-tertiary text-quaternary">Collapse</span>
// //       </div>
// //       <img
// //         src={"directionArrow"}
// //         alt="directionArrow" // Position relative to this div
// //         className="absolute left-[170px] top-[40px] w-[50px] h-[50px] rotate-45"
// //       />
// //     </div>
// //   );
// // };

// // export default DirectionArrow;
