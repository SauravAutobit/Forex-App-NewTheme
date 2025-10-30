// import { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "./utils/AppRoutes";
// import { useSelector } from "react-redux";
// import type { RootState } from "./store/store";
// import Splash from "./pages/splash/Splash"; // ✅ Import Splash

export default function App() {
  // const theme = useSelector((state: RootState) => state.theme.mode);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const root = document.documentElement; // <html> tag

  //   root.setAttribute("data-theme", theme);
  //   if (theme === "light") {
  //     root.classList.remove("dark");
  //   } else {
  //     root.classList.add("dark");
  //   }
  // }, [theme]);

  // useEffect(() => {
  //   // Simulate loading time
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 8000); // 8 seconds

  //   return () => clearTimeout(timer); // Cleanup the timer
  // }, []);

  //   // ✅ Show Splash screen first
  // if (isLoading) {
  //   return <Splash />;
  // }

  return <RouterProvider router={AppRoutes} />;
}
