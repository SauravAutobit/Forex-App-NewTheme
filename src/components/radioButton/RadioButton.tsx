import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface CustomRadioButtonProps {
  isChecked: boolean;
  onClick: () => void;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
  isChecked,
  onClick,
}) => {
  return (
    <motion.div
      className={`rounded-full cursor-pointer flex items-center justify-center transition-colors duration-200 w-[16px] h-[16px]`}
      onClick={onClick}
      // Framer Motion for a subtle press effect
      whileTap={{ scale: 0.95 }}
      // Tailwind border classes are easier, but custom style for thickness
      style={{
        borderColor: "#AEED09",
        borderWidth: isChecked ? 0 : "1px",
        backgroundColor: isChecked ? "#AEED09" : "#181818",
      }}
    >
      {/* Checkmark icon (only visible when checked) */}
      {isChecked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check size={12} className="text-[#121212] font-extrabold" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomRadioButton;
