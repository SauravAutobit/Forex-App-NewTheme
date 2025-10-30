import { useState } from "react";
import Card from "../../components/card/Card";
import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";
import SearchBar from "../../components/searchBar/SearchBar";
import Favourites from "../favourites/Favourites";

const Home = () => {
  const [active, setActive] = useState("Favorites");

  const [favourites, setFavourites] = useState(false);
  const addFavourites = () => {
    setFavourites(true);
  };

  if (active === "Favorites" && favourites === true) {
    setActive("Forex");
  }

  return (
    <div className="px-5 py-2.5">
      <SearchBar />
      <MarketsNavbar
        active={active}
        setActive={setActive}
        favourite={favourites}
      />
      {active === "Favorites" ? (
        <Favourites addFavourite={addFavourites} />
      ) : (
        // className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4"
        <div>
          {Array.from({ length: 10 }).map((_, index) => {
            return (
              <Card
                key={index}
                code={"EUR/GBP"}
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
                favourites={favourites}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
