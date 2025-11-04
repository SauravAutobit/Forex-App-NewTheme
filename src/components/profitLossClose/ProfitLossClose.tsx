import closeAllArrow from "../../assets/icons/closeAllArrow.svg";

const ProfitLossClose = () => {
  return (
    <div className="pt-5 pb-2.5 flex items-center justify-between">
      <div className="text-secondary">
        Floating Profit :{" "}
        <span className="font-tertiary text-quaternary">$25.36</span>
      </div>
      <div className="flex items-center bg-cardBg text-sm font-secondary w-[82px] h-[26px] justify-center rounded-[6px] gap-[7px] cursor-pointer border border-primary">
        Close all <img src={closeAllArrow} alt="closeAllArrow" />
      </div>
    </div>
  );
};

export default ProfitLossClose;
