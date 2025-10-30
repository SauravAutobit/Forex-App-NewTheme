import noFavourites from "../../assets/icons/noFavourites.svg";
import Button from "../../components/button/Button";

const Favourites = () => {
  return (
    <>
      <div className="flex flex-col gap-2.5 items-center justify-center pt-[156px]">
        <img src={noFavourites} alt="noFavourites" />
        <p>Add your Favrourite Instrument hers.</p>
        <Button label="Add Instrument" width="129px" height="41px" />
      </div>
    </>
  );
};

export default Favourites;
