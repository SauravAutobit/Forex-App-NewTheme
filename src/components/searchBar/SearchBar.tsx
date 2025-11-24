import search from "../../assets/icons/search.svg";
import { useAppSelector } from "../../store/hook";
// import microphone from "../../assets/icons/microphone.svg";

const SearchBar = () => {
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div className="h-[35px] px-2 flex items-center border border-primary gap-3 rounded-10 my-2.5">
      <img src={search} alt="search" />
      <input
        placeholder="Search"
        className={`w-full h-full border-none outline-none bg-inherit ${
          theme === "dark" ? "text-secondary" : "text-[#555454]"
        }`}
      />
      {/* <img src={microphone} alt="microphone" /> */}
    </div>
  );
};

export default SearchBar;
