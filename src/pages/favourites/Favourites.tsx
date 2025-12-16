import "./Favourites.css";
import { useState } from "react";
import noFavourites from "../../assets/icons/noFavourites.svg";
import Button from "../../components/button/Button";
import Card, { type CardProps } from "../../components/card/Card";
import type { OutletContextType } from "../../layout/MainLayout";
import { useOutletContext } from "react-router-dom";
import { SwipeableList, SwipeableListItem } from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import noFavouritesLight from "../../assets/icons/noFavouritesLight.svg";
import { useAppSelector } from "../../store/hook";

interface FavoriteItemType
  extends Omit<CardProps, "onClick" | "active" | "favourites"> {
  id: string;
}

interface FavouritesProps {
  addFavourite: () => void;
  items: FavoriteItemType[];
  removeItem: (id: string) => void;
}

const Favourites = ({ addFavourite, items, removeItem }: FavouritesProps) => {
  const { isFlag } = useOutletContext<OutletContextType>();
  const [active] = useState("Favorites");

  const theme = useAppSelector((state) => state.theme.mode);

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-2.5 items-center justify-center pt-[156px]">
        <img
          src={theme === "dark" ? noFavourites : noFavouritesLight}
          alt="noFavourites"
        />
        <p className="text-primary">Add your Favourite Instrument here.</p>
        <Button
          textColor="#2D2D2D"
          label="Add Instrument"
          width="129px"
          height="41px"
          boxShadow="0px 2px 4px 0px #00000040"
          onClick={addFavourite}
        />
      </div>
    );
  }

  const TrailingActions = () => (
    <div className="bg-loss text-white p-4 h-full flex items-center justify-end pr-5 w-full">
      Remove
    </div>
  );

  return (
    <>
      <SwipeableList threshold={0.3} fullSwipe={true}>
        {items.map((item) => {
          return (
            <SwipeableListItem
              key={item.id}
              trailingActions={TrailingActions()}
              onSwipeEnd={() => {
                console.log(`Item ${item.id} removed via full swipe.`);
                removeItem(item.id);
              }}
              // 3. Optional: Add a delay to let the animation finish
              // swipeDelay={200}
            >
              <Card
                code={item.code}
                bid={item.bid}
                ask={item.ask}
                high={item.high}
                low={item.low}
                ltp={item.ltp}
                close={item.close}
                pip={item.pip}
                timestamp={item.timestamp}
                onClick={function (): void {
                  console.log(`Card ${item.id} clicked`);
                }}
                active={active}
                favourites={isFlag.favourites?.status}
              />
            </SwipeableListItem>
          );
        })}
      </SwipeableList>
    </>
  );
};

export default Favourites;
