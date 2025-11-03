import "./Favourites.css";
import { useState } from "react";
import noFavourites from "../../assets/icons/noFavourites.svg";
import Button from "../../components/button/Button";
import Card, { type CardProps } from "../../components/card/Card";
import type { OutletContextType } from "../../layout/MainLayout";
import { useOutletContext } from "react-router-dom";
import { SwipeableList, SwipeableListItem } from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css"; // Import default styles

// ⭐️ Interface for the list item data (must have a unique 'id' for removal)
interface FavoriteItemType
  extends Omit<CardProps, "onClick" | "active" | "favourites"> {
  id: number;
}

interface FavouritesProps {
  addFavourite: () => void;
  // ⭐️ Props for the list data and removal function
  items: FavoriteItemType[];
  removeItem: (id: number) => void;
}

const Favourites = ({ addFavourite, items, removeItem }: FavouritesProps) => {
  const { isFlag } = useOutletContext<OutletContextType>();
  const [active] = useState("Favorites");

  // ⭐️ Conditional render for the "Add Instrument" screen
  if (items.length === 0 && isFlag.favourites?.status === true) {
    return (
      <div className="flex flex-col gap-2.5 items-center justify-center pt-[156px]">
        <img src={noFavourites} alt="noFavourites" />
        <p>Add your Favourite Instrument here.</p>
        <Button
          label="Add Instrument"
          width="129px"
          height="41px"
          onClick={addFavourite}
        />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // ✅ NEW: Helper function to define the action element
  // This is the simplest possible structure that satisfies the most rigid
  // type definition for a render prop expecting only a React Element.
  const TrailingActions = (itemId: number) => (
    <div
      // 🚨 IMPORTANT: We rely on a click handler here since we can't
      // pass the 'action' prop via the object structure due to the type error.
      // This makes the action a "click to remove" instead of "full swipe to remove".
      // The *full swipe to remove* logic must be implemented using an undocumented
      // internal prop or by upgrading the library.
      onClick={() => {
        console.log(`Removing item ${itemId} via click on action area.`);
        removeItem(itemId);
      }}
      className="bg-red-500 text-white p-4 h-full flex items-center justify-end pr-5 w-full"
    >
      Remove
    </div>
  );
  // -------------------------------------------------------------------------

  return (
    <>
      <SwipeableList threshold={0.3} fullSwipe={true}>
        {/* Configure swipe behavior */}
        {items.map((item) => {
          return (
            <SwipeableListItem
              key={item.id}
              // ✅ Trailing actions now uses the simplified render function.
              // This should resolve the TypeScript error.
              trailingActions={TrailingActions(item.id)}
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
