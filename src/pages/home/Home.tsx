import Card from "../../components/card/Card";
import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";
import SearchBar from "../../components/searchBar/SearchBar";
import Favourites from "../favourites/Favourites";
import type { OutletContextType } from "../../layout/MainLayout";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import { useEffect } from "react";

const Home = () => {
  const { favoriteItems, setFavoriteItems } =
    useOutletContext<OutletContextType>();
  const { isFlag, setIsFlag, active, setActive } =
    useOutletContext<OutletContextType>();

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

  return (
    <div className="mt-[95px] mb-10">
      <div
        className="w-full px-5 bg-primaryBg"
        style={{ position: "fixed", top: "56px", left: "0", zIndex: 1000 }}
      >
        <SearchBar />
        <MarketsNavbar
          active={active}
          setActive={setActive}
          favourite={isFlag.favourites?.status}
          tabs={["Favorites", ...categories]}
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
    </div>
  );
};

export default Home;
