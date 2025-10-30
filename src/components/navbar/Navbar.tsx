import { useState } from "react";
import filter from "../../assets/icons/filter.svg";

const tabs = ["Favorites", "Forex", "Crypto", "Indices", "Stocks", "Metals"];

export default function MarketsNavbar() {
  const [active, setActive] = useState("Favorites");

  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex items-center overflow-x-auto no-scrollbar">
        {/* Tabs */}
        <div className="flex space-x-7 px-2.5 py-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`whitespace-nowrap transition-all ${
                active === tab ? "text-white font-secondary" : "text-[#505050]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <img src={filter} alt="filter" />
    </div>
  );
}
