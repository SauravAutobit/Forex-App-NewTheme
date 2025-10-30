import menu from "../assets/icons/menu.svg";
import "react-datepicker/dist/react-datepicker.css";

export default function Header() {
  return (
    <header className="h-[56px] px-5 flex items-center fixed top-0 left-0 right-0 z-40 bg-red-400 justify-between max-w-[390px] mx-auto">
      <button
        aria-label="Open menu"
        className="w-[53px] bg-blue-300"
        onClick={() => {
          document.dispatchEvent(new CustomEvent("openSidebar"));
        }}
      >
        <img src={menu} alt="menu" />
      </button>
    </header>
  );
}
