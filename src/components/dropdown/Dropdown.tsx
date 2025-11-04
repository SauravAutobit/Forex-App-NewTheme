import cardIcon from "../../assets/icons/cardIcon.svg";
import { useState } from "react";
import downArrow from "../../assets/icons/downArrow.svg";
// import plus from "../../assets/icons/plus.svg";
// import type { Instrument } from "../../store/slices/instrumentsSlice";
// import { useDispatch } from "react-redux";
// import { addInstrumentToQuotes } from "../../store/slices/quotesSlice";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
// import { useAppSelector } from "../../store/hook";
// import lightdropdownArrow from "../../assets/icons/lightdropdownArrow.svg";
// import ClosedCard from "../closedCard/ClosedCard";
import MarketCard from "../marketCard/MarketCard";

interface Instrument {
  id: string;
  name: string;
  trading_name: string;
  feeding_name: string;
  icon: string;
  overnight_margin_time: string;
  static_category_id: string;
  static_data: Record<string, string | number>;
  timings: string;
  dinamic_category_ids?: { id: string; history_interval: number }[];
}

interface DropdownProps {
  categoryName: string;
  instruments: Instrument[];
  addedCount: number;
  totalCount: number;
}

const Dropddown = ({ instruments }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  //   const dispatch = useDispatch();

  const listVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easeInOut,
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, y: 10 },
    open: { opacity: 1, y: 0 },
  };
  //   const theme = useAppSelector((state) => state.theme.mode);
  instruments.length = 10;
  return (
    <>
      <button
        className={`btn h-[49px] w-full bg-cardBg outline-none flex justify-between items-center px-4 mt-4 ${
          isOpen ? "rounded-t-10 rounded-b-none" : "rounded-10"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: "#f9f9f9", boxShadow: "none", border: "none" }}
      >
        {/* ------ Over Dropdown ------ */}
        <div className="w-full flex justify-between items-center font-primary text-primary">
          <div className="flex items-center gap-2.5">
            <img src={cardIcon} alt="cardIcon" />
            <h2 className="my-1 font-secondary">EURUSD</h2>
          </div>

          <div className="text-right text-profit font-secondary pr-1.5">
            +$0.58
          </div>
        </div>
        {/* ------- */}

        <motion.img
          src={downArrow}
          alt="downArrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="dropdown menu w-full shadow-sm p-0 max-w-[390px] overflow-hidden border border-t-0 border-tertiary"
            variants={listVariants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{ position: "relative" }}
          >
            {instruments.length > 0 ? (
              Array.from({ length: 10 }).map((_, index) => (
                <motion.li
                  className="border-b border-tertiary last:border-b-0"
                  key={index}
                  variants={itemVariants}
                >
                  <a
                    className="flex items-center justify-between"
                    style={{ display: "block" }}
                  >
                    <MarketCard
                      key={index}
                      code={`EUR/GBP ${index}`}
                      bid={1678.256369}
                      ask={1078.256369}
                      high={253659}
                      low={235698}
                      ltp={30}
                      close={23.22}
                      pip={"5asa"}
                      timestamp={"15:23:00"}
                      border={false}
                      onClick={function (): void {
                        throw new Error("Function not implemented.");
                      }}
                      // active={active}
                      // favourites={isFlag.favourites?.status}
                    />
                  </a>
                </motion.li>
              ))
            ) : (
              <motion.li
                className="p-4 text-center text-secondary"
                variants={itemVariants}
              >
                No instruments found.
              </motion.li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dropddown;
