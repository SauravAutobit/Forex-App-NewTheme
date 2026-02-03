import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../../store/hook";

type ToolOption = {
  label: string;
  value: string;
};

type ToolGroup = {
  category: string;
  options: ToolOption[];
};

interface ToolDropdownProps {
  selectedTool: string;
  onSelect: (toolValue: string) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const ToolDropdown: React.FC<ToolDropdownProps> = ({
  selectedTool,
  onSelect,
  isOpen: propsIsOpen,
  setIsOpen: propsSetIsOpen,
}) => {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : localIsOpen;
  const setIsOpen =
    propsSetIsOpen !== undefined ? propsSetIsOpen : setLocalIsOpen;

  // Categories and options to match TimeframeSelector layout
  const toolGroups: ToolGroup[] = [
    {
      category: "Chart Style",
      options: [
        { label: "Cdl", value: "candlestick" },
        { label: "Area", value: "area" },
      ],
    },
    // We could add more groups here like "Indicators" if needed later
  ];

  const handleSelect = (toolValue: string) => {
    onSelect(toolValue);
    setIsOpen(false);
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
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const theme = useAppSelector((state) => state.theme.mode);

  const buttonClassName = (value: string) =>
    `m-1 rounded-md transition-colors duration-200 w-[60px] h-[40px] flex items-center justify-center
     ${
       value === selectedTool
         ? `bg-quaternary ${
             theme === "dark" ? "text-tertiary" : "text-primary"
           }`
         : "bg-cardBg text-primary border border-primary"
     }`;

  return (
    <div className="dropdown" style={{ position: "relative" }}>
      <button
        className="btn w-[104px] h-[40px] bg-primaryBg border border-primary rounded-10 flex justify-center gap-2.5 items-center px-1 text-primary shadow-lg transition-all"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-primary font-secondary font-bold text-[13px]">
          Tools
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-icon" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown-content z-[1000] mt-8 p-5 shadow-2xl bg-primaryBg border border-primary rounded-20 w-max text-primary"
            variants={listVariants}
            initial="closed"
            animate="open"
            exit="closed"
            // Use translation to truly center relative to the button
            style={{
              position: "absolute",
              left: "30%",
              translateX: "-50%",
              // Clamp it so it doesn't go off screen if button is near edge
              // But for the right button, we might want it shifted left
            }}
          >
            {toolGroups.map((group) => (
              <div key={group.category} className="mb-3 last:mb-0">
                <h4 className="font-secondary mb-2.5 text-primary">
                  {group.category}
                </h4>
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

export default ToolDropdown;
