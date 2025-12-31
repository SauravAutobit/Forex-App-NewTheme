import PositionCard from "../../components/positionCard/PositionCard";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
// import ClosedCard from "../../components/closedCard/ClosedCard";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";

const ClosedEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const theme = useSelector((s: RootState) => s.theme.mode);

  const historyPosition =
    location.state?.historyPosition || location.state?.position;
  const deal = location.state?.deal;
  const historyOrder = location.state?.historyOrder;

  const data = historyPosition || deal || historyOrder;

  const formatTime = (ts?: number) =>
    ts
      ? new Date(ts * 1000).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      : "-";

  const profitBalanceProps: ProfitBalanceProps = useMemo(() => {
    const openTime =
      historyPosition?.created_at ||
      historyOrder?.placed_time ||
      deal?.time ||
      0;
    const closeTime =
      historyPosition?.updated_at ||
      historyOrder?.end_execution_time ||
      deal?.time ||
      0;
    const reason =
      historyPosition?.status || historyOrder?.status || deal?.status || "N/A";

    return {
      balanceItems: [
        { label: "Open time", value: formatTime(openTime) },
        { label: "Close time", value: formatTime(closeTime) },
        { label: "Reason", value: reason },
        {
          label: "Position ID",
          value: data?.id ? `#${data.tid || data.id}` : "-",
        },
        {
          label: "History",
          value: <img src={rightArrowHistory} alt="rightArrowHistory" />,
        },
      ],
      marginTop: "16px",
    };
  }, [historyPosition, historyOrder, deal, data]);

  const editHistoryHandler = () => {
    navigate("/app/editHistory", { state: { type: "closed" } });
  };
  return (
    <div className="h-[calc(100vh-122px)]">
      <div className="flex flex-col justify-between h-full">
        <div>
          {data && (
            <PositionCard
              position={data}
              historyPositionData={historyPosition}
              dealData={deal}
              historyOrderData={historyOrder}
              label="History"
              onClick={() => {}}
            />
          )}
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
