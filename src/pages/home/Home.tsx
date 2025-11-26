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

  const addFavourites = () => {
    setIsFlag((prev) => ({
      ...prev,
      favourites: { status: true },
    }));
  };

  const removeFavorite = (id: number) => {
    setFavoriteItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  if (active === "Favorites" && isFlag.favourites?.status === true) {
    setActive("Forex");
  }

  const handleCardClick = () => {
    // Handle card click event
    setIsFlag((prev) => ({
      ...prev,
      charts: { status: true },
    }));
    navigate("/app/charts");
  };

  // const tabs = ["Favorites", "Forex", "Crypto", "Indices", "Stocks", "Metals"];

  const { data: categories, status: categoriesStatus } = useSelector(
    (state: RootState) => state.categories
  );

  console.log("STATE CATEGORY", categories, categoriesStatus);
  const dispatch = useDispatch<AppDispatch>();

  const apiStatus = useSelector(
    (state: RootState) => state.websockets.apiStatus
  );

  useEffect(() => {
    if (apiStatus === "connected" && pathname === "/app/home") {
      dispatch(fetchCategories());
    }
  }, [apiStatus, dispatch, pathname]);

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

  const theme = useSelector((s: RootState) => s.theme.mode);

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
        // className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4"
        <div>
          {Array.from({ length: 10 }).map((_, index) => {
            return (
              <Card
                key={index}
                code={`EUR/GBP ${index}`}
                bid={1678.256369}
                ask={1078.256369}
                high={253659}
                low={235698}
                ltp={30}
                close={23.22}
                pip={"5asa"}
                timestamp={"15:23:00"}
                onClick={handleCardClick}
                active={active}
                favourites={isFlag.favourites?.status}
              />
            );
          })}
        </div>
      )}
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
