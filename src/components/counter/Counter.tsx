import React, { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hook";
// import { useAppSelector } from "../../store/hook";

interface CounterProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  precision?: number;
  label?: string;
}

const Counter: React.FC<CounterProps> = ({
  initialValue = 0, // Default to 0
  onValueChange,
  min = 0,
  max = Infinity,
  label,
}) => {
  const [value, setValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(String(initialValue));
  const { pathname } = useLocation();

  useEffect(() => {
    setValue(initialValue);
    setInputValue(String(initialValue)); // Set initial value as a string
  }, [initialValue]);

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, min);
    setValue(newValue);
    setInputValue(String(newValue));
    onValueChange?.(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, max);
    setValue(newValue);
    setInputValue(String(newValue));
    onValueChange?.(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = rawValue.replace(/[^0-9]/g, "");
    setInputValue(sanitizedValue);

    if (sanitizedValue === "") {
      setValue(min);
      onValueChange?.(min);
      return;
    }

    const parsedValue = parseInt(sanitizedValue, 10);
    if (!isNaN(parsedValue)) {
      const clampedValue = Math.min(Math.max(parsedValue, min), max);
      if (clampedValue !== value) {
        setValue(clampedValue);
        onValueChange?.(clampedValue);
      }
    }
  };

  const handleBlur = () => {
    const parsedValue = parseInt(inputValue, 10);
    if (isNaN(parsedValue) || parsedValue < min || parsedValue > max) {
      setInputValue(String(value));
    } else {
      setInputValue(String(parsedValue));
    }
  };
  const theme = useAppSelector((state) => state.theme.mode);

  const chartsPage = pathname === "/app/charts";
  return (
    <div>
      {pathname !== "/app/charts" && (
        <div className="mb-1 text-secondary">{label}</div>
      )}
      <div
        className={`flex items-center ${
          chartsPage ? "w-[159px]" : "w-full"
        } rounded-10 overflow-hidden shadow-lg border border-primary`}
      >
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className={`flex items-center justify-center w-12 h-12 disabled:cursor-not-allowed transition-colors duration-200  ${
            theme === "dark" ? "bg-[#242424]" : "bg-[#E1E1E1]"
          }`}
        >
          <Minus
            className={`w-5 h-5 ${
              theme === "dark" ? "text-white" : "text-[#353535]"
            }`}
          />
        </button>

        <div
          className={`flex-1 flex items-center flex-col justify-center px-4 ${
            chartsPage ? "py-1" : "py-3"
          } text-center ${theme === "dark" ? "bg-cardBg" : "bg-[#F1F1F1]"}`}
        >
          {pathname === "/app/charts" && (
            <span className={`text-xs text-primary`}>Price:</span>
          )}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`${
              chartsPage ? "w-[40px]" : "w-1/3"
            } text-center font-medium text-lg bg-transparent outline-none appearance-none ${
              value > 0 ? "text-primary" : "text-disabledBottom"
            }`}
          />
        </div>

        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className={`flex items-center justify-center w-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
            theme === "dark" ? "bg-[#242424]" : "bg-[#E1E1E1]"
          }`}
        >
          <Plus
            className={`w-5 h-5 ${
              theme === "dark" ? "text-white" : "text-[#353535]"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default Counter;
