import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ChatLayout from "../layout/ChatLayout";
// import Login from "../pages/login/Login";
import Home from "../pages/home/Home";
import Trade from "../pages/trade/Trade";
// import History from "../pages/history/History";
import General from "../pages/general/General";
// import Profile from "../pages/profile/Profile";
import AIChat from "../pages/aiChat/AiChat";
// import NewOrder from "../pages/newOrder/NewOrder";
// import Properties from "../pages/properties/Properties";
// import MarketStatistics from "../pages/marketStatistics/MarketStatistics";
// import DepthOfMarket from "../pages/depthOfMarket/DepthOfMa
// rket";
// import ClosePositions from "../pages/closePositions/ClosePositions";
// import ModifyPositions from "../pages/modifyPositions/ModifyPositions";
// import Accounts from "../pages/accounts/Accounts";
import Login from "../pages/login/Login";
import HistoryScreenContainer from "../components/historyScreenContainer/HistoryScreenContainer";
import Charts from "../pages/charts/Charts";
import ChartSkeleton from "../components/chartSkeleton/ChartSkeleton";
import NewOrder from "../pages/newOrder/NewOrder";
import MarketEdit from "../pages/marketEdit/MarketEdit";
import PendingEdit from "../pages/pendingEdit/PendingEdit";
import ClosedEdit from "../pages/closedEdit/ClosedEdit";
// import EditHistory from "../pages/editHistory/EditHistory";

import { useAppSelector } from "../store/hook";

/**
 * Wrapper for MainLayout that uses the current user's username as a React key.
 * This forces a complete remount of the layout and all its internal state
 * (like favorites, drawers, etc.) whenever the active account switches.
 */
const MainLayoutWrapper = () => {
  const user = useAppSelector((state) => state.auth.user);
  return <MainLayout key={user?.username || "guest"} />;
};

export const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    // /app
    path: "/app",
    element: <MainLayoutWrapper />,
    children: [
      { index: true, element: <Home /> }, // /app
      { path: "home", element: <Home /> },
      { path: "trade", element: <Trade /> },
      { path: "history", element: <HistoryScreenContainer /> },
      { path: "console", element: <General /> },
      { path: "charts", element: <Charts /> },
      { path: "charts-skeleton", element: <ChartSkeleton /> },
      { path: "newOrder", element: <NewOrder /> },
      { path: "marketEdit", element: <MarketEdit /> },
      { path: "PendingEdit", element: <PendingEdit /> },
      { path: "closedEdit", element: <ClosedEdit /> },
      // { path: "editHistory", element: <EditHistory /> },
    ],
  },
  {
    element: <ChatLayout />,
    children: [{ path: "/ai", element: <AIChat /> }],
  },
]);
