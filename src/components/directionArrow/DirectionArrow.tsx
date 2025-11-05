import directionArrow from "../../assets/icons/directionArrow.svg";

const DirectionArrow = () => {
  return (
    <div className="bg-[#0C0C0CE5]">
      <div className="text-lg w-[173px] relative">
        Tap on Trade to{" "}
        <span className="font-tertiary text-quaternary">Expand</span> and{" "}
        <span className="font-tertiary text-quaternary">Collapse</span>
      </div>
      <img
        src={directionArrow}
        alt="directionArrow"
        className="absolute left-[166px] top-[60px]"
      />
    </div>
  );
};

export default DirectionArrow;

// position: relative;
// bottom: 150px;
// left: 166px;
