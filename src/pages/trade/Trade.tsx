import InstrumentInfoCard, {
  type ProfitBalanceProps,
} from "../../components/instrumentInfoCard/InstrumentInfoCard";
import NavigationTabs from "../../components/navigationBar/NavigationBar";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const tabsData: TabItem[] = [
  {
    id: "market",
    label: "Market",
    content: "Market Content",
  },
  { id: "pending", label: "Pending", content: "Pending Content" },
  { id: "closed", label: "Closed", content: "Closed Content" },
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
      <InstrumentInfoCard {...profitBalanceProps} />
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
