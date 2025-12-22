import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import cross from "../../assets/icons/cross.svg";
import checkboxTick from "../../assets/icons/checkboxTick.svg";

interface CustomToggleSwitchProps {
  isOn: boolean;
  handleToggle: () => void;
  // Optional: allows overriding the default size
  size?: "sm" | "md" | "lg";
}

const ToggleCheckbox: React.FC<CustomToggleSwitchProps> = ({
  isOn,
  handleToggle,
  //   size = "md",
}) => {
  // console.log("isO", isOn);
  // Define dimensions based on size prop
  //   const sizes = {
  //     sm: { width: "w-[40px]", height: "h-[22px]", knob: "w-4 h-4", icon: 12 },
  //     md: { width: "w-[56px]", height: "h-[30px]", knob: "w-6 h-6", icon: 18 }, // Closest to your video/image
  //     lg: { width: "w-[72px]", height: "h-[36px]", knob: "w-8 h-8", icon: 20 },
  //   };

  //   const { width, height, knob, icon } = sizes[size];

  //   const width = "44px";
  //   const height = "22px";
  // Base classes for the whole switch
  const switchBaseClass = `relative flex items-center p-[2px] cursor-pointer transition-colors duration-300 ease-in-out w-[44px] h-[22px]`;

  return (
    <div className={`${switchBaseClass}`} onClick={handleToggle}>
      {/* This is the main moving knob/square. 
        It slides from left (inactive) to right (active).
      */}
      <motion.div
        className={`absolute rounded-md shadow-md flex items-center justify-center`}
        // Motion properties to control position and color
        initial={false}
        animate={{
          x: isOn ? "100%" : "0%", // Slide position (right for on, left for off)
          //   backgroundColor: isOn ? activeKnobColor : inactiveKnobColor, // Color change
          borderRadius: isOn ? "0.375rem" : "0.375rem", // Keeps square shape
        }}
        transition={{ type: "spring", stiffness: 700, damping: 50 }}
        style={{ originX: 0 }}
      >
        <div
          className={`w-[20px] h-[20px] rounded-[3px] ${
            isOn ? "bg-quaternary" : "bg-[#555454]"
          }`}
        ></div>
      </motion.div>

      {/* Checkmark (Active icon, fixed on the left) */}
      <div
        className={`absolute left-[2px] flex items-center justify-center `}
        // style={{ color: iconColor }}
      >
        <AnimatePresence initial={false}>
          {isOn && (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <img src={checkboxTick} alt="checkboxTick" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* X Icon (Inactive icon, fixed on the right) */}
      <div
        className={`absolute right-[2px] flex items-center justify-center`}
        style={{ color: "white" }}
      >
        <AnimatePresence initial={false}>
          {!isOn && (
            <motion.div
              key="x"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <img src={cross} alt="cross" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ToggleCheckbox;
