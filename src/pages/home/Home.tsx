import Card from "../../components/card/Card";
import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";
import SearchBar from "../../components/searchBar/SearchBar";
import Favourites from "../favourites/Favourites";
import type { OutletContextType } from "../../layout/MainLayout";
import { useNavigate, useOutletContext } from "react-router-dom";

const Home = () => {
  const { favoriteItems, setFavoriteItems } =
    useOutletContext<OutletContextType>();
  const { isFlag, setIsFlag, active, setActive } =
    useOutletContext<OutletContextType>();

  const navigate = useNavigate();

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
    navigate("/app/charts");
  };

  return (
    <div className="px-5 py-2.5">
      <SearchBar />
      <MarketsNavbar
        active={active}
        setActive={setActive}
        favourite={isFlag.favourites?.status}
      />
      {active === "Favorites" ? (
        <Favourites
          addFavourite={addFavourites}
          items={favoriteItems} // ⭐️ Pass the list
          removeItem={removeFavorite} // ⭐️ Pass the remove function
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
