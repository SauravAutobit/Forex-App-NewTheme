import menu from "../assets/icons/menu.svg";
import back from "../assets/icons/back.svg";
import "react-datepicker/dist/react-datepicker.css";
import type { DrawerState, IsFlagType } from "./MainLayout";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { RootState } from "../store/store";
import plus from "../assets/icons/plus.svg";
import notFavouriteTick from "../assets/icons/notFavrouiteTick.svg";
import favouriteTick from "../assets/icons/favrouiteTick.svg";
import { useLocation, useNavigate } from "react-router-dom";
import filter from "../assets/icons/filter.svg";
import menuLight from "../assets/icons/menuLight.svg";
import { useAppSelector } from "../store/hook";
import backLight from "../assets/icons/backLight.svg";
import notFavouriteTickLight from "../assets/icons/notFavrouiteTickLight.svg";
import favouriteTickLight from "../assets/icons/favrouiteTickLight.svg";
import { useSelector } from "react-redux";

type HeaderProps = {
  isFlag: IsFlagType;
  setIsFlag: Dispatch<SetStateAction<IsFlagType>>;
  favoriteItems?: Array<{
    id: string;
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
  setFavoriteItems: Dispatch<
    SetStateAction<
      Array<{
        id: string;
        code: string;
        bid: number;
        ask: number;
        high: number;
        low: number;
        ltp: number;
        close: number;
        pip: string;
        timestamp: string;
      }>
    >
  >;
  favouriteInstrument: string[];
  active: string;
  setIsDrawerOpen: Dispatch<SetStateAction<DrawerState>>;
  setFavouriteInstrument: Dispatch<SetStateAction<string[]>>;
  setActive: Dispatch<SetStateAction<string>>;
};

export default function Header({
  isFlag,
  setIsFlag,
  favoriteItems,
  setFavoriteItems,
  favouriteInstrument,
  setFavouriteInstrument,
  active,
  setIsDrawerOpen,
  setActive,
}: HeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [star, setStar] = useState(false);

  const theme = useAppSelector((state) => state.theme.mode);

  // Function to handle the "Confirm" click and exit selection mode
  const instrumentsData = useAppSelector(
    (state: RootState) => state.instruments.data
  );

  const { data: categories } = useSelector(
    (state: RootState) => state.categories
  );

  // ✅ SIMPLIFIED: Handle Confirm
  const handleConfirm = () => {
    // 1. Flatten all available instruments
    const allInstruments = Object.values(instrumentsData).flat();

    // 2. Filter instruments that match the selected codes (favouriteInstrument)
    // We use a Map to ensure we don't get duplicates if instrumentsData has them
    const uniqueMap = new Map();

    allInstruments.forEach((inst) => {
      if (favouriteInstrument.includes(inst.trading_name)) {
        // Only add if not already added (deduplication)
        if (!uniqueMap.has(inst.trading_name)) {
          uniqueMap.set(inst.trading_name, inst);
        }
      }
    });

    // 3. Transform to FavoriteItem format
    const newFavoriteObjects = Array.from(uniqueMap.values()).map((inst) => {
      const quotes = inst.dinamic_data?.quotes;
      return {
        id: inst.id,
        code: inst.trading_name,
        bid: quotes?.bid?.[0] ?? 0,
        ask: quotes?.ask?.[0] ?? 0,
        high: quotes?.high?.[0] ?? 0,
        low: quotes?.low?.[0] ?? 0,
        ltp: quotes?.ltp?.[0] ?? 0,
        close: quotes?.close?.[0] ?? 0,
        pip: "N/A",
        timestamp: quotes?.ltpt?.[0]
          ? new Date(quotes.ltpt[0]).toLocaleTimeString()
          : "N/A",
      };
    });

    setFavoriteItems(newFavoriteObjects);
    setActive("Favorites");

    // Close selection mode
    setIsFlag((prev) => ({
      ...prev,
      favourites: { status: false },
    }));
  };

  // ✅ FIXED: Sync state when entering selection mode
  const handleEnterSelectionMode = () => {
    // 1. Extract codes from currently saved favorites
    if (categories.length > 0) {
      const firstCategory =
        categories[0].charAt(0).toUpperCase() + categories[0].slice(1);
      setActive(firstCategory);
    }

    const existingCodes = favoriteItems?.map((item) => item.code) || [];

    // 2. Update the selection state so stars appear correctly
    setFavouriteInstrument(existingCodes);

    // 3. Open selection mode
    setIsFlag((prev) => ({
      ...prev,
      favourites: { status: true },
    }));
  };

  const selectedInstrumentId = useAppSelector(
    (state: RootState) => state.instruments.selectedInstrumentId
  );
  const liveQuotes = useAppSelector(
    (state: RootState) => state.quotes.liveQuotes
  );
  // console.log("selectedInstrumentId", selectedInstrumentId, liveQuotes);
  const iconSrc =
    theme === "light"
      ? star
        ? favouriteTickLight
        : notFavouriteTickLight
      : star
      ? favouriteTick
      : notFavouriteTick;

  const conditionalRender = () => {
    let title = "";
    let actions = null;
    let subTitle = "";

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
          active === "Favorites" &&
          favoriteItems &&
          favoriteItems.length > 0 &&
          pathname === "/app/home"
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

      case "/app/charts":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-case-declarations
        const allInstruments = Object.values(instrumentsData).flat();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-case-declarations
        const staticInstrument = allInstruments.find(
          (i: any) => i.id === selectedInstrumentId
        );

        // eslint-disable-next-line no-case-declarations
        const quote = selectedInstrumentId
          ? liveQuotes[selectedInstrumentId]
          : null;

        title =
          staticInstrument?.trading_name ||
          quote?.trading_name ||
          quote?.name ||
          (selectedInstrumentId ? "Loading..." : "Select Instrument");

        if (quote) {
          const change = quote.ltp - quote.close;
          const percentageChange =
            quote.close !== 0 ? (change / quote.close) * 100 : 0;
          subTitle = `${change >= 0 ? "+" : ""}${change.toFixed(
            2
          )} (${percentageChange.toFixed(2)}%)`;
        } else {
          subTitle = "";
        }

        if (active === "Chart") {
          actions = (
            <div className="flex items-center gap-5">
              <img
                src={iconSrc}
                alt="notFavouriteTick"
                onClick={(e) => {
                  e.stopPropagation(); // ⭐️ Stop click event from triggering the parent card's onClick/swipe
                  setStar(!star);
                }}
              />
              <div className="flex items-center gap-[7px]">
                <button
                  className={`w-[23px] h-[23px] bg-loss rounded-20 flex justify-center items-center ${
                    theme === "dark" ? "text-[#2D2D2D]" : "text-[#FAFAFA]"
                  }`}
                  onClick={() => {
                    navigate("newOrder");
                  }}
                >
                  S
                </button>
                <button
                  className={`w-[23px] h-[23px] bg-profit rounded-20 flex justify-center items-center ${
                    theme === "dark" ? "text-[#2D2D2D]" : "text-[#FAFAFA]"
                  }`}
                  onClick={() => {
                    navigate("newOrder");
                  }}
                >
                  B
                </button>
              </div>
            </div>
          );
        } else if (active === "Calendar") {
          actions = null;
        } else if (active !== "Chart") {
          actions = (
            <img
              src={iconSrc}
              alt="notFavouriteTick"
              onClick={(e) => {
                e.stopPropagation();
                setStar(!star);
              }}
            />
          );
        }
        break;

      case "/app/trade":
        actions = (
          <img
            src={filter}
            alt="filter"
            onClick={() => {
              setIsDrawerOpen((prev) => ({ ...prev, homeDrawer: true }));
            }}
          />
        );
        break;

      case "/app/newOrder":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-case-declarations
        const allInstrumentsNewOrder = Object.values(instrumentsData).flat();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-case-declarations
        const staticInstrumentNewOrder = allInstrumentsNewOrder.find(
          (i: any) => i.id === selectedInstrumentId
        );

        // eslint-disable-next-line no-case-declarations
        const quoteNewOrder = selectedInstrumentId
          ? liveQuotes[selectedInstrumentId]
          : null;

        title =
          staticInstrumentNewOrder?.trading_name ||
          quoteNewOrder?.trading_name ||
          quoteNewOrder?.name ||
          (selectedInstrumentId ? "Loading..." : "Select Instrument");

        if (quoteNewOrder) {
          const change = quoteNewOrder.ltp - quoteNewOrder.close;
          const percentageChange =
            quoteNewOrder.close !== 0
              ? (change / quoteNewOrder.close) * 100
              : 0;
          subTitle = `${change >= 0 ? "+" : ""}${change.toFixed(
            2
          )} (${percentageChange.toFixed(2)}%)`;
        } else {
          subTitle = "";
        }
        actions = null;
        break;

      case "/app/marketEdit":
        title = "Edit Order";
        actions = null;
        break;

      case "/app/pendingEdit":
        title = "Edit Order";
        actions = null;
        break;

      case "/app/closedEdit":
        title = "Edit Order";
        actions = null;
        break;

      case "/app/editHistory":
        title = "History";
        actions = null;
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
          {subTitle && (
            <span className="text-sm font-primary text-profit">{subTitle}</span>
          )}
        </div>

        {/* Render actions */}
        <div
          className={`flex gap-4 ${
            theme === "dark" ? "text-[#AEED09]" : "text-[#2D2D2D]"
          }`}
        >
          {actions}
        </div>
      </>
    );
  };

  return (
    <header className="h-[56px] px-5 flex items-center fixed top-0 left-0 right-0 z-40 bg-primaryBg justify-between max-w-[390px] mx-auto">
      {/* Back button logic: Only show the back button (to exit selection mode)
when isFlag.favourites.status is true. Otherwise, show the menu. */}
      {isFlag.favourites?.status === true ||
      isFlag.charts?.status === true ||
      isFlag.newOrder?.status === true ||
      isFlag.marketEdit?.status === true ||
      isFlag.pendingEdit?.status === true ||
      isFlag.closedEdit?.status === true ||
      isFlag.editHistory?.status === true ? (
        <button
          aria-label="Exit selection mode"
          onClick={() => {
            // Restore the previous category when coming back from charts
            if (isFlag.charts?.status === true) {
              const previousCategory = localStorage.getItem("previousCategory");
              if (previousCategory) {
                setActive(previousCategory);
                localStorage.removeItem("previousCategory"); // Clean up
              }
            }

            setIsFlag((prev) => ({
              ...prev,
              favourites: { status: false },
              charts: { status: false },
              newOrder: { status: false },
              marketEdit: { status: false },
              pendingEdit: { status: false },
              closedEdit: { status: false },
              editHistory: { status: false },
            }));
            navigate(-1);
          }}
        >
          <img src={theme === "dark" ? back : backLight} alt="back" />
        </button>
      ) : (
        <button
          aria-label="Open menu"
          onClick={() => {
            document.dispatchEvent(new CustomEvent("openSidebar"));
          }}
        >
          <img src={theme === "dark" ? menu : menuLight} alt="menu" />
        </button>
      )}
      {/* Render the title and actions based on the current path/state */}
      {conditionalRender()}
    </header>
  );
}
