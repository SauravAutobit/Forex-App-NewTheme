// import { useState } from "react";
import noFavourites from "../../assets/icons/noFavourites.svg";
import Button from "../../components/button/Button";
// import MarketsNavbar from "../../components/marketNavbar/MarketNavbar";

interface FavouritesProps {
  addFavourite: () => void;
}
const Favourites = ({ addFavourite }: FavouritesProps) => {
  //   const [active, setActive] = useState("Forex");

  //   const [favourites, setFavourites] = useState(false);
  //   const addFavourites = () => {
  //     setFavourites(true);
  //   };
  return (
    <>
      <div className="flex flex-col gap-2.5 items-center justify-center pt-[156px]">
        <img src={noFavourites} alt="noFavourites" />
        <p>Add your Favrourite Instrument hers.</p>
        <Button
          label="Add Instrument"
          width="129px"
          height="41px"
          onClick={addFavourite}
        />
      </div>
      {/* <MarketsNavbar
        active={active}
        setActive={setActive}
        addFavourite={favourites}
      /> */}
    </>
  );
};

export default Favourites;
