import { Outlet, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function ChatLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-primaryBg">
      {/* Custom Header */}
      <header className="flex items-center px-4 h-[56px]">
        <button onClick={() => navigate(-1)} className="pr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-secondary">Fintrabit AI</h1>
      </header>

      {/* Chat Content (takes full remaining height) */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
