import Card from "../../components/card/Card";
import MarketsNavbar from "../../components/navbar/Navbar";
// import Navbar from "../../components/navbar/Navbar";
import SearchBar from "../../components/searchBar/SearchBar";

const Home = () => {
  return (
    <div className="px-5 py-2.5">
      <SearchBar />
      <MarketsNavbar />
      {/* <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4"> */}
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
          />
        );
      })}
      {/* </div> */}
    </div>
  );
};

export default Home;
