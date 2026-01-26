import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "./utils/AppRoutes";
import { useSelector } from "react-redux";
import type { RootState } from "./store/store";
import { AnimatePresence, motion } from "framer-motion";
import Toasty from "./components/toasty/Toasty";
// import Splash from "./pages/splash/Splash"; // ✅ Import Splash

export default function App() {
  const theme = useSelector((state: RootState) => state.theme.mode);
  // const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement; // <html> tag

    root.setAttribute("data-theme", theme);
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [theme]);

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

  const { isVisible, data } = useSelector(
    (state: RootState) => state.notification,
  );

  return (
    <div className="relative">
      <AnimatePresence>
        {isVisible && data && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[75px] left-0 right-0 z-[9999] flex justify-center pointer-events-none"
          >
            <div className="pointer-events-auto">
              <Toasty
                onUndo={(item) => {
                  window.dispatchEvent(
                    new CustomEvent("undo-favourite", { detail: item }),
                  );
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <RouterProvider router={AppRoutes} />
    </div>
  );
}
