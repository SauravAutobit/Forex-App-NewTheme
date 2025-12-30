import Button from "../../components/button/Button";
import EditOrderList from "../../components/editOrderList/EditOrderList";
import { type ProfitBalanceProps } from "../../components/editOrderList/EditOrderList";
import MarketCard from "../../components/marketCard/MarketCard";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
import CheckList from "../../components/checkList/CheckList";
import Counter from "../../components/counter/Counter";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { Position } from "../../store/slices/positionsSlice";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const MarketEdit = () => {
  const theme = useSelector((s: RootState) => s.theme.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const position = location.state?.position as Position | undefined;

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

  // Calculate P&L roughly or use pre-calculated if available in Position type
  // Note: Position type has 'closed_pnl' for closed, but for open?
  // Usually calculated live. For now, showing placeholder or basic calcs if needed.
  // We'll stick to static/passed data. P&L usually needs live quote.
  const pnlDisplay = "$0.00"; // Ideally calculated with live quotes

  const profitBalanceProps: ProfitBalanceProps = {
    balanceItems: [
      { label: "Open  time", value: formatTime(position?.created_at) },
      { label: "Gross Profit", value: pnlDisplay }, // Placeholder, needs live calculation or passed P&L
      { label: "Overnight Fee", value: "$0.00" }, // Need swap data
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
              <Counter label="Take Profit" />
              <Counter label="Stop Loss" />
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
              />
              <Button
                label="Confirm"
                textShadow="1px 1px 3.5px 0px #02900B"
                width="169.5px"
                height="44px"
                bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
                textColor="#FAFAFA"
                fontWeight={500}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];
  return (
    <div>
      <MarketCard
        key={1}
        code={`EUR/GBP ${1}`}
        bid={1678.256369}
        ask={1078.256369}
        high={253659}
        low={235698}
        ltp={30}
        close={23.22}
        pip={"5asa"}
        timestamp={"15:23:00"}
        onClick={() => console.log("hey")}
        border={false}
        // active={active}
        // favourites={isFlag.favourites?.status}
      />

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
