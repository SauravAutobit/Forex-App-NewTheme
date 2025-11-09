import Counter from "../../components/counter/Counter";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import CheckList from "../../components/checkList/CheckList";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const NewOrder = () => {
  const tabsData: TabItem[] = [
    {
      id: "market order",
      label: "Market order",
      content: (
        <div className="px-5">
          <div className="mt-5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <Counter label="Volume" />
              <span className="text-secondary mt-7">or</span>
              <Counter label="Lot" />
            </div>
            <Counter label="Take Profit" />
            <Counter label="Stop Loss" />
            <CheckList />
          </div>
        </div>
      ),
    },
    {
      id: "limit",
      label: "Limit",
      content: <div>Limit</div>,
    },
    {
      id: "stop",
      label: "Stop",
      content: <div>Stop</div>,
    },
  ];
  return (
    // <div className="px-5">
    <>
      <NavigationTabs
        tabs={tabsData}
        // defaultActiveTab={activeTabId} // Use state from URL
        // onTabChange={handleTabChange} // New handler for URL update
        className="max-w-md mx-auto"
      />
    </>
    // </div>
  );
};

export default NewOrder;
