import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNavbar from "../components/bottomNavbar/BottomNavbar";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import useLocalStorage from "../utils/useLocalStorage";
import OrderStatus from "../components/orderStatus/OrderStatus";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { hideToasty } from "../store/slices/notificationSlice";

export type DrawerState = {
  homeDrawer: boolean;
  tradeMarketDrawer: boolean;
  chartDrawer: boolean;
};

export type IsFlagType = {
  favourites: {
    status: boolean;
  };
  charts: {
    status: boolean;
  };
  newOrder: {
    status: boolean;
  };
  marketEdit: {
    status: boolean;
  };
  pendingEdit: {
    status: boolean;
  };
  closedEdit: {
    status: boolean;
  };
  editHistory: {
    status: boolean;
  };
};

export type OutletContextType = {
  setIsSidebarOpen: (isOpen: boolean) => void;
  isFlag: IsFlagType;
  setIsFlag: React.Dispatch<React.SetStateAction<IsFlagType>>;
  favoriteItems: Array<{
    id: string;
    code: string;
    bid: number;
    ask: number;
    high: number;
    low: number;
    ltp: number;
    close: number;
    pip: string;
    timestamp: string;
  }>;
  setFavoriteItems: React.Dispatch<
    React.SetStateAction<
      Array<{
        id: string;
        code: string;
        bid: number;
        ask: number;
        high: number;
        low: number;
        ltp: number;
        close: number;
        pip: string;
        timestamp: string;
      }>
    >
  >;
  active: string;
  setActive: (tab: string) => void;
  isDrawerOpen: DrawerState;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<DrawerState>>;
  favouriteInstrument: string[];
  setFavouriteInstrument: React.Dispatch<React.SetStateAction<string[]>>;
};

const MainLayout = () => {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFlag, setIsFlag] = useLocalStorage<IsFlagType>("appState", {
    favourites: {
      status: false,
    },
    charts: { status: false },
    newOrder: { status: false },
    marketEdit: { status: false },
    pendingEdit: { status: false },
    closedEdit: { status: false },
    editHistory: { status: false },
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState<DrawerState>({
    homeDrawer: false,
    tradeMarketDrawer: false,
    chartDrawer: false,
  });

  const [active, setActive] = useState("Favorites");

  // ⭐️ NEW: State for the list of favorite instruments
  const [favoriteItems, setFavoriteItems] = useLocalStorage<
    Array<{
      id: string;
      code: string;
      bid: number;
      ask: number;
      high: number;
      low: number;
      ltp: number;
      close: number;
      pip: string;
      timestamp: string;
    }>
  >("favoriteItems", []);

  const [favouriteInstrument, setFavouriteInstrument] = useState<string[]>([]);

  const { data: categories } = useSelector(
    (state: RootState) => state.categories,
  );

  // Handle initial tab selection on mount based on favorites or previous history
  useEffect(() => {
    if (categories.length > 0) {
      const prev = localStorage.getItem("previousCategory");
      if (
        prev &&
        categories.some(
          (c) => c.toLowerCase() === prev.toLowerCase() || prev === "Favorites",
        )
      ) {
        setActive(prev);
      } else if (favoriteItems.length === 0) {
        // No favorites - set first category as active
        const firstCategory =
          categories[0].charAt(0).toUpperCase() + categories[0].slice(1);
        setActive(firstCategory);
      } else {
        // Has favorites - set Favorites as active
        setActive("Favorites");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]); // Only run when categories are first loaded

  // Handle tab changes when navigating to different pages
  useEffect(() => {
    const chartTabs = [
      "Chart",
      "Overview",
      "Calendar",
      "Info",
      "Positions",
      "Orders",
    ];

    if (pathname === "/app/charts") {
      // Only set to "Chart" if current active tab is not one of the chart-related tabs
      if (!chartTabs.includes(active)) {
        setActive("Chart");
      }
    } else if (
      (pathname === "/app/home" || pathname === "/app") &&
      chartTabs.includes(active)
    ) {
      // ✅ Restore previous category if coming back from Chart/Trade flow
      const prev = localStorage.getItem("previousCategory");
      if (prev) {
        setActive(prev);
      } else {
        setActive("Favorites");
      }
    }
  }, [pathname, active]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUndoEvent = (e: any) => {
      handleUndo(e.detail);
    };
    window.addEventListener("undo-favourite", handleUndoEvent);
    return () => window.removeEventListener("undo-favourite", handleUndoEvent);
  }, [favoriteItems]); // Re-bind if needed, though handleUndo is stable-ish

  const dispatch = useDispatch();

  useEffect(() => {
    const handleOpenSidebar = () => setIsSidebarOpen(true);
    document.addEventListener("openSidebar", handleOpenSidebar);
    return () => document.removeEventListener("openSidebar", handleOpenSidebar);
  }, []);

  // ✅ UNDO Logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUndo = (item: any) => {
    if (!item) return;

    // Restore item to local state
    setFavoriteItems((prev) => {
      // Avoid duplicates just in case
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });

    setFavouriteInstrument((prev) => {
      if (prev.includes(item.code)) return prev;
      return [...prev, item.code];
    });

    // Close toasty
    dispatch(hideToasty());
  };

  return (
    <div className="min-h-screen flex flex-col relative text-white bg-primaryBg">
      <Header
        isFlag={isFlag}
        setIsFlag={setIsFlag}
        favoriteItems={favoriteItems}
        setFavoriteItems={setFavoriteItems}
        favouriteInstrument={favouriteInstrument}
        setFavouriteInstrument={setFavouriteInstrument}
        active={active}
        setActive={setActive}
        setIsDrawerOpen={setIsDrawerOpen}
      />
      <main
        id="#main-content"
        className="flex-1 py-14 overflow-y-auto bg-primaryBg scroll-smooth"
      >
        <Outlet
          context={{
            setIsSidebarOpen,
            isFlag,
            setIsFlag,
            favoriteItems,
            setFavoriteItems,
            active,
            setActive,
            isDrawerOpen,
            setIsDrawerOpen,
            favouriteInstrument,
            setFavouriteInstrument,
          }}
        />
      </main>

      <BottomNavbar setIsFlag={setIsFlag} isDrawerOpen={isDrawerOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <OrderStatus />
    </div>
  );
};

export default MainLayout;
