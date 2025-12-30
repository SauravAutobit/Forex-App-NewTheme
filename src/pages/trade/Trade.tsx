import { useNavigate, useOutletContext } from "react-router-dom";
import ClosedCard from "../../components/closedCard/ClosedCard";
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

  const liveQuotes = useAppSelector((state) => state.quotes.liveQuotes);
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

  // ✅ P&L and Balance Calculations (Swastiik Edition)
  const totalPnl = openPositions.reduce((sum, position) => {
    const quote = liveQuotes[position.instrument_id];
    const currentPrice = position.side === "buy" ? quote?.bid : quote?.ask;
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

  const totalUsedBalance = openPositions.reduce(
    (sum, position) => sum + (position.used_balance || 0),
    0
  );

  const liveBalance = account?.balance ?? 0;
  const availableBalance = liveBalance - totalUsedBalance;
  const totalValue = liveBalance + totalPnl;
  const marginLevel =
    totalUsedBalance > 0 ? (totalValue / totalUsedBalance) * 100 : 0;

  const tabsData: TabItem[] = [
    {
      id: "market",
      label: "Market",
      content: (
        <div>
          {openOrders.map((order, index) => {
            return (
              <PositionCard
                key={order.id || index}
                position={{} as any}
                openOrderData={order}
                label="Orders"
                onLongPress={() => {
                  setIsFlag((prev) => ({
                    ...prev,
                    pendingEdit: { status: true },
                  }));
                  navigate("/app/pendingEdit", { state: { order } });
                }}
              />
            );
          })}
        </div>
      ),
    },
    {
      id: "positions",
      label: "Positions",
      content: (
        <div>
          {openPositions.map((pos, index) => {
            return (
              <PositionCard
                key={pos.id || index}
                position={pos}
                label="Position"
                onLongPress={() => {
                  setIsFlag((prev) => ({
                    ...prev,
                    // Keeping flag logic, though strictly navigation handles the view
                    closedEdit: { status: true },
                  }));
                  navigate("/app/marketEdit", { state: { position: pos } });
                }}
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
              <ClosedCard
                key={index}
                code={pos.trading_name || pos.instrument?.name || "N/A"}
                bid={0}
                ask={0}
                high={0}
                low={0}
                ltp={0}
                close={0}
                pip={""}
                timestamp={new Date(
                  pos.time_setup || pos.created_at
                ).toLocaleTimeString()}
                onClick={() => {
                  setIsFlag((prev) => ({
                    ...prev,
                    closedEdit: { status: true },
                  }));
                  navigate("/app/closedEdit");
                }}
              />
            );
          })}
        </div>
      ),
    },
  ];

  const profitBalanceProps: ProfitBalanceProps = {
    showProfitLoss: true,
    profitLoss: `$${totalValue.toFixed(2)}`,
    showBalances: true,
    balanceItems: [
      { label: "Balance", value: `$${liveBalance.toFixed(2)}` },
      {
        label: "Profit | Loss",
        value: `${totalPnl < 0 ? "-" : ""}$${Math.abs(totalPnl).toFixed(2)}`,
      },
      { label: "Used Margin", value: `$${totalUsedBalance.toFixed(2)}` },
      { label: "Margin level", value: `${marginLevel.toFixed(2)}%` },
      { label: "Free margin", value: `$${availableBalance.toFixed(2)}` },
    ],
    showBorder: true,
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
