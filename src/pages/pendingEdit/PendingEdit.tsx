import PositionCard from "../../components/positionCard/PositionCard";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
import Button from "../../components/button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  type OpenOrder,
  cancelOrder,
} from "../../store/slices/openOrdersSlice";
import { useAppSelector } from "../../store/hook";

const PendingEdit = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const orderSnapshot = location.state?.order as OpenOrder | undefined;

  // Select latest order from store
  const allOrders = useAppSelector((state) => state.openOrders.orders);
  const order = useMemo(() => {
    return allOrders.find((o) => o.id === orderSnapshot?.id) || orderSnapshot;
  }, [allOrders, orderSnapshot]);

  const theme = useSelector((s: RootState) => s.theme.mode);

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

  const handleCancel = () => {
    if (order?.id) {
      dispatch(cancelOrder(order.id));
      navigate(-1);
    }
  };

  if (!order) {
    return (
      <div className="p-5 text-center text-primary">No order selected</div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto pb-5">
      <div>
        <PositionCard
          position={{} as any}
          openOrderData={order}
          label="Orders"
          onClick={() => {}}
        />
        <div className="px-5">
          <EditOrderList
            {...profitBalanceProps}
            onClick={() =>
              navigate("/app/editHistory", { state: { type: "pending" } })
            }
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
          label="Cancel Order"
          width="169.5px"
          height="44px"
          bgColor={theme === "dark" ? "#FE0000" : "#DD3C48"}
          textColor="#FAFAFA"
          fontWeight={500}
          onClick={handleCancel}
        />
      </div>
    </div>
  );
};

export default PendingEdit;
