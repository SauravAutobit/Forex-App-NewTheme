import HistoryCard from "../../components/historyCard/HistoryCard";
import InstrumentInfoCard, {
  type ProfitBalanceProps,
} from "../../components/instrumentInfoCard/InstrumentInfoCard";
// import MarketCard from "../../components/marketCard/MarketCard";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const tabsData: TabItem[] = [
  {
    id: "position",
    label: "Position",
    content: (
      <div className="mt-2.5">
        {Array.from({ length: 10 }).map((_, index) => {
          return <HistoryCard label={"Position"} index={index} />;
        })}
      </div>
    ),
  },
  {
    id: "order",
    label: "Order",
    content: (
      <div className="mt-2.5">
        <HistoryCard label="Orders" />
      </div>
    ),
  },
  {
    id: "deal",
    label: "Deal",
    content: (
      <div className="mt-2.5">
        <HistoryCard label="Deals" />
      </div>
    ),
  },
];

const History = () => {
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
        className="max-w-md mx-auto py-2.5 mb-2.5"
      />
      {/* py-2.5 px-5 */}
    </div>
  );
};

export default History;
