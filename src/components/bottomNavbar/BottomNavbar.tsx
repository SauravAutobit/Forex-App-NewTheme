import { NavLink } from "react-router-dom";
import home from "../../assets/icons/home.svg";
import trade from "../../assets/icons/trade.svg";
import history from "../../assets/icons/history.svg";
import general from "../../assets/icons/general.svg";
import profile from "../../assets/icons/profile.svg";
import homeSelected from "../../assets/icons/homeSelected.svg";

import tradeSelected from "../../assets/icons/tradeSelected.svg";

import historySelected from "../../assets/icons/historySelected.svg";

import generalSelected from "../../assets/icons/generalSelected.svg";

import profileSelected from "../../assets/icons/profileSelected.svg";

import { useState } from "react";
// import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
// import type { DrawerState, IsFlagType } from "../../layout/MainLayout";
// import { useAppSelector } from "../../store/hook";

const navLinks = [
  { to: "home", label: "Home", icon: home, selectedIcon: homeSelected },
  { to: "trade", label: "Trade", icon: trade, selectedIcon: tradeSelected },
  {
    to: "history",
    label: "History",
    icon: history,
    selectedIcon: historySelected,
  },
  {
    to: "general",
    label: "General",
    icon: general,
    selectedIcon: generalSelected,
  },
  {
    to: "profile",
    label: "Profile",
    icon: profile,
    selectedIcon: profileSelected,
  },
];

// interface BottomNavbarProps {
//   setIsFlag: Dispatch<SetStateAction<IsFlagType>>;
//   isDrawerOpen: DrawerState;
// }

export default function BottomNavbar() {
  //   const theme = useAppSelector((state) => state.theme.mode);
  const [drawer] = useState(false);

  // Whenever isDrawerOpen changes, check if any drawer is open
  //   useEffect(() => {
  //     if (
  //       isDrawerOpen.chartDrawer ||
  //       isDrawerOpen.positonCardDrawer ||
  //       isDrawerOpen.quotesDrawer
  //     ) {
  //       setDrawer(true);
  //     } else {
  //       setDrawer(false);
  //     }
  //   }, [isDrawerOpen]);

  return (
    <>
      {/* Backdrop when drawer is open */}
      {!drawer && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-primaryBg z-40 p-2 max-w-[390px] h-[66px] mx-auto"
          style={{
            borderTop: "1px solid #5454584A",
            //   theme === "dark" ? "1px solid #5454584A" : "1px solid #c2c2c2",
          }}
        >
          <div className="max-w-2xl mx-auto flex justify-between">
            {navLinks.map(({ to, label, icon, selectedIcon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center text-xs py-1 px-2 gap-1 ${
                    isActive ? "text-quaternary" : "text-disabledBottom"
                  }`
                }
                // onClick={() =>
                //   setIsFlag((prev: IsFlagType) => ({
                //     ...prev,
                //     quotes: { add: false, edit: false, delete: false },
                //     trades: { upDown: false },
                //     drawer: {
                //       newOrder: false,
                //       depthOfMarket: false,
                //       marketStatistics: false,
                //       properties: false,
                //       closePosition: false,
                //       modifyPosition: false,
                //       openOrders: false,
                //     },
                //   }))
                // }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={isActive && selectedIcon ? selectedIcon : icon}
                      alt={label}
                      width={20}
                      height={20}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      {/* Bottom Nav */}
    </>
  );
}
