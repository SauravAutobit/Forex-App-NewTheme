import Card from "../../components/card/Card";
import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";
import SearchBar from "../../components/searchBar/SearchBar";
import Favourites from "../favourites/Favourites";
import type { OutletContextType } from "../../layout/MainLayout";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import { useEffect, useState } from "react";
import BottomDrawer from "../../components/bottomDrawer/BottomDrawer";
import price from "../../assets/icons/price.svg";
import alphabets from "../../assets/icons/alphabets.svg";
import upArrowFilter from "../../assets/icons/upArrowFilter.svg";
import downArrowFilter from "../../assets/icons/downArrowFilter.svg";
import {
  fetchInstrumentsByCategory,
  setSelectedInstrument,
} from "../../store/slices/instrumentsSlice";
// Import the Instrument type for correct typing
import type { Instrument } from "../../store/slices/instrumentsSlice";

const menuItems = [
  { label: "Popularity" },
  { label: "Daily Changes" },
  { label: "Daily gain" },
  { label: "Daily loss" },
];

const Home = () => {
  const {
    favoriteItems,
    setFavoriteItems,
    isFlag,
    setIsFlag,
    active, // This is the active tab name (e.g., "Forex", "Crypto")
    setActive,
    isDrawerOpen,
    setIsDrawerOpen,
  } = useOutletContext<OutletContextType>();

  const [activeFilter, setActiveFilter] = useState({
    filterOption: "",
    sort: {
      alphabetically: "",
      price: "",
    },
  });
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // --- Redux State Selectors ---
  const { data: categories, status: categoriesStatus } = useSelector(
    (state: RootState) => state.categories
  );
  const { data: instrumentsData, status: instrumentsStatus } = useSelector(
    (state: RootState) => state.instruments
  );
  const theme = useSelector((s: RootState) => s.theme.mode);
  const apiStatus = useSelector(
    (state: RootState) => state.websockets.apiStatus
  );

  console.log(
    "category",
    categories,
    categoriesStatus,
    "INSTURMENT",
    instrumentsData,
    instrumentsStatus
  );
  // -----------------------------

  // Helper to get the actual lowercase category name from the capitalized active tab
  const activeCategoryName = active === "Favorites" ? null : active;

  // Select the instruments for the currently active category
  const currentCategoryInstruments: Instrument[] = activeCategoryName
    ? instrumentsData[activeCategoryName] || []
    : [];

  // --- Handlers ---
  const addFavourites = () => {
    setIsFlag((prev) => ({
      ...prev,
      favourites: { status: true },
    }));
  };

  const removeFavorite = (id: number) => {
    setFavoriteItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // If active is "Favorites" and we're navigating back from the charts, switch to a default category
  if (
    active === "Favorites" &&
    isFlag.favourites?.status === true &&
    categories.length > 0
  ) {
    // Switch to the first available category, e.g., "Forex"
    setActive(categories[0].charAt(0).toUpperCase() + categories[0].slice(1));
  } else if (active === "Favorites" && isFlag.favourites?.status === true) {
    // Handle case where no categories are loaded yet
    setActive("Forex");
  }

  const handleCardClick = (instrumentId: string) => {
    // Dispatch the action to set the selected instrument ID
    dispatch(setSelectedInstrument(instrumentId));

    setIsFlag((prev) => ({
      ...prev,
      charts: { status: true },
    }));
    navigate("/app/charts");
  };

  // --- Effects ---

  // 1. Fetch Categories when connected
  useEffect(() => {
    if (apiStatus === "connected" && pathname === "/app/home") {
      dispatch(fetchCategories());
    }
  }, [apiStatus, dispatch, pathname]);

  // 2. Fetch Instruments for all categories once categories are available
  useEffect(() => {
    if (categoriesStatus === "succeeded" && categories.length > 0) {
      categories.forEach((category) => {
        // Dispatch fetch for all categories to populate the instrumentsData state
        dispatch(fetchInstrumentsByCategory(category));
      });

      // Set the initial active tab to the first category if it's currently "Favorites" or uninitialized
      if (
        active === "Favorites" ||
        active === "" ||
        !categories
          .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
          .includes(active)
      ) {
        setActive(
          categories[0].charAt(0).toUpperCase() + categories[0].slice(1)
        );
      }
    }
  }, [categories, categoriesStatus, dispatch, active, setActive]);

  // 3. Keep selected instrument data up-to-date (Optional: For real-time updates)
  // You would typically use a separate websocket listener for real-time updates,
  // but for now, the data fetching handles the initial load.
  // ...

  // --- Filter/Sort Logic ---

  const handleSortClick = (type: "alphabetically" | "price") => {
    setActiveFilter((prev) => {
      const currentState = prev.sort[type];
      let nextState: "" | "asc" | "desc" = "";

      if (currentState === "") nextState = "asc";
      else if (currentState === "asc") nextState = "desc";
      else nextState = ""; // go back to default

      return {
        ...prev,
        sort: {
          ...prev.sort,
          [type]: nextState,
        },
      };
    });
  };

  // helper to get icon based on state
  const getSortIcon = (state: string, type: "alphabetically" | "price") => {
    if (state === "asc") return upArrowFilter;
    if (state === "desc") return downArrowFilter;

    // default icons
    return type === "price" ? price : alphabets;
  };

  const capitalizedCategories = categories.map((category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  });

  // --- Rendering ---

  return (
    <div className="mt-[95px] mb-10">
      <div
        className="w-full px-5 bg-primaryBg"
        style={{ position: "fixed", top: "56px", left: "0" }}
      >
        <SearchBar />
        <MarketsNavbar
          active={active}
          setActive={setActive}
          favourite={isFlag.favourites?.status}
          // Use capitalized categories from Redux state
          tabs={["Favorites", ...capitalizedCategories]}
        />
      </div>

      {active === "Favorites" ? (
        <Favourites
          addFavourite={addFavourites}
          items={favoriteItems}
          removeItem={removeFavorite}
        />
      ) : (
        // Display instruments for the active category
        <div>
          {currentCategoryInstruments.length > 0 ? (
            currentCategoryInstruments.map((instrument) => {
              // Extract data, safely handle missing quotes/data
              const quotes = instrument.dinamic_data?.quotes;
              const bid = quotes?.bid?.[0] ?? 0;
              const ask = quotes?.ask?.[0] ?? 0;
              const high = quotes?.high?.[0] ?? 0;
              const low = quotes?.low?.[0] ?? 0;
              const ltp = quotes?.ltp?.[0] ?? 0;
              // Note: `close` and `pip` seem to be missing or require more complex calculation based on your Redux state
              const close = quotes?.close?.[0] ?? 0; // Assuming 'close' exists
              const timestamp = quotes?.ltpt?.[0]
                ? new Date(quotes.ltpt[0]).toLocaleTimeString()
                : "N/A";

              // The Card component receives a fixed `pip` and `close` in your original code,
              // so you may need to adjust the Card props based on actual data structure.
              // The example below uses dummy/placeholder values for props not easily derived.

              return (
                <Card
                  key={instrument.id}
                  code={instrument.trading_name} // e.g., "EUR/GBP"
                  bid={bid}
                  ask={ask}
                  high={high}
                  low={low}
                  ltp={ltp}
                  close={close} // Placeholder
                  pip={"N/A"} // Placeholder
                  timestamp={timestamp}
                  onClick={() => handleCardClick(instrument.id)} // Pass instrument ID to handler
                  active={active}
                  favourites={isFlag.favourites?.status}
                />
              );
            })
          ) : (
            // Optional: Loading or No Data State
            <p className="text-center mt-5 text-secondary">
              {instrumentsStatus === "loading"
                ? `Loading ${active} instruments...`
                : `No instruments found for ${active}.`}
            </p>
          )}
        </div>
      )}

      {/* The BottomDrawer component remains unchanged */}
      <BottomDrawer
        isOpen={isDrawerOpen.homeDrawer}
        onClose={() =>
          setIsDrawerOpen((prev) => ({ ...prev, homeDrawer: false }))
        }
      >
        {
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-lg font-tertiary mb-2.5">
              Filters
              <span
                className={`text-lg font-primary ${
                  theme === "dark" ? "text-quaternary" : "text-primary"
                }`}
                onClick={() =>
                  setActiveFilter({
                    filterOption: "",
                    sort: { alphabetically: "", price: "" },
                  })
                }
              >
                Clear
              </span>
            </div>
            <ul className="flex flex-wrap gap-2.5 items-center pb-2.5 border-b border-primary">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={`px-2.5 py-1.5 rounded-[6px] h-[33px] border border-[#878787] ${
                    activeFilter.filterOption === item.label
                      ? "bg-quaternary"
                      : ""
                  }`}
                >
                  <button
                    onClick={() =>
                      setActiveFilter((prev) => ({
                        ...prev,
                        filterOption: item.label,
                      }))
                    }
                    className={`w-full text-left text-secondary ${
                      activeFilter.filterOption === item.label
                        ? "text-[black]"
                        : ""
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="text-lg font-tertiary my-2.5">Sort</div>
            <div>
              <div
                className="py-2.5 flex items-center gap-2.5"
                onClick={() => handleSortClick("alphabetically")}
              >
                <img
                  src={getSortIcon(
                    activeFilter.sort.alphabetically,
                    "alphabetically"
                  )}
                  alt="alphabets"
                />
                <span
                  className={`${
                    activeFilter.sort.alphabetically
                      ? "text-quaternary"
                      : "text-secondary"
                  }`}
                >
                  Alphabatically
                </span>
              </div>
              <div
                className="py-2.5 flex items-center gap-2.5"
                onClick={() => handleSortClick("price")}
              >
                <img
                  src={getSortIcon(activeFilter.sort.price, "price")}
                  alt="price"
                />
                <span
                  className={`${
                    activeFilter.sort.price
                      ? "text-quaternary"
                      : "text-secondary"
                  }`}
                >
                  Price
                </span>
              </div>
            </div>
          </div>
        }
      </BottomDrawer>
    </div>
  );
};

export default Home;
