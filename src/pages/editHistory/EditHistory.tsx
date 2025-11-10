import { useLocation } from "react-router-dom";
import EditHistoryCard from "../../components/editHistoryCard/EditHistoryCard";
import EditHistoryDetail from "../../components/editHistoryDetail/EditHistoryDetail";

const EditHistory = () => {
  const location = useLocation();
  const type = location.state?.type || "closed"; // default fallback
  return (
    <div>
      <EditHistoryCard
        key={1}
        code={`EUR/GBP ${1}`}
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
        border={false}
        // active={active}
        // favourites={isFlag.favourites?.status}
      />
      <EditHistoryDetail
        onCardClick={function (): void {
          throw new Error("Function not implemented.");
        }}
        isTutorialTarget={false}
        type={type}
      />
    </div>
  );
};

export default EditHistory;
