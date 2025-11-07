import menu from "../assets/icons/menu.svg";
import back from "../assets/icons/back.svg";
import "react-datepicker/dist/react-datepicker.css";
import type { IsFlagType } from "./MainLayout";
import type { Dispatch, SetStateAction } from "react";
import plus from "../assets/icons/plus.svg";

type HeaderProps = {
  isFlag: IsFlagType;
  setIsFlag: Dispatch<SetStateAction<IsFlagType>>;
  favoriteItems?: Array<{
    id: number;
    code: string;
    bid: number;
    ask: number;
    high: number;
    low: number;
    ltp: number;
    close: number;
    pip: string;
    timestamp: string;
  }>;
  active: string;
};

export default function Header({
  isFlag,
  setIsFlag,
  favoriteItems,
  active,
}: HeaderProps) {
  const pathname = window.location.pathname;

  // Function to handle the "Confirm" click and exit selection mode
  const handleConfirm = () => {
    // 🚨 Add logic here to save selected items if needed
    // For now, we just exit the selection mode
    setIsFlag((prev) => ({
      ...prev,
      favourites: { status: false },
    }));
  };

  // Function to enter the "Add to Favourites" selection mode (triggered by the '+' icon)
  const handleEnterSelectionMode = () => {
    setIsFlag((prev) => ({
      ...prev,
      favourites: { status: true },
    }));
  };

  const conditionalRender = () => {
    let title = "";
    let actions = null;

    switch (pathname) {
      case "/app/home":
        // 1. If in Selection Mode, show Confirm Button
        if (isFlag.favourites.status) {
          title = "Add to Favourites";
          actions = (
            // NOTE: Add your disabled styling/logic here based on if any items are selected
            <button
              onClick={handleConfirm}
              // disabled={!hasSelectedItems} // You'll need to pass this state down from Home/MainLayout
            >
              Confirm
            </button>
          );
        }
        // 2. If NOT in Selection Mode AND favorites exist, show '+' button
        else if (
          favoriteItems &&
          favoriteItems.length > 0 &&
          active === "Favorites"
        ) {
          actions = (
            <button
              onClick={handleEnterSelectionMode}
              aria-label="Add favorite instrument"
            >
              <div className="flex items-center justify-center w-[24px] h-[24px] rounded-[16px] bg-quaternary">
                <img src={plus} alt="plus" />
              </div>
            </button>
          );
        }
        // 3. Otherwise (No Selection Mode, No Favorites): Default to no title/actions

        break;
      default:
        // Handle other paths (e.g., History, etc.)
        return null;
    }

    // Always render the container, but the content might be empty string/null
    return (
      <>
        <div
          className={`text-primary font-secondary flex-1 flex flex-col text-left`}
        >
          {/* Render the title based on the state */}
          <span>{isFlag.favourites.status ? "Add to Favourites" : title}</span>
        </div>

        {/* Render actions */}
        <div className="flex gap-4 text-quaternary">{actions}</div>
      </>
    );
  };

  return (
    <header className="h-[56px] px-5 flex items-center fixed top-0 left-0 right-0 z-40 bg-primaryBg justify-between max-w-[390px] mx-auto">
      {/* Back button logic: Only show the back button (to exit selection mode) 
          when isFlag.favourites.status is true. Otherwise, show the menu. */}
      {isFlag.favourites?.status === true ? (
        <button
          aria-label="Exit selection mode"
          onClick={() => {
            setIsFlag((prev) => ({
              ...prev,
              favourites: { status: false },
            }));
          }}
        >
          <img src={back} alt="back" />
        </button>
      ) : (
        <button
          aria-label="Open menu"
          onClick={() => {
            document.dispatchEvent(new CustomEvent("openSidebar"));
          }}
        >
          <img src={menu} alt="menu" />
        </button>
      )}
      {/* Render the title and actions based on the current path/state */}
      {conditionalRender()}
    </header>
  );
}
