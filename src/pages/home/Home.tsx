import { useState } from "react";
import Card from "../../components/card/Card";
import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";
import SearchBar from "../../components/searchBar/SearchBar";
import Favourites from "../favourites/Favourites";
import type { OutletContextType } from "../../layout/MainLayout";
import { useOutletContext } from "react-router-dom";

const Home = () => {
  const { isFlag, setIsFlag } = useOutletContext<OutletContextType>();
  const [active, setActive] = useState("Favorites");
  // const [favourites, setFavourites] = useState(false);

  // ⭐️ NEW: State for the list of favorite instruments
  const [favoriteItems, setFavoriteItems] = useState(
    Array.from({ length: 5 }).map((_, index) => ({
      // Using 5 to keep the list short for testing
      id: index,
      code: `EUR/GBP ${index}`,
      bid: 1678.256369 + index,
      ask: 1078.256369 + index,
      high: 253659 + index,
      low: 235698 - index,
      ltp: 30 + index,
      close: 23.22 + index / 10,
      pip: "5asa",
      timestamp: "15:23:00",
      // Add other necessary properties
    }))
  );
  const addFavourites = () => {
    setIsFlag((prev) => ({
      ...prev,
      favourites: { status: true },
    }));
  };

  // ⭐️ NEW: Function to remove an item from the list
  const removeFavorite = (id: number) => {
    setFavoriteItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  if (active === "Favorites" && isFlag.favourites?.status === true) {
    setActive("Forex");
  }
  // else if (isFlag.favourites?.status === false && active === "Forex") {
  //   setActive("Favorites");
  // }

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
                onClick={function (): void {
                  throw new Error("Function not implemented.");
                }}
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
