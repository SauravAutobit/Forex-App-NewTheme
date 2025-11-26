// import Button from "../../components/button/Button";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
import ClosedCard from "../../components/closedCard/ClosedCard";
import { useNavigate } from "react-router-dom";

const ClosedEdit = () => {
  const profitBalanceProps: ProfitBalanceProps = {
    balanceItems: [
      { label: "Open time", value: "2025/10/17  14:12:33" },
      { label: "Close profit", value: "1.13374" },
      { label: "Reason", value: "Take Profit" },
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
    navigate("/app/editHistory", { state: { type: "closed" } });
  };
  return (
    <div className="h-[calc(100vh-122px)]">
      <div className="flex flex-col justify-between h-full">
        <div>
          {" "}
          <ClosedCard
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
              console.log("closed edit");
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
        {/* <div className="px-5 flex items-center justify-between mt-3 mb-2.5">
          <Button
            label="Show Chart"
            width="169.5px"
            height="44px"
            bgColor="#2D2D2D"
            textColor="#FAFAFA"
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
            bgColor="#FE0000"
            textColor="#FAFAFA"
            fontWeight={500}
          />
        </div> */}
      </div>
    </div>
  );
};

export default ClosedEdit;
