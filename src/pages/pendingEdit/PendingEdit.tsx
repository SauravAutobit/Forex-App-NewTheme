import PendingCard from "../../components/pendingCard/PendingCard";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
import Button from "../../components/button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { OpenOrder } from "../../store/slices/openOrdersSlice";

const PendingEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order as OpenOrder | undefined;

  // Format Helpers
  const formatPrice = (p?: number) =>
    p !== undefined ? p.toFixed(5) : "0.00000";
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

  const profitBalanceProps: ProfitBalanceProps = {
    balanceItems: [
      { label: "Create time", value: formatTime(order?.placed_time) },
      {
        label: "Take profit",
        value: formatPrice(order?.metadata?.legs?.target),
      },
      {
        label: "Stop loss",
        value: formatPrice(order?.metadata?.legs?.stoploss),
      },
      {
        label: "Position ID",
        value: order?.id ? `#${order.tid || order.id}` : "-",
      },
      {
        label: "History",
        value: <img src={rightArrowHistory} alt="rightArrowHistory" />,
      },
    ],
    marginTop: "16px",
  };

  const editHistoryHandler = () => {
    navigate("/app/editHistory", { state: { type: "pending" } });
  };
  const theme = useSelector((s: RootState) => s.theme.mode);

  if (!order) {
    return <div className="p-5 text-center">No order selected</div>;
  }

  return (
    <div className="h-[calc(100vh-122px)]">
      <div className="flex flex-col justify-between h-full">
        <div>
          <PendingCard
            key={order.id}
            code={order.trading_name || "Unknown"}
            bid={0} // These would typically come from live quotes if subscribed
            ask={0}
            high={0}
            low={0}
            ltp={0}
            close={0}
            pip={""}
            timestamp={
              formatTime(order.placed_time).split(",")[1]?.trim() || ""
            }
            onClick={() => {}}
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
            label={<div className="flex flex-col">Cancel Order</div>}
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
