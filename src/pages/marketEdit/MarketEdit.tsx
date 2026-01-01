import PositionCard from "../../components/positionCard/PositionCard";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../store/store";
import { updateOrder, cancelOrder } from "../../store/slices/openOrdersSlice";
import { placeNewOrder, closePosition } from "../../store/slices/ordersSlice";
import { setOrderStatus } from "../../store/slices/orderStatusSlice";

import Button from "../../components/button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useAppSelector } from "../../store/hook";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
import Counter from "../../components/counter/Counter";
import CheckList from "../../components/checkList/CheckList";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const MarketEdit = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const positionSnapshot = location.state?.position;

  // Real-time position update
  const allPositions = useAppSelector((state) => state.positions.positions);
  const position = useMemo(() => {
    return (
      allPositions.find((p) => p.id === positionSnapshot?.id) ||
      positionSnapshot
    );
  }, [allPositions, positionSnapshot]);

  const instrumentsData = useSelector(
    (state: RootState) => state.instruments.data
  );
  const theme = useSelector((s: RootState) => s.theme.mode);

  const [tp, setTp] = useState(0);
  const [sl, setSl] = useState(0);
  const [activeTabId, setActiveTabId] = useState("info");
  const [priceStep, setPriceStep] = useState(0.0001);

  // Initialize Price Step based on Instrument
  useEffect(() => {
    if (position && instrumentsData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allInstruments = Object.values(instrumentsData).flat() as any[];
      const instr = allInstruments.find((i) => i.id === position.instrument_id);

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
  }, [position, instrumentsData]);

  // Resolve initial TP/SL from position torders
  const initialTp = useMemo(() => {
    const tpOrder = position?.torders?.find(
      (o: any) => o.order_type === "limit"
    );
    return tpOrder?.price ?? tpOrder?.metadata?.legs?.target ?? 0;
  }, [position]);

  const initialSl = useMemo(() => {
    const slOrder = position?.torders?.find(
      (o: any) => o.order_type === "stop"
    );
    return slOrder?.price ?? slOrder?.metadata?.legs?.stoploss ?? 0;
  }, [position]);

  useEffect(() => {
    setTp(initialTp);
    setSl(initialSl);
  }, [initialTp, initialSl]);

  const handleClosePosition = () => {
    if (position) {
      dispatch(
        closePosition({
          instrument_id: position.instrument_id,
          qty: position.qty,
          price: 0,
          order_type: "market",
          side: position.side === "buy" ? "sell" : "buy",
          stoploss: 0,
          target: 0,
          position_id: position.id,
        })
      );
      navigate(-1);
    }
  };

  const handleConfirm = async () => {
    if (!position) return;

    dispatch(
      setOrderStatus({ status: "loading", message: "Updating orders..." })
    );

    const originalTpOrder = position.torders?.find(
      (o: any) => o.order_type === "limit"
    );
    const originalSlOrder = position.torders?.find(
      (o: any) => o.order_type === "stop"
    );

    const promises = [];

    // TP Logic
    if (originalTpOrder) {
      if (!tp || tp === 0) {
        promises.push(dispatch(cancelOrder(originalTpOrder.id)).unwrap());
      } else if (tp !== originalTpOrder.price) {
        promises.push(
          dispatch(
            updateOrder({
              id: originalTpOrder.id,
              account_id: position.account_id,
              order_type: "limit",
              price: tp,
              qty: position.qty,
              side: position.side === "buy" ? "sell" : "buy",
              stoploss: 0,
              target: 0,
            })
          ).unwrap()
        );
      }
    } else if (tp && tp > 0) {
      promises.push(
        dispatch(
          placeNewOrder({
            instrument_id: position.instrument_id,
            qty: position.qty,
            price: tp,
            order_type: "limit",
            side: position.side === "buy" ? "sell" : "buy",
            stoploss: 0,
            target: 0,
            position_id: position.id,
          })
        ).unwrap()
      );
    }

    // SL Logic
    if (originalSlOrder) {
      if (!sl || sl === 0) {
        promises.push(dispatch(cancelOrder(originalSlOrder.id)).unwrap());
      } else if (sl !== originalSlOrder.price) {
        promises.push(
          dispatch(
            updateOrder({
              id: originalSlOrder.id,
              account_id: position.account_id,
              order_type: "stop",
              price: sl,
              qty: position.qty,
              side: position.side === "buy" ? "sell" : "buy",
              stoploss: 0,
              target: 0,
            })
          ).unwrap()
        );
      }
    } else if (sl && sl > 0) {
      promises.push(
        dispatch(
          placeNewOrder({
            instrument_id: position.instrument_id,
            qty: position.qty,
            price: sl,
            order_type: "stop",
            side: position.side === "buy" ? "sell" : "buy",
            stoploss: 0,
            target: 0,
            position_id: position.id,
          })
        ).unwrap()
      );
    }

    try {
      await Promise.all(promises);
      dispatch(
        setOrderStatus({
          status: "succeeded",
          message: "Orders updated successfully",
        })
      );
      // Wait for user to see the success message
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate(-1);
    } catch (error) {
      console.error("Failed to update orders", error);
      dispatch(
        setOrderStatus({ status: "failed", message: "Failed to update orders" })
      );
    }
  };

  if (!position) {
    return <div className="p-5 text-primary">No position selected</div>;
  }

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
      { label: "Create time", value: formatTime(position.created_at) },
      { label: "Take profit", value: formatPrice(initialTp) },
      { label: "Stop loss", value: formatPrice(initialSl) },
      { label: "Position ID", value: `#${position.tid || position.id}` },
      { label: "Swap", value: "0.00" },
      {
        label: "History",
        value: <img src={rightArrowHistory} alt="rightArrowHistory" />,
      },
    ],
    marginTop: "16px",
  };

  const InfoTabContent = (
    <div className="px-5 h-[calc(100vh-250px)]">
      <div className="flex flex-col justify-between h-full">
        <div>
          <EditOrderList
            {...profitBalanceProps}
            onClick={() =>
              navigate("/app/editHistory", { state: { type: "position" } })
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
            label="Close Position"
            width="169.5px"
            height="44px"
            bgColor={theme === "dark" ? "#FE0000" : "#DD3C48"}
            textColor="#FAFAFA"
            fontWeight={500}
            onClick={handleClosePosition}
          />
        </div>
      </div>
    </div>
  );

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

  const EditTabContent = (
    <div className="px-5 h-[calc(100vh-250px)] overflow-y-auto">
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2.5 mt-5">
          <Counter
            label="Take Profit"
            initialValue={tp}
            step={priceStep}
            onValueChange={setTp}
          />
          <Counter
            label="Stop Loss"
            initialValue={sl}
            step={priceStep}
            onValueChange={setSl}
          />
          <CheckList
            activeOptions={activeOptions}
            setActiveOptions={setActiveOptions}
            options={editOptions}
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
            label="Confirm"
            textShadow="1px 1px 3.5px 0px #02900B"
            width="169.5px"
            height="44px"
            bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
            textColor="#FAFAFA"
            fontWeight={500}
            onClick={handleConfirm}
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
          position={position}
          label="Position"
          onClick={() => {}}
          hideBorder={true}
        />
        <NavigationTabs
          tabs={tabsData}
          defaultActiveTab={activeTabId}
          onActiveTabChange={(id) => setActiveTabId(id)}
          className="max-w-md mx-auto"
        />
      </div>
    </div>
  );
};

export default MarketEdit;
