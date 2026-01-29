import React, { useState, useEffect, useRef } from "react";
import { DOMAIN_CONFIG } from "../../utils/constants/domainConfig";

interface DomainSelectorProps {
  onSelect: (domainKey: string) => void;
  initialValue?: string | null;
  theme: string;
}

const DomainSelector: React.FC<DomainSelectorProps> = ({
  onSelect,
  initialValue = null,
  theme,
}) => {
  const [inputValue, setInputValue] = useState(initialValue || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const domainKeys = Object.keys(DOMAIN_CONFIG);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = domainKeys.filter((key) =>
        key.toLowerCase().includes(inputValue.toLowerCase()),
      );
      // Only show suggestions if there's a unique match or multiple potential matches
      // and prevent showing suggestions if it's an exact single match already
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (key: string) => {
    setInputValue(key);
    setShowSuggestions(false);
    onSelect(key);
  };

  return (
    <div className="space-y-2 relative" ref={suggestionRef}>
      <label className="font-tertiary text-primary text-sm">Server</label>
      <input
        type="text"
        placeholder="Enter domain (e.g. test, demo)"
        className={`w-full p-3 rounded-lg bg-primaryBg border border-[#3D3D3D] focus:outline-none placeholder-placeholder text-primary`}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue && setShowSuggestions(true)}
        required
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul
          className={`absolute z-[100] w-full mt-1 border border-[#3D3D3D] rounded-lg shadow-xl overflow-hidden ${
            theme === "dark" ? "bg-[#1A1D27]" : "bg-white"
          }`}
        >
          {suggestions.slice(0, 3).map((key) => (
            <li
              key={key}
              className={`p-3 cursor-pointer hover:bg-quaternary hover:text-black transition-colors ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
              onClick={() => handleSelectSuggestion(key)}
            >
              <div className="font-secondary">{key}</div>
              <div className="text-xs opacity-60">{DOMAIN_CONFIG[key].api}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DomainSelector;
