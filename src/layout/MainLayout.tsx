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
// import OrderButtons from "../components/orderButtons/OrderButtons";
import NewOrderButtons from "../components/newOrderButtons/NewOrderButtons";
import ChartButtons from "../components/chartButtons/ChartButtons";
import TradeButtons from "../components/tradeButtons/TradeButtons";

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

export type NewOrderData = {
  metrics: {
    usedMargin: number;
    freeMargin: number;
  };
  instrumentId: string | null;
  selectedOrderType: "market" | "limit" | "stop";
  contractSize: number | null;
  selectedLot: number;
  orderPrice: number | null;
  stoploss: number;
  target: number;
  mode: "newOrder" | "closePosition" | "modifyPosition";
  originalSide?: "buy" | "sell";
  positionIdToClose?: string;
};

export type ChartButtonsData = {
  handlePlaceOrder: (side: "buy" | "sell") => void;
  volume: number;
  setVolume: (v: number) => void;
  step: number;
  min: number;
};

export type TradeButtonConfig = {
  label: string;
  onClick: () => void;
  bgColor?: string;
  textColor?: string;
  border?: string;
  fontWeight?: number;
  textShadow?: string;
};

export type TradeButtonsData = {
  leftButton?: TradeButtonConfig;
  rightButton?: TradeButtonConfig;
};

export type FavoriteItem = {
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
  icon: string;
};

export type OutletContextType = {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFlag: IsFlagType;
  setIsFlag: React.Dispatch<React.SetStateAction<IsFlagType>>;
  favoriteItems: FavoriteItem[];
  setFavoriteItems: React.Dispatch<React.SetStateAction<FavoriteItem[]>>;
  active: string;
  setActive: React.Dispatch<React.SetStateAction<string>>;
  isDrawerOpen: DrawerState;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<DrawerState>>;
  favouriteInstrument: any;
  setFavouriteInstrument: React.Dispatch<React.SetStateAction<any>>;
  newOrderData: NewOrderData | null;
  setNewOrderData: React.Dispatch<React.SetStateAction<NewOrderData | null>>;
  chartButtonsData: ChartButtonsData | null;
  setChartButtonsData: React.Dispatch<
    React.SetStateAction<ChartButtonsData | null>
  >;
  tradeButtonsData: TradeButtonsData | null;
  setTradeButtonsData: React.Dispatch<
    React.SetStateAction<TradeButtonsData | null>
  >;
};

const MainLayout = () => {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  // ⭐️ NEW: Derived storage keys based on username
  const favItemsKey = user ? `favoriteItems_${user.username}` : "favoriteItems";
  const favStateKey = user ? `appState_${user.username}` : "appState";

  const [isFlag, setIsFlag] = useLocalStorage<IsFlagType>(favStateKey, {
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

  // ⭐️ NEW: State for the list of favorite instruments - account specific
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
      icon: string;
    }>
  >(favItemsKey, []);

  const [favouriteInstrument, setFavouriteInstrument] = useState<string[]>([]);

  const instruments = useSelector((state: RootState) => state.instruments);
  const instrumentsData = instruments.data;

  // ✅ Initialize favouriteInstrument from persisted favoriteItems
  useEffect(() => {
    setFavouriteInstrument(favoriteItems.map((f) => f.code));
  }, [favoriteItems]);

  // ✅ Filter favorites against available instruments
  // This ensures that if an instrument is deleted, it's removed from favorites
  useEffect(() => {
    const allInstruments = Object.values(instrumentsData).flat();
    if (allInstruments.length > 0 && favoriteItems.length > 0) {
      const availableIds = new Set(allInstruments.map((i) => i.id));
      const filteredItems = favoriteItems.filter((item) =>
        availableIds.has(item.id),
      );

      if (filteredItems.length !== favoriteItems.length) {
        console.log("🧹 Cleanup: Removing orphans from favorites");
        setFavoriteItems(filteredItems);
        setFavouriteInstrument(filteredItems.map((f) => f.code));
      }
    }
  }, [instrumentsData, favoriteItems, setFavoriteItems]);

  // State for NewOrder data
  const [newOrderData, setNewOrderData] = useState<NewOrderData | null>(null);

  // State for Chart buttons data
  const [chartButtonsData, setChartButtonsData] =
    useState<ChartButtonsData | null>(null);
  const [tradeButtonsData, setTradeButtonsData] =
    useState<TradeButtonsData | null>(null);

  const { data: categories } = useSelector(
    (state: RootState) => state.categories,
  );

  // Handle initial tab selection on mount based on favorites or previous history
  useEffect(() => {
    if (categories.length > 0) {
      const prevCategoryKey = user
        ? `previousCategory_${user.username}`
        : "previousCategory";
      const prev = localStorage.getItem(prevCategoryKey);
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

    const prevCategoryKey = user
      ? `previousCategory_${user.username}`
      : "previousCategory";
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
      const prev = localStorage.getItem(prevCategoryKey);
      if (prev) {
        setActive(prev);
      } else {
        setActive("Favorites");
      }
    }
  }, [pathname, active, user]);

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
        className="flex-1 overflow-y-auto bg-primaryBg scroll-smooth"
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top))",
          paddingBottom: "calc(66px + env(safe-area-inset-bottom))",
        }}
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
            newOrderData,
            setNewOrderData,
            chartButtonsData,
            setChartButtonsData,
            tradeButtonsData,
            setTradeButtonsData,
          }}
        />
      </main>

      <div className="fixed bottom-0 w-full flex flex-col gap-2.5">
        {pathname === "/app/newOrder" && newOrderData && (
          <NewOrderButtons
            metrics={newOrderData.metrics}
            instrumentId={newOrderData.instrumentId}
            selectedOrderType={newOrderData.selectedOrderType}
            contractSize={newOrderData.contractSize}
            selectedLot={newOrderData.selectedLot}
            orderPrice={newOrderData.orderPrice}
            stoploss={newOrderData.stoploss}
            target={newOrderData.target}
            mode={newOrderData.mode}
            originalSide={newOrderData.originalSide}
            positionIdToClose={newOrderData.positionIdToClose}
          />
        )}
        {pathname === "/app/charts" && chartButtonsData && (
          <ChartButtons
            handlePlaceOrder={chartButtonsData.handlePlaceOrder}
            volume={chartButtonsData.volume}
            setVolume={chartButtonsData.setVolume}
            step={chartButtonsData.step}
            min={chartButtonsData.min}
          />
        )}
        {tradeButtonsData && (
          <TradeButtons
            leftButton={tradeButtonsData.leftButton}
            rightButton={tradeButtonsData.rightButton}
          />
        )}
        <BottomNavbar setIsFlag={setIsFlag} isDrawerOpen={isDrawerOpen} />
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <OrderStatus />
    </div>
  );
};

export default MainLayout;
