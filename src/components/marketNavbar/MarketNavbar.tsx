import { useLocation, useOutletContext } from "react-router-dom";
import filter from "../../assets/icons/filter.svg";
import type { OutletContextType } from "../../layout/MainLayout";
import { useEffect, useRef } from "react";

interface MarketsNavbarProps {
  active: string;
  setActive: (tab: string) => void;
  favourite?: boolean;
  tabs: string[];
  paddingLeft?: string;
  paddingRight?: string;
  marginBottom?: string;
  marginTop?: string;
}

export default function MarketsNavbar({
  active,
  setActive,
  favourite,
  tabs,
  paddingLeft = "10px",
  paddingRight = "10px",
  marginBottom,
  marginTop,
}: MarketsNavbarProps) {
  const { isFlag } = useOutletContext<OutletContextType>();
  const { pathname } = useLocation();
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const visibleTabs =
    favourite === true ? tabs.filter((tab) => tab !== "Favorites") : tabs;

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth", // Use smooth scrolling for a better UX
        inline: "center", // Center the active tab in the visible area
        block: "nearest",
      });
    }
  }, [active]); // Dependency array: run this effect whenever the active tab changes
  return (
    <>
      <div
        className="w-full h-[40px] bg-primaryBg flex items-center gap-2"
        style={{
          marginTop,
          marginBottom,
          // position: "fixed",
          // top: "56px",
          // zIndex: 1000,
        }}
      >
        <div className="flex items-center overflow-x-auto no-scrollbar">
          {/* Tabs container */}
          <div
            className="flex space-x-10"
            style={{ paddingLeft, paddingRight }}
          >
            {visibleTabs.map((tab) => {
              const isActive = active === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  // ⬅️ 3. Conditionally assign the ref to the active button
                  ref={isActive ? activeTabRef : null}
                  className={`whitespace-nowrap transition-all ${
                    isActive ? "text-white font-secondary" : "text-[#505050]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {pathname === "/app/home" && !isFlag.favourites.status && (
          <img src={filter} alt="filter" />
        )}
      </div>
    </>
  );
}
