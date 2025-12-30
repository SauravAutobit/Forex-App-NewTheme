import { useState } from "react";
import dropdownArrow from "../../assets/icons/dropdownArrow.svg";
import plus from "../../assets/icons/plus.svg";
import type { Instrument } from "../../store/slices/instrumentsSlice";
import { useDispatch } from "react-redux";
import { addInstrumentToQuotes } from "../../store/slices/quotesSlice";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { useAppSelector } from "../../store/hook";
import lightdropdownArrow from "../../assets/icons/lightdropdownArrow.svg";

interface DropdownProps {
  categoryName: string;
  instruments: Instrument[];
  addedCount: number;
  totalCount: number;
}

const Dropddown = ({
  categoryName,
  instruments,
  addedCount,
  totalCount,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const handlePlusClick = (instrument: Instrument) => {
    dispatch(addInstrumentToQuotes(instrument));
  };

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
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <>
      <button
        className={`btn h-[44px] w-full bg-secondaryBg outline-none flex justify-between items-center px-4 mt-4 ${
          isOpen ? "rounded-t-10 rounded-b-none" : "rounded-10"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: "#f9f9f9", boxShadow: "none", border: "none" }}
      >
        <div className="font-primary text-primary">
          {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
          <span className="text-secondary ml-5 text-sm">
            {addedCount}/{totalCount}
          </span>
        </div>
        <motion.img
          src={theme === "dark" ? dropdownArrow : lightdropdownArrow}
          alt="dropdownArrow"
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
              instruments.map((instrument) => (
                <motion.li
                  className="border-b border-tertiary last:border-b-0"
                  key={instrument.id}
                  variants={itemVariants}
                >
                  <a className="flex items-center justify-between">
                    <div className="flex flex-col gap-3">
                      <div className="text-primary">
                        {instrument.name.toUpperCase()}
                      </div>
                      <p className="text-xs text-secondary">
                        {instrument.feeding_name}
                      </p>
                    </div>
                    <div
                      onClick={() => handlePlusClick(instrument)}
                      className="bg-profit w-6 h-6 rounded-40 flex items-center justify-center cursor-pointer"
                    >
                      <img src={plus} alt="plus" />
                    </div>
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
