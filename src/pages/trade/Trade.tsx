import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
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
import { bulkClosePositions } from "../../store/slices/ordersSlice";
import { fetchHistoryPositions } from "../../store/slices/historyPositionsSlice";
import PositionCard from "../../components/positionCard/PositionCard";
import price from "../../assets/icons/price.svg";
import alphabets from "../../assets/icons/alphabets.svg";
import upArrowFilter from "../../assets/icons/upArrowFilter.svg";
import downArrowFilter from "../../assets/icons/downArrowFilter.svg";
import RadioButton from "../../components/radioButton/RadioButton";
import Button from "../../components/button/Button";
import { useAppSelector } from "../../store/hook";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}
const Trade = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = searchParams.get("tab") || "market";

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "market" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [activeFilter, setActiveFilter] = useState({
    filterOption: "",
    sort: {
      alphabetically: "",
      price: "",
    },
  });

  const [selectedOption, setSelectedOption] = useState("");

  const theme = useAppSelector((state) => state.theme.mode);

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
  const formattedBalance = `${liveBalance.toFixed(2)}`;
  const formattedUsedBalance = `${totalUsedBalance.toFixed(2)}`;
  const formattedAvailableBalance = `${
    availableBalance < 0 ? "-" : ""
  }${Math.abs(availableBalance).toFixed(2)}`;
  const formattedTotalValue = `${totalValue.toFixed(2)}`;

  // Helper function to calculate PnL for a position
  const calculatePnL = (position: any) => {
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
    return pnl;
  };

  // Helper function to get instrument name
  const getInstrumentName = (item: any) => {
    // For positions/orders, check trading_name or instrument_id
    return item.trading_name || item.instrument_id || "";
  };

  // Apply sorting to positions
  let sortedOpenPositions = [...openPositions];
  let sortedOpenOrders = [...openOrders];
  let sortedHistoryPositions = [...historyPositions];

  // Sort by alphabetically (instrument name)
  if (activeFilter.sort.alphabetically) {
    const sortAlphabetically = (a: any, b: any) => {
      const nameA = getInstrumentName(a).toLowerCase();
      const nameB = getInstrumentName(b).toLowerCase();
      if (activeFilter.sort.alphabetically === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    };

    sortedOpenPositions = sortedOpenPositions.sort(sortAlphabetically);
    sortedOpenOrders = sortedOpenOrders.sort(sortAlphabetically);
    sortedHistoryPositions = sortedHistoryPositions.sort(sortAlphabetically);
  }

  // Sort by price (P&L)
  if (activeFilter.sort.price) {
    // Sort open positions by live P&L
    sortedOpenPositions = sortedOpenPositions.sort((a, b) => {
      const pnlA = calculatePnL(a);
      const pnlB = calculatePnL(b);
      if (activeFilter.sort.price === "asc") {
        return pnlA - pnlB;
      } else {
        return pnlB - pnlA;
      }
    });

    // Sort history positions by closed_pnl
    sortedHistoryPositions = sortedHistoryPositions.sort((a, b) => {
      const pnlA = a.closed_pnl ?? 0;
      const pnlB = b.closed_pnl ?? 0;
      if (activeFilter.sort.price === "asc") {
        return pnlA - pnlB;
      } else {
        return pnlB - pnlA;
      }
    });

    // For pending orders, we can't sort by P&L as they don't have it yet
    // Keep them in original order or sort by price
    sortedOpenOrders = sortedOpenOrders.sort((a, b) => {
      const priceA = a.price ?? 0;
      const priceB = b.price ?? 0;
      if (activeFilter.sort.price === "asc") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });
  }

  const tabsData: TabItem[] = [
    {
      id: "market",
      label: "Market",
      content: (
        <div>
          {sortedOpenPositions.map((pos, index) => {
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
          {sortedOpenOrders.map((order, index) => {
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
      label: "Closed",
      content: (
        <div>
          {sortedHistoryPositions.map((pos, index) => {
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

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
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
        defaultActiveTab={activeTabId}
        onTabChange={handleTabChange}
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
            <div className="text-lg font-tertiary mb-2.5">Sort</div>
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
              {[
                {
                  id: "all",
                  label: "All currently Open",
                  list: openPositions,
                },
                {
                  id: "profitable",
                  label: "All profitable",
                  list: openPositions.filter((p) => calculatePnL(p) > 0),
                },
                {
                  id: "losing",
                  label: "All losing",
                  list: openPositions.filter((p) => calculatePnL(p) < 0),
                },
                {
                  id: "long",
                  label: "All long",
                  list: openPositions.filter((p) => p.side === "buy"),
                },
                {
                  id: "short",
                  label: "All short",
                  list: openPositions.filter((p) => p.side === "sell"),
                },
              ].map((option) => {
                const groupPnl = option.list.reduce(
                  (acc, p) => acc + calculatePnL(p),
                  0
                );
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between"
                  >
                    <span
                      className={`${
                        theme === "dark" ? "text-[#FAFAFA]" : "text-[#2D2D2D]"
                      }`}
                    >
                      {option.label} ({option.list.length})
                    </span>
                    <div className="flex items-center gap-5">
                      <span
                        className={`font-secondary ${
                          groupPnl >= 0 ? "text-profit" : "text-loss"
                        }`}
                      >
                        {groupPnl >= 0 ? "+" : "-"}
                        {Math.abs(groupPnl).toFixed(2)}
                      </span>
                      <RadioButton
                        isChecked={selectedOption === option.id}
                        onClick={() => setSelectedOption(option.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-5 mb-2.5">
              <Button
                label="cancel"
                width="176.5px"
                height="41px"
                bgColor={theme === "dark" ? "#2D2D2D" : "#FAFAFA"}
                textColor={theme === "dark" ? "#FAFAFA" : "#2D2D2D"}
                border="1px solid #505050"
                onClick={() =>
                  setIsDrawerOpen((prev) => ({
                    ...prev,
                    tradeMarketDrawer: false,
                  }))
                }
              />
              <Button
                label="Confirm"
                width="176.5px"
                height="41px"
                bgColor="#AEED09"
                textColor="#2D2D2D"
                border="1px solid #AEED09"
                fontWeight={500}
                onClick={() => {
                  let targetPositions: typeof openPositions = [];
                  switch (selectedOption) {
                    case "all":
                      targetPositions = openPositions;
                      break;
                    case "profitable":
                      targetPositions = openPositions.filter(
                        (p) => calculatePnL(p) > 0
                      );
                      break;
                    case "losing":
                      targetPositions = openPositions.filter(
                        (p) => calculatePnL(p) < 0
                      );
                      break;
                    case "long":
                      targetPositions = openPositions.filter(
                        (p) => p.side === "buy"
                      );
                      break;
                    case "short":
                      targetPositions = openPositions.filter(
                        (p) => p.side === "sell"
                      );
                      break;
                  }

                  if (targetPositions.length > 0) {
                    dispatch(bulkClosePositions(targetPositions));
                    setIsDrawerOpen((prev) => ({
                      ...prev,
                      tradeMarketDrawer: false,
                    }));
                  }
                }}
              />
            </div>
          </div>
        }
      </BottomDrawer>
    </div>
  );
};

export default Trade;
