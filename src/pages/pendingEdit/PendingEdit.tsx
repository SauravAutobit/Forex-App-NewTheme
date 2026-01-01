import PositionCard from "../../components/positionCard/PositionCard";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
import Button from "../../components/button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  type OpenOrder,
  cancelOrder,
  updateOrder,
} from "../../store/slices/openOrdersSlice";
import { setOrderStatus } from "../../store/slices/orderStatusSlice";
import { useAppSelector } from "../../store/hook";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import Counter from "../../components/counter/Counter";
import CheckList from "../../components/checkList/CheckList";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const PendingEdit = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const orderSnapshot = location.state?.order as OpenOrder | undefined;

  const allOrders = useAppSelector((state) => state.openOrders.orders);
  const order = useMemo(() => {
    return allOrders.find((o) => o.id === orderSnapshot?.id) || orderSnapshot;
  }, [allOrders, orderSnapshot]);

  const instrumentsData = useSelector(
    (state: RootState) => state.instruments.data
  );
  const theme = useSelector((s: RootState) => s.theme.mode);

  // Form State
  const [lot, setLot] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [sl, setSl] = useState<number>(0);
  const [tp, setTp] = useState<number>(0);
  const [priceStep, setPriceStep] = useState(0.0001);

  // Initialize Price Step based on Instrument
  useEffect(() => {
    if (order && instrumentsData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allInstruments = Object.values(instrumentsData).flat() as any[];
      const instr = allInstruments.find((i) => i.id === order.instrument_id);

      if (instr) {
        let step = 0.0001;
        const staticData = instr.static_data;
        if (staticData?.ticksize) {
          step = Number(staticData.ticksize);
        } else if (staticData?.tick_size) {
          step = Number(staticData.tick_size);
        } else if (staticData?.pip) {
          step = Number(staticData.pip);
        }
        setPriceStep(step);
      }
    }
  }, [order, instrumentsData]);

  // Initialize form state when order loads
  useEffect(() => {
    if (order) {
      const cs = order.contract_size || 1;
      setLot((order.placed_qty || 0) / cs);
      setPrice(order.price || 0);
      setSl(order.metadata?.legs?.stoploss || 0);
      setTp(order.metadata?.legs?.target || 0);
    }
  }, [order]);

  const [activeOptions, setActiveOptions] = useState<Record<string, boolean>>({
    trailingStop: false,
    breakEven: false,
    orderExpiration: false,
  });

  const editOptions = [
    { label: "Trailing stop", key: "trailingStop" },
    { label: "Break even", key: "breakEven" },
    { label: "Order expiration", key: "orderExpiration" },
  ];

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

  const handleCancel = async () => {
    if (order?.id) {
      dispatch(
        setOrderStatus({ status: "loading", message: "Canceling order..." })
      );
      try {
        await dispatch(cancelOrder(order.id)).unwrap();
        dispatch(
          setOrderStatus({
            status: "succeeded",
            message: "Order canceled successfully",
          })
        );
        // Wait for user to see the success message
        await new Promise((resolve) => setTimeout(resolve, 2000));
        navigate(-1);
      } catch (error) {
        console.error("Cancel failed", error);
        dispatch(
          setOrderStatus({
            status: "failed",
            message: "Failed to cancel order",
          })
        );
      }
    }
  };

  const handleUpdate = async () => {
    if (order) {
      const cs = order.contract_size || 1;
      dispatch(
        setOrderStatus({ status: "loading", message: "Updating order..." })
      );
      try {
        await dispatch(
          updateOrder({
            id: order.id,
            account_id: order.account_id,
            order_type: order.order_type,
            price: price,
            qty: lot * cs,
            side: order.side,
            stoploss: sl,
            target: tp,
          })
        ).unwrap();
        dispatch(
          setOrderStatus({
            status: "succeeded",
            message: "Order updated successfully",
          })
        );
        // Wait for user to see the success message
        await new Promise((resolve) => setTimeout(resolve, 2000));
        navigate(-1);
      } catch (error) {
        console.error("Update failed", error);
        dispatch(
          setOrderStatus({
            status: "failed",
            message: "Failed to update order",
          })
        );
      }
    }
  };

  if (!order) {
    return (
      <div className="p-5 text-center text-primary">No order selected</div>
    );
  }

  const contractSize = order.contract_size || 1;
  const isQtyDisabled = !!order.position_id;

  const InfoTabContent = (
    <div className="px-5 h-[calc(100vh-250px)]">
      <div className="flex flex-col justify-between h-full">
        <div>
          <EditOrderList
            {...profitBalanceProps}
            onClick={() =>
              navigate("/app/editHistory", { state: { type: "pending" } })
            }
            lastListColor={true}
          />
        </div>
        <div className="flex items-center justify-between mt-3 mb-2.5">
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
    </div>
  );

  const EditTabContent = (
    <div className="px-5 h-[calc(100vh-250px)] overflow-y-auto">
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2.5 mt-5">
          <div
            className={`flex items-center gap-1 ${
              isQtyDisabled ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Counter
              label="Vol"
              initialValue={lot * contractSize}
              min={contractSize}
              step={contractSize}
              onValueChange={(val) =>
                !isQtyDisabled && setLot(val / contractSize)
              }
            />
            <span className="text-secondary mt-7">or</span>
            <Counter
              label="Lot"
              initialValue={lot}
              min={1}
              step={1}
              onValueChange={(val) => !isQtyDisabled && setLot(val)}
            />
          </div>
          {isQtyDisabled && (
            <div className="text-xs text-loss">
              Quantity cannot be edited for this order.
            </div>
          )}

          <Counter
            label="Price"
            initialValue={price}
            onValueChange={setPrice}
            step={priceStep}
          />
          <Counter
            label="Take Profit"
            initialValue={tp}
            onValueChange={setTp}
            step={priceStep}
          />
          <Counter
            label="Stop Loss"
            initialValue={sl}
            onValueChange={setSl}
            step={priceStep}
          />
          <CheckList
            activeOptions={activeOptions}
            setActiveOptions={setActiveOptions}
            options={editOptions}
            readOnly={true}
          />
        </div>
        <div className="flex items-center justify-between mt-3 mb-2.5">
          <Button
            label="Discard"
            width="169.5px"
            height="44px"
            bgColor={theme === "dark" ? "#505050" : "#E5E5E5"}
            textColor={theme === "dark" ? "#FAFAFA" : "#2D2D2D"}
            border={
              theme === "dark" ? "1px solid #505050" : "1px solid #D6D6D6"
            }
            onClick={() => navigate(-1)}
          />
          <Button
            label="Update"
            textShadow="1px 1px 3.5px 0px #02900B"
            width="169.5px"
            height="44px"
            bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
            textColor="#FAFAFA"
            fontWeight={500}
            onClick={handleUpdate}
          />
        </div>
      </div>
    </div>
  );

  const tabsData: TabItem[] = [
    { id: "info", label: "Info", content: InfoTabContent },
    { id: "edit", label: "Edit", content: EditTabContent },
  ];

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto">
      <div>
        <PositionCard
          position={{} as any}
          openOrderData={order}
          label="Orders"
          onClick={() => {}}
          hideBorder={true}
        />
        <NavigationTabs tabs={tabsData} className="max-w-md mx-auto" />
      </div>
    </div>
  );
};

export default PendingEdit;
