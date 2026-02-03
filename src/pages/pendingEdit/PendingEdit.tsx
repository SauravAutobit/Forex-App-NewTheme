import PositionCard from "../../components/positionCard/PositionCard";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";
// import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
// import Button from "../../components/button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "../../layout/MainLayout";
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
import { setSelectedInstrument } from "../../store/slices/instrumentsSlice";

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
    (state: RootState) => state.instruments.data,
  );
  const theme = useSelector((s: RootState) => s.theme.mode);

  // Form State
  const [lot, setLot] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [sl, setSl] = useState<number>(0);
  const [tp, setTp] = useState<number>(0);

  const [priceStep, setPriceStep] = useState(0.0001);
  const [activeTabId, setActiveTabId] = useState("info");

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

  // Resolve initial TP/SL from metadata
  const initialTp = useMemo(() => {
    return order?.metadata?.legs?.target ?? 0;
  }, [order]);

  const initialSl = useMemo(() => {
    return order?.metadata?.legs?.stoploss ?? 0;
  }, [order]);

  // Initialize form state when order loads
  useEffect(() => {
    if (order) {
      const cs = order.contract_size || 1;
      setLot((order.placed_qty || 0) / cs);
      setPrice(order.price || 0);
      setSl(initialSl);
      setTp(initialTp);
    }
  }, [order, initialSl, initialTp]);

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
      // {
      //   label: "History",
      //   value: <img src={rightArrowHistory} alt="rightArrowHistory" />,
      // },
    ],
    marginTop: "16px",
  };

  const handleCancel = useCallback(async () => {
    if (order?.id) {
      dispatch(
        setOrderStatus({ status: "loading", message: "Canceling order..." }),
      );
      try {
        await dispatch(cancelOrder(order.id)).unwrap();
        dispatch(
          setOrderStatus({
            status: "succeeded",
            message: "Order canceled successfully",
          }),
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
          }),
        );
      }
    }
  }, [order, dispatch, navigate]);

  const handleConfirm = useCallback(async () => {
    if (!order) return;

    const cs = order.contract_size || 1;
    let hasChanges = false;
    let updateMessage = "Updating order...";

    const newPrice = price;
    const newQty = lot * cs;

    // Check Price Change
    if (newPrice !== order.price) hasChanges = true;

    // Check Qty Change
    if (newQty !== order.placed_qty) hasChanges = true;

    // TP Logic
    if (initialTp > 0) {
      if (!tp || tp === 0) {
        hasChanges = true;
      } else if (tp !== initialTp) {
        hasChanges = true;
      }
    } else if (tp && tp > 0) {
      hasChanges = true;
    }

    // SL Logic
    if (initialSl > 0) {
      if (!sl || sl === 0) {
        hasChanges = true;
      } else if (sl !== initialSl) {
        hasChanges = true;
      }
    } else if (sl && sl > 0) {
      hasChanges = true;
    }

    if (!hasChanges) {
      navigate(-1);
      return;
    }

    dispatch(setOrderStatus({ status: "loading", message: updateMessage }));

    try {
      await dispatch(
        updateOrder({
          id: order.id,
          account_id: order.account_id,
          order_type: order.order_type,
          price: newPrice,
          qty: newQty,
          side: order.side,
          stoploss: sl, 
          target: tp, 
        }),
      ).unwrap();

      dispatch(
        setOrderStatus({
          status: "succeeded",
          message: "Order updated successfully",
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate(-1);
    } catch (error) {
      console.error("Update failed", error);
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "Failed to update order",
        }),
      );
    }
  }, [order, dispatch, navigate, price, lot, tp, sl, initialTp, initialSl]);

  if (!order) {
    return (
      <div className="p-5 text-center text-primary">No order selected</div>
    );
  }

  const contractSize = order.contract_size || 1;
  const isQtyDisabled = !!order.position_id;

  const InfoTabContent = (
    //250px h-[calc(100vh-280px)]
    <div className="px-5">
      <div className="flex flex-col justify-between h-full">
        <div>
          <EditOrderList
            {...profitBalanceProps}
            // onClick={() =>
            //   navigate("/app/editHistory", { state: { type: "pending" } })
            // }
            lastListColor={true}
          />
        </div>
      </div>
    </div>
  );

  const EditTabContent = (
    // 250px h-[calc(100vh-280px)]
    <div className="px-5 overflow-y-auto">
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2.5 mt-4">
          <div
            // gap-1
            className={`flex items-center gap-2.5 ${
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
      </div>
    </div>
  );

  // Context for Trade Buttons
  const { setTradeButtonsData } = useOutletContext<OutletContextType>();

  useEffect(() => {
    // Only set context data if active tab needs it
    if (activeTabId === "info") {
      setTradeButtonsData({
        leftButton: {
          label: "Show Chart",
          onClick: () => {
            dispatch(setSelectedInstrument(order.instrument_id));
            navigate("/app/charts");
          },
          bgColor: theme === "dark" ? "#2D2D2D" : "#FAFAFA",
          textColor: theme === "dark" ? "#FAFAFA" : "#2D2D2D",
          border: "1px solid #505050",
        },
        rightButton: {
          label: "Cancel Order",
          onClick: handleCancel,
          bgColor: theme === "dark" ? "#FE0000" : "#DD3C48",
          textColor: "#FAFAFA",
          fontWeight: 500,
        },
      });
    } else if (activeTabId === "edit") {
      setTradeButtonsData({
        leftButton: {
          label: "Discard",
          onClick: () => navigate(-1),
          bgColor: theme === "dark" ? "#505050" : "#E5E5E5",
          textColor: theme === "dark" ? "#FAFAFA" : "#2D2D2D",
          border: theme === "dark" ? "1px solid #505050" : "1px solid #D6D6D6",
        },
        rightButton: {
          label: "Update",
          onClick: handleConfirm,
          bgColor: theme === "dark" ? "#02F511" : "#00B22D",
          textColor: "#FAFAFA",
          fontWeight: 500,
          textShadow: "1px 1px 3.5px 0px #02900B",
        },
      });
    }
    return () => setTradeButtonsData(null);
  }, [
    activeTabId,
    theme,
    handleCancel,
    handleConfirm,
    navigate,
    setTradeButtonsData,
  ]);

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
        <NavigationTabs
          tabs={tabsData}
          className="max-w-md mx-auto"
          defaultActiveTab={activeTabId}
          onActiveTabChange={(id) => setActiveTabId(id)}
        />
      </div>
    </div>
  );
};

export default PendingEdit;
