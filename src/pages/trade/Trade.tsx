import NavigationTabs from "../../components/navigationBar/NavigationBar";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const tabsData: TabItem[] = [
  {
    id: "position",
    label: "Position",
    content: "  <div>Position Content</div> ",
  },
  { id: "orders", label: "Orders", content: "<div>Orders Content</div>" },
  { id: "deals", label: "Deals", content: "<div>Deals Content</div>" },
];

const Trade = () => {
  // const activeTabId = searchParams.get("tab") || "position"; // Default to 'position'

  return (
    <div className="p-5">
      <NavigationTabs
        tabs={tabsData}
        // defaultActiveTab={activeTabId} // Use state from URL
        // onTabChange={handleTabChange} // New handler for URL update
        className="max-w-md mx-auto"
      />
    </div>
  );
};

export default Trade;
