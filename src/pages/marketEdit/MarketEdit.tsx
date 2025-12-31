import { useState, useMemo } from "react";
import Button from "../../components/button/Button";
import EditOrderList from "../../components/editOrderList/EditOrderList";
import { type ProfitBalanceProps } from "../../components/editOrderList/EditOrderList";
// import MarketCard from "../../components/marketCard/MarketCard";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
import CheckList from "../../components/checkList/CheckList";
import Counter from "../../components/counter/Counter";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { type Position } from "../../store/slices/positionsSlice";
import { useAppSelector } from "../../store/hook";
import PositionCard from "../../components/positionCard/PositionCard";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../store/store";
import { updateOrder } from "../../store/slices/openOrdersSlice";
import { closePosition } from "../../store/slices/ordersSlice";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const MarketEdit = () => {
  const theme = useSelector((s: RootState) => s.theme.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const positionSnapshot = location.state?.position as Position | undefined;

  // Select latest position data from store to get live quotes/PnL
  const allPositions = useAppSelector((state) => state.positions.positions);
  const position = useMemo(() => {
    return (
      allPositions.find((p) => p.id === positionSnapshot?.id) ||
      positionSnapshot
    );
  }, [allPositions, positionSnapshot]);

  const [activeOptions, setActiveOptions] = useState<Record<string, boolean>>({
    trailingStop: false,
    breakEven: false,
    orderExpiration: false,
  });

  const dispatch = useDispatch<AppDispatch>();

  // Resolve initial TP/SL from position torders
  const initialTp = useMemo(() => {
    const tpOrder = position?.torders?.find((o) => o.order_type === "limit");
    return tpOrder?.metadata?.legs?.target ?? 0;
  }, [position]);

  const initialSl = useMemo(() => {
    const slOrder = position?.torders?.find((o) => o.order_type === "stop");
    return slOrder?.metadata?.legs?.stoploss ?? 0;
  }, [position]);

  const [tp, setTp] = useState(initialTp);
  const [sl, setSl] = useState(initialSl);

  const editOptions = [
    { label: "Trailing stop", key: "trailingStop" },
    { label: "Break even", key: "breakEven" },
    { label: "Order expiration", key: "orderExpiration" },
  ];

  // Helper formats
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

  // Calculate P&L live using Buy -> live_ask, Sell -> live_bid
  const pnl = useMemo(() => {
    if (!position) return 0;
    const currentPrice =
      position.side === "buy" ? position.live_ask : position.live_bid;
    if (currentPrice !== undefined && typeof position.price === "number") {
      if (position.side === "buy") {
        return (currentPrice - position.price) * (position.qty || 0);
      } else if (position.side === "sell") {
        return (position.price - currentPrice) * (position.qty || 0);
      }
    }
    return 0;
  }, [position]);

  const pnlDisplay = `${pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toFixed(2)}`;

  const profitBalanceProps: ProfitBalanceProps = {
    balanceItems: [
      { label: "Open time", value: formatTime(position?.created_at) },
      {
        label: "Gross Profit",
        value: (
          <span className={pnl >= 0 ? "text-profit" : "text-loss"}>
            {pnlDisplay}
          </span>
        ),
      },
      { label: "Overnight Fee", value: "0.00" }, // Swap logic if needed
      {
        label: "Position ID",
        value: position?.id ? `#${position.tid || position.id}` : "-",
      },
      {
        label: "History",
        value: <img src={rightArrowHistory} alt="rightArrowHistory" />,
      },
    ],
    marginTop: "16px",
  };

  const editHistoryHandler = () => {
    navigate("/app/editHistory", { state: { type: "market" } });
  };

  if (!position) {
    return <div className="p-5 text-center">No position selected</div>;
  }

  const handleClosePosition = () => {
    if (position) {
      // OLD APP Logic: Close position by placing an opposite market order
      const closingSide = position.side === "buy" ? "sell" : "buy";
      dispatch(
        closePosition({
          instrument_id: position.instrument_id,
          qty: position.qty,
          price: 0, // Market order
          order_type: "market",
          side: closingSide,
          stoploss: 0,
          target: 0,
          position_id: position.id,
        })
      );
      navigate(-1);
    }
  };

  const tabsData: TabItem[] = [
    {
      id: "info",
      label: "Info",
      content: (
        <div className="px-5 h-[calc(100vh-250px)]">
          <div className="flex flex-col justify-between h-full">
            <div>
              <EditOrderList
                {...profitBalanceProps}
                onClick={editHistoryHandler}
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
                label={
                  <div className="flex flex-col">
                    Close Order
                    <div>{pnlDisplay}</div>
                  </div>
                }
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
      ),
    },
    {
      id: "edit",
      label: "Edit",
      content: (
        <div className="px-5 h-[calc(100vh-250px)]">
          <div className="flex flex-col justify-between h-full">
            <div className="flex flex-col gap-2.5 mt-5">
              <Counter
                label="Take Profit"
                initialValue={tp}
                onValueChange={(val) => setTp(val)}
                step={0.0001}
              />
              <Counter
                label="Stop Loss"
                initialValue={sl}
                onValueChange={(val) => setSl(val)}
                step={0.0001}
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
                onClick={() => {
                  if (position) {
                    dispatch(
                      updateOrder({
                        id: position.id,
                        account_id: position.account_id,
                        order_type: "market",
                        price: position.price,
                        qty: position.qty,
                        side: position.side,
                        stoploss: sl,
                        target: tp,
                      })
                    );
                    navigate(-1);
                  }
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];
  return (
    <div>
      {position && (
        <PositionCard position={position} label="Position" onClick={() => {}} />
      )}

      <NavigationTabs
        tabs={tabsData}
        // defaultActiveTab={activeTabId} // Use state from URL
        // onTabChange={handleTabChange} // New handler for URL update
        className="max-w-md mx-auto"
      />
    </div>
  );
};

export default MarketEdit;
