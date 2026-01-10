import React, { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hook";

interface CounterProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  step?: number;
}

const Counter: React.FC<CounterProps> = ({
  initialValue = 0,
  onValueChange,
  min = 0,
  max = Infinity,
  label,
  step,
}) => {
  // Dynamic precision based on step (Admin/Old App logic)
  const getPrecision = (s: number) => {
    if (!s || s >= 1) return 2;
    const sStr = s.toString();
    if (sStr.includes(".")) {
      return sStr.split(".")[1].length;
    }
    return 2;
  };

  const precision = getPrecision(step || 0.01);

  const [value, setValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(
    initialValue === 0 && label ? "" : initialValue.toFixed(precision)
  );
  const { pathname } = useLocation();
  const theme = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    setValue(initialValue);
    setInputValue(
      initialValue === 0 && label ? "" : initialValue.toFixed(precision)
    );
  }, [initialValue, label, precision]);

  // App Logic: Rounding to 10 decimal places to prevent floating point errors
  const roundToDecimal = (num: number) =>
    Math.round(num * 10000000000) / 10000000000;

  const handleUpdate = (newValue: number) => {
    const clampedValue = Math.min(Math.max(newValue, min), max);
    const finalValue = roundToDecimal(clampedValue);

    if (finalValue !== value) {
      setValue(finalValue);
      const displayString =
        finalValue === 0 && label ? "" : finalValue.toFixed(precision);
      setInputValue(displayString);
      onValueChange?.(finalValue);
    }
  };

  const handleDecrement = () => {
    if (step !== undefined) {
      handleUpdate(value - step);
    }
  };

  const handleIncrement = () => {
    if (step !== undefined) {
      handleUpdate(value + step);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    const parsedValue = parseFloat(rawValue);
    if (!isNaN(parsedValue)) {
      const clampedAndRounded = roundToDecimal(
        Math.min(Math.max(parsedValue, min), max)
      );
      setValue(clampedAndRounded);
      onValueChange?.(clampedAndRounded);
    } else if (rawValue === "" || rawValue === ".") {
      setValue(0);
      onValueChange?.(0);
    }
  };

  const handleBlur = () => {
    let parsedValue = parseFloat(inputValue);
    if (isNaN(parsedValue)) {
      parsedValue = value;
    }

    const finalValue = roundToDecimal(
      Math.min(Math.max(parsedValue, min), max)
    );

    setValue(finalValue);
    setInputValue(finalValue.toFixed(precision));
    onValueChange?.(finalValue);
  };

  const chartsPage = pathname === "/app/charts";
  const buttonsDisabled = step === undefined || step <= 0;

  return (
    <div>
      {pathname !== "/app/charts" && label && (
        <div className="mb-1 text-secondary">{label}</div>
      )}
      <div
        className={`flex items-center ${
          chartsPage ? "w-[159px]" : "w-full"
        } rounded-10 overflow-hidden shadow-lg border border-primary`}
      >
        <button
          onClick={handleDecrement}
          disabled={
            buttonsDisabled || roundToDecimal(value - (step || 0)) < min
          }
          // w-12
          className={`flex items-center justify-center w-10 h-12 disabled:cursor-not-allowed transition-colors duration-200  ${
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
            <span className={`text-xs text-primary`}>Vol</span>
          )}
          <input
            type="number"
            step={step}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`${
              chartsPage ? "w-[40px]" : "w-full"
            } text-center font-medium text-lg bg-transparent outline-none appearance-none placeholder-gray-400 ${
              value > 0 ? "text-primary" : "text-disabledBottom"
            }`}
            style={{ MozAppearance: "textfield" }}
            placeholder={label}
          />
        </div>

        <button
          onClick={handleIncrement}
          disabled={
            buttonsDisabled || roundToDecimal(value + (step || 0)) > max
          }
          // w-12
          className={`flex items-center justify-center w-10 h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
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
