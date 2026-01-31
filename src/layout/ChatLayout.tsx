import { Outlet, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function ChatLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[100dvh] bg-primaryBg relative max-w-[440px] mx-auto overflow-hidden text-white">
      <header
        className="flex items-center px-4 w-full bg-primaryBg z-40 fixed top-0 left-0 right-0 max-w-[440px] mx-auto"
        style={{
          height: "calc(56px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <button onClick={() => navigate(-1)} className="pr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-secondary">Fintrabit AI</h1>
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
