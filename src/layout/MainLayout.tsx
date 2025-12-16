import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNavbar from "../components/bottomNavbar/BottomNavbar";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import useLocalStorage from "../utils/useLocalStorage";
// import { initializeSockets } from "../services/socketService.ts";
// import { store } from "../store/store";

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

  useEffect(() => {
    if (pathname === "/app/home") {
      setActive("Favorites");
    } else if (pathname === "/app/charts") {
      setActive("Chart");
    }
  }, [pathname]);

  useEffect(() => {
    const handleOpenSidebar = () => setIsSidebarOpen(true);
    document.addEventListener("openSidebar", handleOpenSidebar);
    return () => document.removeEventListener("openSidebar", handleOpenSidebar);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative text-white bg-primaryBg">
      <Header
        isFlag={isFlag}
        setIsFlag={setIsFlag}
        favoriteItems={favoriteItems}
        setFavoriteItems={setFavoriteItems}
        favouriteInstrument={favouriteInstrument}
        active={active}
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
    </div>
  );
};

export default MainLayout;
