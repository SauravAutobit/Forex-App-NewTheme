import { closePosition, placeNewOrder } from "../../store/slices/ordersSlice";
import { setOrderStatus } from "../../store/slices/orderStatusSlice";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import Button from "../button/Button";

interface OrderButtonsProps {
  instrumentId: string | null;
  selectedOrderType: "market" | "limit" | "stop";
  contractSize: number | null;
  selectedLot: number;
  orderPrice: number | null;
  stoploss: number;
  target: number;
  mode: "newOrder" | "closePosition" | "modifyPosition";
  originalSide?: "buy" | "sell";
  positionIdToClose?: string;
}

const OrderButtons = ({
  instrumentId,
  selectedOrderType,
  contractSize,
  selectedLot,
  orderPrice,
  stoploss,
  target,
  mode,
  originalSide,
  positionIdToClose,
}: OrderButtonsProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.theme.mode);
  const { status: orderStatus } = useAppSelector((state) => state.orderStatus);

  const [livePnl, setLivePnl] = useState<number>(0);
  const selectedPosition = useSelector((state: RootState) =>
    state.positions.positions.find((pos) => pos.id === positionIdToClose)
  );

  const selectedQuote = useSelector((state: RootState) =>
    state.quotes.quotes.find((q) => q.id === instrumentId)
  );

  useEffect(() => {
    if (selectedPosition) {
      const { price, qty, side, live_bid, live_ask } = selectedPosition;
      let pnl = 0;
      if (live_bid && live_ask) {
        if (side === "buy") {
          pnl = (live_bid - price) * qty;
        } else if (side === "sell") {
          pnl = (price - live_ask) * qty;
        }
      }
      setLivePnl(pnl);
    }
  }, [selectedPosition]);

  useEffect(() => {
    if (orderStatus === "succeeded") {
      const timer = setTimeout(() => {
        if (mode === "newOrder" || mode === "closePosition") {
          navigate("/trade");
        }
        if (mode === "modifyPosition") {
          dispatch(setOrderStatus({ status: "idle", message: "" }));
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (orderStatus === "failed") {
      const timer = setTimeout(() => {
        dispatch(setOrderStatus({ status: "idle", message: "" }));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [orderStatus, mode, navigate, dispatch]);

  const handlePlaceOrder = (side: "buy" | "sell") => {
    if (orderStatus === "loading") return;

    if (!instrumentId || !contractSize) {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "Missing instrument or contract size.",
        })
      );
      return;
    }

    if (selectedOrderType !== "market" && !orderPrice) {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "Price is required for limit/stop orders.",
        })
      );
      return;
    }

    let basePrice: number | null = null;
    if (selectedOrderType === "market") {
      basePrice =
        side === "buy"
          ? selectedQuote?.ask ?? null
          : selectedQuote?.bid ?? null;
    } else {
      basePrice = orderPrice;
    }

    if (!basePrice || basePrice <= 0) {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "Invalid base price for validation.",
        })
      );
      return;
    }

    if (stoploss > 0 || target > 0) {
      if (side === "buy") {
        if (stoploss > 0 && stoploss >= basePrice) {
          dispatch(
            setOrderStatus({
              status: "failed",
              message:
                "Stop Loss for a BUY order must be below the trade price.",
            })
          );
          return;
        }
        if (target > 0 && target <= basePrice) {
          dispatch(
            setOrderStatus({
              status: "failed",
              message: "Target for a BUY order must be above the trade price.",
            })
          );
          return;
        }
        if (stoploss > 0 && target > 0 && stoploss >= target) {
          dispatch(
            setOrderStatus({
              status: "failed",
              message: "For a BUY, Stop Loss must be less than Target.",
            })
          );
          return;
        }
      } else if (side === "sell") {
        if (stoploss > 0 && stoploss <= basePrice) {
          dispatch(
            setOrderStatus({
              status: "failed",
              message:
                "Stop Loss for a SELL order must be above the trade price.",
            })
          );
          return;
        }
        if (target > 0 && target >= basePrice) {
          dispatch(
            setOrderStatus({
              status: "failed",
              message: "Target for a SELL order must be below the trade price.",
            })
          );
          return;
        }
        if (stoploss > 0 && target > 0 && stoploss <= target) {
          dispatch(
            setOrderStatus({
              status: "failed",
              message: "For a SELL, Stop Loss must be greater than Target.",
            })
          );
          return;
        }
      }
    }

    const price = selectedOrderType === "market" ? 0 : orderPrice;
    const orderQuantity = selectedLot * (contractSize || 0);

    if (mode === "closePosition" && selectedPosition) {
      if (orderQuantity > selectedPosition.qty) {
        dispatch(
          setOrderStatus({
            status: "failed",
            message:
              "Quantity to close cannot be more than the open position size.",
          })
        );
        return;
      }
    }

    if (instrumentId) {
      if (mode === "closePosition" && positionIdToClose && originalSide) {
        const closingSide = originalSide === "buy" ? "sell" : "buy";
        dispatch(
          closePosition({
            instrument_id: instrumentId,
            qty: orderQuantity,
            price: 0,
            order_type: "market",
            side: closingSide,
            stoploss: 0,
            target: 0,
            position_id: positionIdToClose,
          })
        );
      } else {
        dispatch(
          placeNewOrder({
            instrument_id: instrumentId,
            qty: orderQuantity,
            price: price || 0,
            order_type: selectedOrderType as "market" | "limit" | "stop",
            side,
            stoploss,
            target,
          })
        );
      }
    }
  };

  const renderButtons = () => {
    if (mode === "closePosition") {
      const bgColor =
        theme === "dark"
          ? livePnl >= 0
            ? "#02F511"
            : "#FE0000"
          : livePnl >= 0
          ? "#00B22D"
          : "#DD3C48";

      const buttonText = livePnl >= 0 ? "Close with Profit" : "Close with Loss";

      return (
        <div className="flex flex-col w-full mt-3">
          <Button
            onClick={() =>
              handlePlaceOrder(originalSide === "buy" ? "sell" : "buy")
            }
            width="353px"
            height="44px"
            bgColor={theme === "dark" ? "#181818" : bgColor}
            textColor={
              theme === "dark"
                ? livePnl >= 0
                  ? "#02F511"
                  : "#FE0000"
                : "#FAFAFA"
            }
            fontWeight={600}
            border={livePnl >= 0 ? "1px solid #02F511" : "1px solid #FE0000"}
            label={
              <div className="flex items-center justify-center gap-2">
                <span>
                  {orderStatus === "loading" ? "Closing..." : buttonText}
                </span>
                <span className="font-bold">{livePnl.toFixed(2)}</span>
              </div>
            }
          />
        </div>
      );
    }

    if (mode === "modifyPosition") {
      return (
        <div className="flex flex-col w-full mt-3">
          <Button
            label="Modify"
            width="353px"
            height="44px"
            bgColor={theme === "dark" ? "#FF8C00B2" : "#FF8C00"}
            textColor="#FAFAFA"
            fontWeight={600}
            onClick={() => console.log("Modifying position...")}
          />
        </div>
      );
    }

    if (selectedOrderType === "market") {
      return (
        <div
          className="flex items-center justify-between mt-3"
          // style={{ marginBottom: "42px" }}
        >
          <Button
            onClick={() => handlePlaceOrder("sell")}
            label={
              <>
                Sell{" "}
                <span style={{ fontSize: "20px", marginLeft: "10px" }}>
                  {selectedQuote?.bid?.toFixed(2) || "0.00"}
                </span>
              </>
            }
            width="169.5px"
            height="44px"
            bgColor={theme === "dark" ? "#FE0000" : "#DD3C48"}
            textColor="#FAFAFA"
            fontWeight={600}
          />
          <Button
            onClick={() => handlePlaceOrder("buy")}
            label={
              <>
                Buy{" "}
                <span style={{ fontSize: "20px", marginLeft: "10px" }}>
                  {selectedQuote?.ask?.toFixed(2) || "0.00"}
                </span>
              </>
            }
            width="169.5px"
            height="44px"
            bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
            textColor="#FAFAFA"
            fontWeight={600}
          />
        </div>
      );
    } else {
      return (
        <div className="mt-3">
          <Button
            onClick={() => handlePlaceOrder("buy")}
            label={
              <>
                Place{" "}
                <span style={{ fontSize: "20px", marginLeft: "10px" }}>
                  {selectedQuote?.ask?.toFixed(2) || "0.00"}
                </span>
              </>
            }
            width="353px"
            height="44px"
            bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
            textColor="#FAFAFA"
            fontWeight={600}
          />
        </div>
      );
    }
  };

  return <div className="w-full">{renderButtons()}</div>;
};

export default OrderButtons;
