
import { useState, useEffect, useRef } from "react";

export default function useLocalStorage<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    try {
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error("Failed to parse stored value:", error);
      return defaultValue;
    }
  });

  const keyRef = useRef(key);

  useEffect(() => {
    // If key changes, load the new value
    if (keyRef.current !== key) {
      const storedValue = localStorage.getItem(key);
      try {
        const parsedValue = storedValue ? JSON.parse(storedValue) : defaultValue;
        setState(parsedValue);
      } catch (error) {
        console.error("Failed to parse stored value on key change:", error);
        setState(defaultValue);
      }
      keyRef.current = key;
      return; // Skip saving on this cycle
    }

    // Only save if the state matches the current key
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [key, state, defaultValue]);

  return [state, setState] as const;
}