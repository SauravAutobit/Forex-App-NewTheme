import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNavbar from "../components/bottomNavbar/BottomNavbar";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import useLocalStorage from "../utils/useLocalStorage";
import OrderStatus from "../components/orderStatus/OrderStatus";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import Toasty from "../components/toasty/Toasty";
import { AnimatePresence, motion } from "framer-motion";
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
    (state: RootState) => state.categories
  );

  // Handle initial tab selection on mount based on favorites
  useEffect(() => {
    // Only run once on initial mount when categories are loaded
    if (categories.length > 0) {
      if (favoriteItems.length === 0) {
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
    if (pathname === "/app/charts") {
      setActive("Chart");
    } else if (
      (pathname === "/app/home" || pathname === "/app") &&
      active === "Chart"
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

  // ✅ NEW: Get Toasty state from Redux
  const { isVisible, data } = useSelector(
    (state: RootState) => state.notification
  );

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

  const handleDeleteSelected = () => {
    // Current app doesn't seem to use this, but keeping it as user referenced it
    // Or implementing it if needed.
    // The user's snippet had it, so I'll include an empty placeholder or basic logic if relevant.
    // Since selectedQuotesForDelete isn't in this version's state, I'll omit it to avoid errors.
  };

  return (
    <div className="min-h-screen flex flex-col relative text-white bg-primaryBg">
      <AnimatePresence>
        {isVisible && data && (
          <>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-[75px] left-0 right-0 z-50 flex justify-center" // Adjust bottom position to clear BottomNavbar
            >
              <Toasty onUndo={handleUndo} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
