import ClosedCard from "../../components/closedCard/ClosedCard";
import InstrumentInfoCard, {
  type ProfitBalanceProps,
} from "../../components/instrumentInfoCard/InstrumentInfoCard";
import MarketCard from "../../components/marketCard/MarketCard";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import PendingCard from "../../components/pendingCard/PendingCard";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const tabsData: TabItem[] = [
  {
    id: "market",
    label: "Market",
    content: (
      <div>
        {Array.from({ length: 10 }).map((_, index) => {
          return (
            <MarketCard
              key={index}
              code={`EUR/GBP ${index}`}
              bid={1678.256369}
              ask={1078.256369}
              high={253659}
              low={235698}
              ltp={30}
              close={23.22}
              pip={"5asa"}
              timestamp={"15:23:00"}
              onClick={function (): void {
                throw new Error("Function not implemented.");
              }}
              // active={active}
              // favourites={isFlag.favourites?.status}
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
        {Array.from({ length: 10 }).map((_, index) => {
          return (
            <PendingCard
              key={index}
              code={`EURUSD ${index}`}
              bid={1678.256369}
              ask={1078.256369}
              high={253659}
              low={235698}
              ltp={30}
              close={23.22}
              pip={"5asa"}
              timestamp={"15:23:00"}
              onClick={function (): void {
                throw new Error("Function not implemented.");
              }}
              // active={active}
              // favourites={isFlag.favourites?.status}
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
        {Array.from({ length: 10 }).map((_, index) => {
          return (
            <ClosedCard
              key={index}
              code={`EURUSD ${index}`}
              bid={1678.256369}
              ask={1078.256369}
              high={253659}
              low={235698}
              ltp={30}
              close={23.22}
              pip={"5asa"}
              timestamp={"15:23:00"}
              onClick={function (): void {
                throw new Error("Function not implemented.");
              }}
              // active={active}
              // favourites={isFlag.favourites?.status}
            />
          );
        })}
      </div>
    ),
  },
];

const Trade = () => {
  // const activeTabId = searchParams.get("tab") || "position"; // Default to 'position'

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

  return (
    // px-5 py-2.5
    <div className="">
      <InstrumentInfoCard {...profitBalanceProps} marginTop="0" />
      <NavigationTabs
        tabs={tabsData}
        // defaultActiveTab={activeTabId} // Use state from URL
        // onTabChange={handleTabChange} // New handler for URL update
        className="max-w-md mx-auto px-5 pt-5 pb-2.5"
      />
    </div>
  );
};

export default Trade;
