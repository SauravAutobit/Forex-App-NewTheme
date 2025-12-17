import search from "../../assets/icons/search.svg";
import { useAppSelector } from "../../store/hook";

// Define the interface for props
interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div className="h-[35px] px-2 flex items-center border border-primary gap-3 rounded-10 my-2.5">
      <img src={search} alt="search" />
      <input
        placeholder="Search"
        // Bind value and onChange
        value={value}
        onChange={onChange}
        className={`w-full h-full border-none outline-none bg-inherit ${
          theme === "dark" ? "text-secondary" : "text-[#555454]"
        }`}
      />
    </div>
  );
};

export default SearchBar;
