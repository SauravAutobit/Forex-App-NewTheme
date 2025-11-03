import menu from "../assets/icons/menu.svg";
import back from "../assets/icons/back.svg";
import "react-datepicker/dist/react-datepicker.css";
import type { IsFlagType } from "./MainLayout";
import type { Dispatch, SetStateAction } from "react";

type HeaderProps = {
  isFlag: IsFlagType;
  setIsFlag: Dispatch<SetStateAction<IsFlagType>>;
};

export default function Header({ isFlag, setIsFlag }: HeaderProps) {
  // const conditionalRender = () => {
  //   let title = "";
  //   let actions = null;

  //   switch (pathname) {
  //   case ""
  //   }
  // };
  return (
    <header className="h-[56px] px-5 flex items-center fixed top-0 left-0 right-0 z-40 bg-primaryBg justi0fy-between max-w-[390px] mx-auto">
      {isFlag.favourites?.status === true ? (
        <button
          aria-label="Open menu"
          // bg-green-300
          className="w-[53px]"
          onClick={() => {
            setIsFlag((prev) => ({
              ...prev,
              favourites: { status: false },
            }));
          }}
        >
          <img src={back} alt="back" />
        </button>
      ) : (
        <button
          aria-label="Open menu"
          // bg-blue-300
          className="w-[53px]"
          onClick={() => {
            document.dispatchEvent(new CustomEvent("openSidebar"));
          }}
        >
          <img src={menu} alt="menu" />
        </button>
      )}
      {/* {conditionalRender()} */}
    </header>
  );
}
