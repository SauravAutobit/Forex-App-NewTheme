import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface CheckboxProps {
  isChecked: boolean;
  onClick: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ isChecked, onClick }) => {
  return (
    <motion.div
      className={`cursor-pointer flex items-center justify-center transition-colors duration-200 w-[16px] h-[16px]`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        borderRadius: "4px", // square corners (adjust as needed)
        borderColor: "#AEED09",
        borderWidth: isChecked ? 0 : "1px",
        borderStyle: "solid",
        backgroundColor: isChecked ? "#AEED09" : "#181818",
      }}
    >
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

export default Checkbox;
