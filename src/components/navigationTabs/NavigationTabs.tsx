import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProfitLossClose from "../profitLossClose/ProfitLossClose";
import DateChanger from "../dateChanger/DateChanger";
import { useAppSelector } from "../../store/hook";
// import { useAppSelector } from "../../store/hook";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface MobileTabsProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  onActiveTabChange?: (tabId: string) => void; // 👈 NEW
  className?: string;
  activeColor?: string; // Text color for active tab (e.g., 'text-black')
  inactiveColor?: string; // Text color for inactive tabs (e.g., 'text-gray-400')
}

// Define the motion variants for content sliding
const slideVariants = (direction: number) => ({
  // direction: 1 for right movement (exit left, enter right)
  // direction: -1 for left movement (exit right, enter left)
  // Initial position of the new content (comes from the side)
  enter: {
    x: direction > 0 ? 300 : -300, // Starts off-screen to the right or left
    opacity: 0,
    transition: { duration: 0.3 },
  }, // Active state (in the center)
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 },
  }, // Exit position of the old content (goes off to the side)
  exit: {
    x: direction > 0 ? -300 : 300, // Exits to the left or right
    opacity: 0,
    transition: { duration: 0.3 },
  },
});

// NOTE: Removed backgroundColor prop as it's now internally controlled for the segmented look.
const NavigationTabs = ({
  tabs,
  defaultActiveTab,
  onTabChange,
  onActiveTabChange,
  className = "",
  activeColor = "text-[#2D2D2D]", // Changed default to black for better contrast on neon background
  inactiveColor = "text-[#505050]",
}: MobileTabsProps) => {
  const [activeTab, setActiveTab] = useState(
    defaultActiveTab || tabs[0]?.id || ""
  );

  // 🆕 State to track animation direction: 1 (right), -1 (left), 0 (initial/none)
  const [direction, setDirection] = useState(0);
  const previousIndex = useRef(tabs.findIndex((tab) => tab.id === activeTab));

  const isInitialLoad = useRef(true);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]); // To measure button width

  useEffect(() => {
    isInitialLoad.current = false;
    // Initialize refs array
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs]);

  // const handleTabClick = (tabId: string) => {
  //   setActiveTab(tabId);
  //   onTabChange?.(tabId);
  // };

  // const handleTabClick = (tabId: string) => {
  //   const newIndex = tabs.findIndex((tab) => tab.id === tabId);
  //   if (newIndex !== -1) {
  //     // Calculate direction: 1 for forward (right), -1 for backward (left)
  //     const newDirection = newIndex > previousIndex.current ? 1 : -1;
  //     setDirection(newDirection);
  //     previousIndex.current = newIndex; // Update previous index
  //     setActiveTab(tabId);
  //     onTabChange?.(tabId);
  //   }
  // };

  const handleTabClick = (tabId: string) => {
    const newIndex = tabs.findIndex((tab) => tab.id === tabId);

    if (newIndex !== -1) {
      const newDirection = newIndex > previousIndex.current ? 1 : -1;

      setDirection(newDirection);
      previousIndex.current = newIndex;
      setActiveTab(tabId);
      onTabChange?.(tabId);
      onActiveTabChange?.(tabId);
    }
  };

  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
  //   const theme = useAppSelector((state) => state.theme.mode);

  // 🎯 Determine the appropriate background color for the pill container
  //   const containerBg = theme === "dark" ? "bg-gray-800" : "bg-gray-200";

  // 🎯 Define the active indicator color (your neon green/yellow)
  // Ensure this color is defined in your Tailwind config or is a utility class
  //   const indicatorBg = "bg-primary-neon"; // Assuming 'bg-primary-neon' is your bright color
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation Container (The 'Pill' Background) */}

      <div className="px-5">
        <div
          className={`relative flex rounded-10 h-[37px] ${
            theme === "dark" ? "bg-[#181818]" : "bg-[#E5E5E5]"
          }`}
        >
          {/* Active Tab Indicator (The Moving Background) */}
          {tabs[activeTabIndex] && (
            <motion.div
              className={`absolute h-full rounded-10 ${"bg-quaternary"}`}
              style={{ zIndex: 0 }}
              // We use the full width calculation here for dynamic sizing
              initial={false}
              animate={{
                // Calculate the x position (translate) based on the active tab's position
                x: tabRefs.current[activeTabIndex]?.offsetLeft || 0,
                // Set the width based on the active tab's width
                width:
                  tabRefs.current[activeTabIndex]?.offsetWidth ||
                  `${100 / tabs.length}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                duration: 0.2,
              }}
            />
          )}

          {/* Tab Buttons */}
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              // ✅ FIX: Use an explicit function body (curly braces) to ensure nothing is returned.
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex-1  font-medium relative z-10
                transition-colors duration-200 rounded-10
                ${activeTab === tab.id ? activeColor : inactiveColor}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* {activeTab === "market" && <ProfitLossClose />} */}
      {/* {activeTab === "date" && (
        <div className="px-5">
          <DateChanger text={"Change Date"} date={"25/06/2025"} />
        </div>
      )} */}
      {/* {activeTab === "monthly" && (
        <div className="px-5">
          <DateChanger
            text={"Start Date"}
            date={"25/06/2025"}
            dualDate={true}
            height={"82px"}
            secondaryText="End Date"
            secondaryDate="30/06/2025"
          />
        </div>
      )} */}

      {/* Tab Content */}
      <div className="mt-3 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {tabs.map(
            (tab) =>
              tab.id === activeTab && (
                <motion.div
                  key={tab.id} // 👈 key is required for exit animation
                  variants={slideVariants(direction)}
                  initial="enter"
                  animate="center"
                  exit="exit" // Add absolute positioning to stack the exiting/entering content over each other
                  // className="absolute w-full top-0 left-0"
                  // initial={
                  //   isInitialLoad.current ? false : { opacity: 0, y: 10 }
                  // } // starting state
                  // animate={{ opacity: 1, y: 0 }} // enter state
                  // exit={{ opacity: 0, y: -10 }} // exit state
                  // transition={{ duration: 0.25 }} // speed of animation
                >
                  {tab.content}
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NavigationTabs;
