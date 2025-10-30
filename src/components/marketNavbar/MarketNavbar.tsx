// import { useState } from "react";
import filter from "../../assets/icons/filter.svg";

interface MarketsNavbarProps {
  active: string;
  setActive: (tab: string) => void;
  favourite?: boolean;
}

const tabs = ["Favorites", "Forex", "Crypto", "Indices", "Stocks", "Metals"];

export default function MarketsNavbar({
  active,
  setActive,
  favourite,
}: MarketsNavbarProps) {
  // Filter out "Favorites" when active is "Favorites"
  const visibleTabs =
    favourite === true ? tabs.filter((tab) => tab !== "Favorites") : tabs;

  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex items-center overflow-x-auto no-scrollbar">
        {/* Tabs */}
        <div className="flex space-x-7 px-2.5 py-5">
          {visibleTabs.map((tab) => {
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`whitespace-nowrap transition-all ${
                  active === tab
                    ? "text-white font-secondary"
                    : "text-[#505050]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {active !== "Favorites" ? <img src={filter} alt="filter" /> : ""}
    </div>
  );
}
