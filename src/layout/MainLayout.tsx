import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNavbar from "../components/bottomNavbar/BottomNavbar";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
// import { initializeSockets } from "../services/socketService.ts";
// import { store } from "../store/store";

export type OutletContextType = {
  setIsSidebarOpen: (isOpen: boolean) => void;
};
const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleOpenSidebar = () => setIsSidebarOpen(true);
    document.addEventListener("openSidebar", handleOpenSidebar);
    return () => document.removeEventListener("openSidebar", handleOpenSidebar);
  }, []);
  return (
    <div className="min-h-screen flex flex-col relative text-white bg-primaryBg">
      <Header />
      <main
        id="#main-content"
        className="flex-1 py-14 overflow-y-auto bg-primaryBg scroll-smooth"
      >
        <Outlet
          context={{
            setIsSidebarOpen,
          }}
        />
      </main>

      <BottomNavbar />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

export default MainLayout;
