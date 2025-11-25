import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useAppSelector } from "../../store/hook";

interface RadioButtonProps {
  isChecked: boolean;
  onClick: () => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ isChecked, onClick }) => {
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <motion.div
      className={`rounded-full cursor-pointer flex items-center justify-center transition-colors duration-200 w-[16px] h-[16px]`}
      onClick={onClick}
      // Framer Motion for a subtle press effect
      whileTap={{ scale: 0.95 }}
      // Tailwind border classes are easier, but custom style for thickness
      style={{
        borderColor: theme === "dark" ? "#AEED09" : "#00B22D",
        borderWidth: isChecked ? 0 : "1px",
        backgroundColor:
          theme === "dark"
            ? isChecked
              ? "#AEED09"
              : "#181818"
            : isChecked
            ? "#00B22D"
            : "#E5E5E5",
      }}
    >
      {/* Checkmark icon (only visible when checked) */}
      {isChecked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check
            size={12}
            className={`${
              theme === "dark" ? "text-[#121212]" : "text-[#fafafa]"
            } font-extrabold`}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default RadioButton;
