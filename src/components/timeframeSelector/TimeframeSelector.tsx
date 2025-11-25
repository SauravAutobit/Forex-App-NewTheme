import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../../store/hook";

// Define the structure for a single time frame option
type TimeframeOption = {
  label: string;
  value: string; // e.g., '1m', '1h', '1d'
};

// Group options by category (Minutes, Hours, etc.)
export type TimeframeGroup = {
  category: string;
  options: TimeframeOption[];
};

interface TimeframeDropdownProps {
  timeframeGroups: TimeframeGroup[];
  selectedTimeframe: string;
  onSelect: (timeframeValue: string) => void;
}

const TimeframeDropdown: React.FC<TimeframeDropdownProps> = ({
  timeframeGroups,
  selectedTimeframe,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Determine the label to show on the main button
  const selectedLabel = useMemo(() => {
    for (const group of timeframeGroups) {
      const option = group.options.find(
        (opt) => opt.value === selectedTimeframe
      );
      if (option) return option.label;
    }
    return "Timeframe"; // Default text if none is selected or found
  }, [timeframeGroups, selectedTimeframe]);

  const handleSelect = (timeframeValue: string) => {
    onSelect(timeframeValue);
    setIsOpen(false);
  };

  // --- Animation Variants (Copied from InstrumentDropdown) ---
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
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const theme = useAppSelector((state) => state.theme.mode);

  // Common styling for the grid buttons
  const buttonClassName = (value: string) =>
    `m-1 rounded-md transition-colors duration-200 w-[40px] h-[40px] 
     ${
       value === selectedTimeframe
         ? `bg-quaternary ${
             theme === "dark" ? "text-tertiary" : "text-primary"
           }`
         : "bg-cardBg text-primary border border-primary"
     }`;

  return (
    <div className="dropdown">
      <button
        // Using the same styling from InstrumentDropdown button
        className="btn w-[104px] h-[40px] bg-primaryBg border border-primary rounded-10 flex justify-center gap-2.5 items-center px-2.5 text-primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="text-primary font-secondary">{selectedLabel}</div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-icon" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div // Use div for the main container instead of ul/menu
            className="dropdown-content z-[1] mt-8 p-5 shadow-2xl bg-primaryBg border border-primary rounded-20 w-max max-w-sm text-primary"
            variants={listVariants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{ position: "absolute", right: "-100px" }}
          >
            {/* --- Timeframe Grid Content (Adapted from TimeframeSelector) --- */}
            {timeframeGroups.map((group) => (
              <div key={group.category} className="mb-3 last:mb-0">
                <h4 className="font-secondary mb-2.5">{group.category}</h4>
                <div className="flex flex-wrap gap-1">
                  {group.options.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={buttonClassName(option.value)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeframeDropdown;
