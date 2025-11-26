import PendingCard from "../../components/pendingCard/PendingCard";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
import Button from "../../components/button/Button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const PendingEdit = () => {
  const profitBalanceProps: ProfitBalanceProps = {
    balanceItems: [
      { label: "Create time", value: "2025/10/17  14:12:33" },
      { label: "Take profit", value: "1.13374" },
      { label: "Stop loss", value: "1.13374" },
      { label: "Position ID", value: "#58735749" },
      {
        label: "History",
        value: <img src={rightArrowHistory} alt="rightArrowHistory" />,
      },
    ],
    marginTop: "16px",
  };

  const navigate = useNavigate();

  const editHistoryHandler = () => {
    navigate("/app/editHistory", { state: { type: "pending" } });
  };
  const theme = useSelector((s: RootState) => s.theme.mode);

  return (
    <div className="h-[calc(100vh-122px)]">
      <div className="flex flex-col justify-between h-full">
        <div>
          <PendingCard
            key={1}
            code={`EURUSD ${1}`}
            bid={1678.256369}
            ask={1078.256369}
            high={253659}
            low={235698}
            ltp={30}
            close={23.22}
            pip={"5asa"}
            timestamp={"15:23:00"}
            onClick={() => {
              console.log("pending");
            }}
            // active={active}
            // favourites={isFlag.favourites?.status}
          />
          <div className="px-5">
            <EditOrderList
              {...profitBalanceProps}
              onClick={editHistoryHandler}
              lastListColor={true}
            />
          </div>
        </div>
        <div className="px-5 flex items-center justify-between mt-3 mb-2.5">
          <Button
            label="Show Chart"
            width="169.5px"
            height="44px"
            bgColor={theme === "dark" ? "#2D2D2D" : "#FAFAFA"}
            textColor={theme === "dark" ? "#FAFAFA" : "#2D2D2D"}
            border="1px solid #505050"
          />
          <Button
            label={
              <div className="flex flex-col">
                Close Order
                <div>-$4.57</div>
              </div>
            }
            width="169.5px"
            height="44px"
            bgColor={theme === "dark" ? "#FE0000" : "#DD3C48"}
            textColor="#FAFAFA"
            fontWeight={500}
          />
        </div>
      </div>
    </div>
  );
};

export default PendingEdit;
