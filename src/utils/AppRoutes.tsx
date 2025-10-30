import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ChatLayout from "../layout/ChatLayout";
// import Login from "../pages/login/Login";
import Home from "../pages/home/Home";
import Trade from "../pages/trade/Trade";
import History from "../pages/history/History";
import General from "../pages/general/General";
import Profile from "../pages/profile/Profile";
// import AIChat from "../pages/aiChatbot/AIChat";
// import NewOrder from "../pages/newOrder/NewOrder";
// import Properties from "../pages/properties/Properties";
// import MarketStatistics from "../pages/marketStatistics/MarketStatistics";
// import DepthOfMarket from "../pages/depthOfMarket/DepthOfMarket";
// import ClosePositions from "../pages/closePositions/ClosePositions";
// import ModifyPositions from "../pages/modifyPositions/ModifyPositions";
// import Accounts from "../pages/accounts/Accounts";
// import Login from "../pages/login/Login";

export const AppRoutes = createBrowserRouter([
  //   {
  //     path: "/",
  //     element: <Login />,
  //   },
  {
    // /app
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/home", element: <Home /> },
      { path: "/trade", element: <Trade /> },
      { path: "/history", element: <History /> },
      { path: "/general", element: <General /> },
      { path: "/profile", element: <Profile /> },
      //   { path: "/new-order", element: <NewOrder /> },
      //   { path: "/properties", element: <Properties /> },
      //   { path: "/market-statistics", element: <MarketStatistics /> },
      //   { path: "/depth-of-market", element: <DepthOfMarket /> },
      //   { path: "/close-positions", element: <ClosePositions /> },
      //   { path: "/modify-positions", element: <ModifyPositions /> },
      //   { path: "/accounts", element: <Accounts /> },
    ],
  },
  {
    element: <ChatLayout />,
    // children: [{ path: "/ai", element: <AIChat /> }],
  },
]);
