import "./Favourites.css";
import { useState } from "react";
import noFavourites from "../../assets/icons/noFavourites.svg";
import Button from "../../components/button/Button";
import Card, { type CardProps } from "../../components/card/Card";
import type { OutletContextType } from "../../layout/MainLayout";
import { useOutletContext, useNavigate } from "react-router-dom";
import { SwipeableList, SwipeableListItem } from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import noFavouritesLight from "../../assets/icons/noFavouritesLight.svg";
import { useAppSelector } from "../../store/hook";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setSelectedInstrument } from "../../store/slices/instrumentsSlice";

interface FavoriteItemType
  extends Omit<CardProps, "onClick" | "active" | "favourites"> {
  id: string;
}

interface FavouritesProps {
  addFavourite: () => void;
  items: FavoriteItemType[];
  // ✅ FIXED: Update type to accept both id and code
  removeItem: (id: string, code: string) => void;
}

const Favourites = ({ addFavourite, items, removeItem }: FavouritesProps) => {
  const { isFlag, setIsFlag } = useOutletContext<OutletContextType>();
  const [active] = useState("Favorites");

  const theme = useAppSelector((state) => state.theme.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const handleCardClick = (instrumentId: string) => {
    localStorage.setItem("previousCategory", "Favorites");
    dispatch(setSelectedInstrument(instrumentId));
    setIsFlag((prev) => ({
      ...prev,
      charts: { status: true },
    }));
    navigate("/app/charts");
  };

  const TrailingActions = () => (
    <div className="bg-loss text-white p-4 h-full flex items-center justify-end pr-5 w-full">
      Remove
    </div>
  );

  return (
    <>
      <SwipeableList threshold={0.3} fullSwipe={true}>
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => {
            return (
              <motion.div
                key={item.id}
                layout
                initial={{
                  x: "-100%",
                  opacity: 0,
                  height: 0,
                  overflow: "hidden",
                }}
                animate={{ x: 0, opacity: 1, height: "auto" }}
                exit={{ x: "-100%", opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SwipeableListItem
                  trailingActions={TrailingActions()}
                  onSwipeEnd={() => {
                    console.log(`Item ${item.id} removed via full swipe.`);
                    // ✅ FIXED: Pass item.code as the second argument
                    removeItem(item.id, item.code);
                  }}
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
                    onClick={() => handleCardClick(item.id)}
                    active={active}
                    favourites={isFlag.favourites?.status}
                  />
                </SwipeableListItem>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </SwipeableList>
    </>
  );
}; // End of component

export default Favourites;
