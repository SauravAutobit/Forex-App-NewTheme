import { useOutletContext } from "react-router-dom";
import closeAllArrow from "../../assets/icons/closeAllArrow.svg";
import type { OutletContextType } from "../../layout/MainLayout";
import { useAppSelector } from "../../store/hook";
import closeAllArrowLight from "../../assets/icons/closeAllArrowLight.svg";

const ProfitLossClose = () => {
  const { setIsDrawerOpen } = useOutletContext<OutletContextType>();

  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div className="px-5 pt-5 pb-2.5 flex items-center justify-between">
      <div className="text-secondary">
        Floating Profit :{" "}
        <span
          className={`font-tertiary ${
            theme === "dark" ? "text-quaternary" : "text-[#00B22D]"
          }`}
        >
          $25.36
        </span>
      </div>
      <div
        className="flex items-center bg-cardBg text-sm font-secondary w-[82px] h-[26px] justify-center rounded-[6px] gap-[7px] cursor-pointer border border-primary text-primary"
        onClick={() =>
          setIsDrawerOpen((prev) => ({ ...prev, tradeMarketDrawer: true }))
        }
      >
        Close all{" "}
        <img
          src={theme === "dark" ? closeAllArrow : closeAllArrowLight}
          alt="closeAllArrow"
        />
      </div>
    </div>
  );
};

export default ProfitLossClose;
