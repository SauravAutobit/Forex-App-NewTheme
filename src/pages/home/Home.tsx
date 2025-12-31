import Card from "../../components/card/Card";
import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";
import SearchBar from "../../components/searchBar/SearchBar";
import Favourites from "../favourites/Favourites";
import type { OutletContextType } from "../../layout/MainLayout";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import { useEffect, useState, useRef } from "react";
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
    active,
    setActive,
    isDrawerOpen,
    setIsDrawerOpen,
    setFavouriteInstrument,
  } = useOutletContext<OutletContextType>();

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState("");

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
  const liveQuotes = useSelector((state: RootState) => state.quotes.liveQuotes);

  const theme = useSelector((s: RootState) => s.theme.mode);
  const apiStatus = useSelector(
    (state: RootState) => state.websockets.apiStatus
  );

  // Helper to get the actual lowercase category name from the capitalized active tab
  const activeCategoryName =
    active === "Favorites" ? null : active.toLowerCase();

  // Select the instruments for the currently active category
  const currentCategoryInstruments: Instrument[] = activeCategoryName
    ? instrumentsData[activeCategoryName] || []
    : [];

  const prevCategoryRef = useRef<string | null>(null);

  // --- Handlers ---

  // Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const addFavourites = () => {
    setIsFlag((prev) => ({
      ...prev,
      favourites: { status: true },
    }));

    if (categories.length > 0) {
      const firstCategory =
        categories[0].charAt(0).toUpperCase() + categories[0].slice(1);
      setActive(firstCategory);
    }
  };

  const removeFavorite = (id: string | number, code: string) => {
    setFavoriteItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setFavouriteInstrument((prevCodes) => prevCodes.filter((c) => c !== code));
  };

  const handleCardClick = (instrumentId: string) => {
    dispatch(setSelectedInstrument(instrumentId));
    setIsFlag((prev) => ({
      ...prev,
      charts: { status: true },
    }));
    navigate("/app/charts");
  };

  // --- Effects ---

  // Handle Dynamic Subscriptions based on Category
  useEffect(() => {
    if (apiStatus !== "connected") return;

    // Unsubscribe from previous category instruments
    if (
      prevCategoryRef.current &&
      prevCategoryRef.current !== activeCategoryName
    ) {
      const prevInstruments = instrumentsData[prevCategoryRef.current] || [];
      if (prevInstruments.length > 0) {
        import("../../services/socketService").then(
          ({ unsubscribeFromInstruments }) => {
            unsubscribeFromInstruments(prevInstruments.map((i) => i.id));
          }
        );
      }
    }

    // Subscribe to current category instruments
    if (activeCategoryName) {
      const currentInstruments = instrumentsData[activeCategoryName] || [];
      if (currentInstruments.length > 0) {
        import("../../services/socketService").then(
          ({ subscribeToInstruments }) => {
            subscribeToInstruments(currentInstruments.map((i) => i.id));
          }
        );
      }
    }

    prevCategoryRef.current = activeCategoryName;
  }, [activeCategoryName, apiStatus, instrumentsData]);

  // Reset search query when switching tabs (Optional UX preference)
  useEffect(() => {
    setSearchQuery("");
  }, [active]);

  useEffect(() => {
    if (
      apiStatus === "connected" &&
      (pathname === "/app/home" || pathname === "/app")
    ) {
      dispatch(fetchCategories());
    }
  }, [apiStatus, dispatch, pathname]);

  useEffect(() => {
    if (categoriesStatus === "succeeded" && categories.length > 0) {
      categories.forEach((category) => {
        dispatch(fetchInstrumentsByCategory(category));
      });
    }
  }, [categories, categoriesStatus, dispatch]);

  // --- Filter/Sort Logic ---

  const handleSortClick = (type: "alphabetically" | "price") => {
    setActiveFilter((prev) => {
      const currentState = prev.sort[type];
      let nextState: "" | "asc" | "desc" = "";

      if (currentState === "") nextState = "asc";
      else if (currentState === "asc") nextState = "desc";
      else nextState = "";

      return {
        ...prev,
        sort: {
          ...prev.sort,
          [type]: nextState,
        },
      };
    });
  };

  const getSortIcon = (state: string, type: "alphabetically" | "price") => {
    if (state === "asc") return upArrowFilter;
    if (state === "desc") return downArrowFilter;
    return type === "price" ? price : alphabets;
  };

  const capitalizedCategories = categories.map((category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  });

  // --- Search Filtering Logic ---

  // Filter regular instruments based on search query
  const filteredInstruments = currentCategoryInstruments.filter((inst) =>
    inst.trading_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter favorite items based on search query
  const filteredFavorites = favoriteItems.filter((item) =>
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Rendering ---

  return (
    <div className="mt-[95px] mb-10">
      <div
        className="w-full px-5 bg-primaryBg"
        style={{ position: "fixed", top: "56px", left: "0", zIndex: 10 }} // Added zIndex for safety
      >
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
        <MarketsNavbar
          active={active}
          setActive={setActive}
          favourite={isFlag.favourites?.status}
          tabs={["Favorites", ...capitalizedCategories]}
        />
      </div>

      {active === "Favorites" ? (
        <Favourites
          addFavourite={addFavourites}
          // Pass the filtered list instead of the full list
          items={filteredFavorites}
          removeItem={removeFavorite}
        />
      ) : (
        // Display instruments for the active category
        <div>
          {filteredInstruments.length > 0 ? (
            filteredInstruments.map((instrument) => {
              const quotes = liveQuotes[instrument.id];
              const bid = quotes?.bid ?? 0;
              const ask = quotes?.ask ?? 0;
              const high = quotes?.high ?? 0;
              const low = quotes?.low ?? 0;
              const ltp = quotes?.ltp ?? 0;
              const close = quotes?.close ?? 0;
              const timestamp = quotes?.timestamp
                ? new Date(quotes.timestamp).toLocaleTimeString()
                : "N/A";

              return (
                <Card
                  key={instrument.id}
                  code={instrument.trading_name}
                  bid={bid}
                  ask={ask}
                  high={high}
                  low={low}
                  ltp={ltp}
                  close={close}
                  pip={instrument.static_data?.pipsize}
                  timestamp={timestamp}
                  onClick={() => handleCardClick(instrument.id)}
                  active={active}
                  favourites={isFlag.favourites?.status}
                />
              );
            })
          ) : (
            // Empty State
            <p className="text-center mt-5 text-secondary">
              {instrumentsStatus === "loading"
                ? `Loading ${active} instruments...`
                : searchQuery
                ? `No results found for "${searchQuery}"`
                : `No instruments found for ${active}.`}
            </p>
          )}
        </div>
      )}

      {/* BottomDrawer remains unchanged */}
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
            {/* ... Rest of your drawer content ... */}
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
