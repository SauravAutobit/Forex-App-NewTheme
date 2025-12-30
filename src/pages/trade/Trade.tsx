import { useNavigate, useOutletContext } from "react-router-dom";
import InstrumentInfoCard, {
  type ProfitBalanceProps,
} from "../../components/instrumentInfoCard/InstrumentInfoCard";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import type { OutletContextType } from "../../layout/MainLayout";
import BottomDrawer from "../../components/bottomDrawer/BottomDrawer";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import {
  selectAccount,
  fetchAccountBalance,
} from "../../store/slices/accountSlice";
import { fetchPositions } from "../../store/slices/positionsSlice";
import { fetchOpenOrders } from "../../store/slices/openOrdersSlice";
import { fetchHistoryPositions } from "../../store/slices/historyPositionsSlice";
import PositionCard from "../../components/positionCard/PositionCard";
import price from "../../assets/icons/price.svg";
import alphabets from "../../assets/icons/alphabets.svg";
import upArrowFilter from "../../assets/icons/upArrowFilter.svg";
import downArrowFilter from "../../assets/icons/downArrowFilter.svg";
import RadioButton from "../../components/radioButton/RadioButton";
import Button from "../../components/button/Button";
import { useAppSelector } from "../../store/hook";

const menuItems = [{ label: "Instruments" }];

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const Trade = () => {
  // const activeTabId = searchParams.get("tab") || "position"; // Default to 'position'

  const [activeFilter, setActiveFilter] = useState({
    filterOption: "",
    sort: {
      alphabetically: "",
      price: "",
    },
  });

  const [selectedOption, setSelectedOption] = useState("");

  const theme = useAppSelector((state) => state.theme.mode);

  const options = [
    "All currently Open",
    "All profitable",
    "All loosing",
    "All long",
    "All short",
    "Use(-) this if data not available",
  ];

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { setIsFlag, isDrawerOpen, setIsDrawerOpen } =
    useOutletContext<OutletContextType>();

  const apiStatus = useAppSelector((state) => state.websockets.apiStatus);
  const account = useAppSelector(selectAccount);
  const accountStatus = useAppSelector((state) => state.account.status);

  const openPositions = useAppSelector((state) => state.positions.positions);
  const openOrders = useAppSelector((state) => state.openOrders.orders) || [];
  const historyPositions =
    useAppSelector((state) => state.historyPositions.data) || [];

  // Fetch all trade data when connected
  useEffect(() => {
    if (apiStatus === "connected") {
      if (accountStatus === "idle") dispatch(fetchAccountBalance());
      dispatch(fetchPositions());
      dispatch(fetchOpenOrders());

      // Fetch history (last 24h as default)
      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
      dispatch(fetchHistoryPositions(oneDayAgo));
    }
  }, [apiStatus, dispatch]);

  // ✅ P&L CALCULATION (OLD APP Logic)
  const totalPnl = openPositions.reduce((sum, position) => {
    const currentPrice =
      position.side === "buy" ? position.live_bid : position.live_ask;
    let pnl = 0;
    if (currentPrice !== undefined && position.qty !== undefined) {
      if (position.side === "buy") {
        pnl = (currentPrice - position.price) * position.qty;
      } else if (position.side === "sell") {
        pnl = (position.price - currentPrice) * position.qty;
      }
    }
    return sum + pnl;
  }, 0);

  // ✅ CALCULATE USED BALANCE (OLD APP Logic: sum of used_balance from positions)
  const totalUsedBalance = openPositions.reduce(
    (sum, position) => sum + (position.used_balance || 0),
    0
  );

  // ✅ CALCULATE OTHER BALANCES (OLD APP Logic)
  const liveBalance = account?.balance ?? 0;
  const availableBalance = liveBalance - totalUsedBalance;
  const totalValue = liveBalance + totalPnl;

  // Format the values to a currency string (as expected by InstrumentInfoCard)
  const formattedBalance = `$${liveBalance.toFixed(2)}`;
  const formattedUsedBalance = `$${totalUsedBalance.toFixed(2)}`;
  const formattedAvailableBalance = `${
    availableBalance < 0 ? "-" : "+"
  }$${Math.abs(availableBalance).toFixed(2)}`;
  const formattedTotalValue = `$${totalValue.toFixed(2)}`;

  const tabsData: TabItem[] = [
    {
      id: "market",
      label: "Market",
      content: (
        <div>
          {openPositions.map((pos, index) => {
            return (
              <PositionCard
                key={pos.id || index}
                position={pos}
                label="Position"
                onClick={() => {
                  setIsFlag((prev) => ({
                    ...prev,
                    marketEdit: { status: true },
                  }));
                  navigate("/app/marketEdit", { state: { position: pos } });
                }}
                onLongPress={() => {
                  // Keep long press if needed, but click navigates
                }}
              />
            );
          })}
        </div>
      ),
    },
    {
      id: "pending",
      label: "Pending",
      content: (
        <div>
          {openOrders.map((order, index) => {
            return (
              <PositionCard
                key={order.id || index}
                position={{} as any}
                openOrderData={order}
                label="Orders"
                onClick={() => {
                  setIsFlag((prev) => ({
                    ...prev,
                    pendingEdit: { status: true },
                  }));
                  navigate("/app/pendingEdit", { state: { order } });
                }}
                onLongPress={() => {}}
              />
            );
          })}
        </div>
      ),
    },
    {
      id: "closed",
      label: "Close",
      content: (
        <div>
          {historyPositions.map((pos, index) => {
            return (
              <PositionCard
                key={pos.id || index}
                position={{} as any}
                historyPositionData={pos}
                label="History"
                onClick={() => {
                  setIsFlag((prev) => ({
                    ...prev,
                    closedEdit: { status: true },
                  }));
                  navigate("/app/closedEdit", { state: { position: pos } });
                }}
                onLongPress={() => {}}
              />
            );
          })}
        </div>
      ),
    },
  ];

  const profitBalanceProps: ProfitBalanceProps = {
    showProfitLoss: true,
    profitLoss: formattedBalance,
    showBalances: true,
    balanceItems: [
      { label: "Used Balance", value: formattedUsedBalance },
      { label: "Available Balance", value: formattedAvailableBalance },
      { label: "Total Value (Balance+P&F)", value: formattedTotalValue },
    ],
    marginTop: "16px",
  };

  const handleSortClick = (type: "alphabetically" | "price") => {
    setActiveFilter((prev) => {
      const currentState = prev.sort[type];
      let nextState: "" | "asc" | "desc" = "";

      if (currentState === "") nextState = "asc";
      else if (currentState === "asc") nextState = "desc";
      else nextState = ""; // go back to default

      return {
        ...prev,
        sort: {
          ...prev.sort,
          [type]: nextState,
        },
      };
    });
  };

  // helper to get icon based on state
  const getSortIcon = (state: string, type: "alphabetically" | "price") => {
    if (state === "asc") return upArrowFilter;
    if (state === "desc") return downArrowFilter;

    // default icons
    return type === "price" ? price : alphabets;
  };

  return (
    // px-5 py-2.5
    <div className="">
      <InstrumentInfoCard {...profitBalanceProps} marginTop="0" />
      <NavigationTabs
        tabs={tabsData}
        totalPnl={totalPnl}
        // defaultActiveTab={activeTabId} // Use state from URL
        // onTabChange={handleTabChange} // New handler for URL update
        className="max-w-md mx-auto pb-2.5"
      />

      <BottomDrawer
        isOpen={isDrawerOpen.homeDrawer}
        onClose={() =>
          setIsDrawerOpen((prev) => ({ ...prev, homeDrawer: false }))
        }
      >
        {
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-lg font-tertiary mb-2.5">
              Filters
              <span
                className="text-base text-quaternary font-primary"
                onClick={() =>
                  setActiveFilter({
                    filterOption: "",
                    sort: { alphabetically: "", price: "" },
                  })
                }
              >
                Clear
              </span>
            </div>
            <ul className="flex flex-wrap gap-2.5 items-center pb-2.5 border-b border-primary">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={`px-2.5 py-1.5 rounded-[6px] h-[33px] border border-[#878787] ${
                    activeFilter.filterOption === item.label
                      ? "bg-quaternary"
                      : ""
                  }`}
                >
                  <button
                    onClick={() =>
                      setActiveFilter((prev) => ({
                        ...prev,
                        filterOption: item.label,
                      }))
                    }
                    className={`w-full text-left text-secondary ${
                      activeFilter.filterOption === item.label
                        ? "text-[#0C0C0C]"
                        : ""
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="text-lg font-tertiary my-2.5">Sort</div>
            <div>
              <div
                className="py-2.5 flex items-center gap-2.5"
                onClick={() => handleSortClick("alphabetically")}
              >
                <img
                  src={getSortIcon(
                    activeFilter.sort.alphabetically,
                    "alphabetically"
                  )}
                  alt="alphabets"
                />
                <span
                  className={`${
                    activeFilter.sort.alphabetically
                      ? "text-quaternary"
                      : "text-secondary"
                  }`}
                >
                  Alphabatically
                </span>
              </div>
              <div
                className="py-2.5 flex items-center gap-2.5"
                onClick={() => handleSortClick("price")}
              >
                <img
                  src={getSortIcon(activeFilter.sort.price, "price")}
                  alt="price"
                />
                <span
                  className={`${
                    activeFilter.sort.price
                      ? "text-quaternary"
                      : "text-secondary"
                  }`}
                >
                  Price
                </span>
              </div>
            </div>
          </div>
        }
      </BottomDrawer>

      <BottomDrawer
        isOpen={isDrawerOpen.tradeMarketDrawer}
        onClose={() =>
          setIsDrawerOpen((prev) => ({ ...prev, tradeMarketDrawer: false }))
        }
      >
        {
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xl font-tertiary mb-2.5 pb-5 border-b border-primary">
              Which position would you like to close at market prices?
            </div>

            <div className="flex flex-col gap-2.5">
              {options.map((option, index) => (
                <div key={option} className="flex items-center justify-between">
                  <span
                    className={`${
                      theme === "dark"
                        ? index === options.length - 1
                          ? "text-secondary"
                          : ""
                        : index === options.length - 1
                        ? "text-[#505050]"
                        : ""
                    }`}
                  >
                    {option}
                  </span>
                  <div className="flex items-center gap-5">
                    <span className="font-secondary text-profit">+$0.13</span>
                    <RadioButton
                      isChecked={selectedOption === option}
                      onClick={() => setSelectedOption(option)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-5 mb-2.5">
              <Button
                label="cancel"
                width="176.5px"
                height="41px"
                bgColor={theme === "dark" ? "#2D2D2D" : "#FAFAFA"}
                textColor={theme === "dark" ? "#FAFAFA" : "#2D2D2D"}
                border="1px solid #505050"
              />
              <Button
                label="Confirm"
                width="176.5px"
                height="41px"
                bgColor="#AEED09"
                textColor="#2D2D2D"
                border="1px solid #AEED09"
                fontWeight={500}
              />
            </div>
          </div>
        }
      </BottomDrawer>
    </div>
  );
};

export default Trade;
