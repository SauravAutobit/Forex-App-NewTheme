import { useNavigate, useOutletContext } from "react-router-dom";
import ClosedCard from "../../components/closedCard/ClosedCard";
import InstrumentInfoCard, {
  type ProfitBalanceProps,
} from "../../components/instrumentInfoCard/InstrumentInfoCard";
import MarketCard from "../../components/marketCard/MarketCard";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import PendingCard from "../../components/pendingCard/PendingCard";
import type { OutletContextType } from "../../layout/MainLayout";
import BottomDrawer from "../../components/bottomDrawer/BottomDrawer";
import { useState, type Key } from "react";
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
  const { setIsFlag, isDrawerOpen, setIsDrawerOpen } =
    useOutletContext<OutletContextType>();

  const liveQuotes = useAppSelector((state) => state.quotes.liveQuotes);
  const watchlist = useAppSelector((state) => state.quotes.quotes);
  const openPositions = useAppSelector((state) => state.positions.positions);
  const openOrders = useAppSelector((state) => state.openOrders.orders) || [];
  const historyPositions =
    useAppSelector((state) => state.historyPositions.data) || [];

  const tabsData: TabItem[] = [
    {
      id: "market",
      label: "Market",
      content: (
        <div>
          {watchlist.map((item) => {
            const quotes = liveQuotes[item.id] || item;
            return (
              <MarketCard
                key={item.id}
                code={item.name}
                bid={quotes.bid}
                ask={quotes.ask}
                high={quotes.high}
                low={quotes.low}
                ltp={quotes.ltp}
                close={quotes.close}
                pip={item.static_data?.pipsize}
                timestamp={
                  quotes.timestamp
                    ? new Date(quotes.timestamp).toLocaleTimeString()
                    : "..."
                }
                onClick={() => {
                  setIsFlag((prev) => ({
                    ...prev,
                    marketEdit: { status: true },
                  }));
                  navigate("/app/marketEdit");
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
              <PendingCard
                key={index}
                code={order.trading_name}
                bid={0} // Pending orders might not have immediate bid/ask here
                ask={0}
                high={0}
                low={0}
                ltp={0}
                close={0}
                pip={""}
                timestamp={new Date(order.placed_time).toLocaleTimeString()}
                onClick={() => {
                  setIsFlag((prev) => ({
                    ...prev,
                    pendingEdit: { status: true },
                  }));
                  navigate("/app/pendingEdit");
                }}
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
          {historyPositions.map((pos, index) => {
            return (
              <ClosedCard
                key={index}
                code={pos.instrument.name}
                bid={0}
                ask={0}
                high={0}
                low={0}
                ltp={0}
                close={0}
                pip={""}
                timestamp={new Date(pos.time_setup).toLocaleTimeString()}
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
    profitLoss: "$10.46",
    showBalances: true,
    balanceItems: [
      { label: "Bonus", value: "$0.00" },
      { label: "Profit | Loss", value: "-$8.46" },
      { label: "Margin", value: "$19.98" },
      { label: "Margin level", value: "461.97%" },

      { label: "Free margin", value: "$8.44" },
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
