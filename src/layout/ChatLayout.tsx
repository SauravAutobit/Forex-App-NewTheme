import { Outlet, useNavigate } from "react-router-dom";
// import { ChevronLeft } from "lucide-react";
import { useAppSelector } from "@/store/hook";
import back from "../assets/icons/back.svg";
import backLight from "../assets/icons/backLight.svg";

export default function ChatLayout() {
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div className="flex flex-col h-[100dvh] bg-primaryBg relative max-w-[440px] mx-auto overflow-hidden text-white">
      <header
        className="flex items-center px-4 w-full bg-primaryBg z-40 fixed top-0 left-0 right-0 max-w-[440px] mx-auto"
        style={{
          height: "calc(56px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* pr-4 */}
        <button onClick={() => navigate(-1)}>
          {/* <ChevronLeft size={24} color={theme === "dark" ? "#fff" : "#000"} /> */}
          <img src={theme === "dark" ? back : backLight} alt="back" />
        </button>
        <h1 className="text-xl font-secondary text-primary">Fintrabit AI</h1>
      </header>

      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top))",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
