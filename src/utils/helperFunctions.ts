import { useEffect, useRef } from "react";

// ✅ NEW: Rewritten helper to format price based on pip value
export interface FormattedPrice {
  isPipFormatted: boolean;
  main: string;
  pipsOrSmall: string; // This will hold 'pips' for pip-style or 'small' for original-style
  small: string;
}
export const formatPrice = (price: number, pip?: number | string): FormattedPrice => {
  // console.log("formatPrice called with price:", price, "and pip:", pip);
  if (price === 0)
    return { isPipFormatted: false, main: "0.00", pipsOrSmall: "", small: "" };

  const pipValue = typeof pip === "string" ? parseFloat(pip) : pip;

  // Pip-specific logic: Only apply if pipValue is a valid number less than 0.1
  if (pipValue && !isNaN(pipValue) && pipValue < 0.1) {
    const priceStr = price.toString();
    const parts = priceStr.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1] || "";
    const pipDecimalPlaces = Math.round(Math.log10(1 / pipValue));

    // Check if there are enough decimal places to apply pip formatting
    if (decimalPart.length >= pipDecimalPlaces - 2) {
      const normalDecimalPlaces = pipDecimalPlaces - 2;
      return {
        isPipFormatted: true,
        main: `${integerPart}.${decimalPart.slice(0, normalDecimalPlaces)}`,
        pipsOrSmall: decimalPart.slice(normalDecimalPlaces, pipDecimalPlaces),
        small: decimalPart.slice(pipDecimalPlaces),
      };
    }
  }

  // Fallback to original logic if pip formatting is not applicable
  // Fallback to original logic if pip formatting is not applicable
  const priceStr = price.toString();
  const parts = priceStr.split(".");
  
  // Handle integers or limited decimals
  if (parts.length === 1) {
    return {
      isPipFormatted: false,
      main: `${parts[0]}.00`,
      pipsOrSmall: "",
      small: "",
    };
  }
  
  const decimals = parts[1];
  const mainDecimals = decimals.slice(0, 2);
  const restDecimals = decimals.slice(2);

  // Ensure consistent 2 decimal display for "main" even if input has only 1 decimal (e.g. 1.5 -> 1.50)
  const formattedMainDecimals = mainDecimals.length < 2 ? mainDecimals.padEnd(2, "0") : mainDecimals;

  return {
    isPipFormatted: false,
    main: `${parts[0]}.${formattedMainDecimals}`,
    pipsOrSmall: restDecimals,
    small: "",
  };
};



export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
