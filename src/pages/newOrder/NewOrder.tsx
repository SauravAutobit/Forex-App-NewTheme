import Counter from "../../components/counter/Counter";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import CheckList from "../../components/checkList/CheckList";
import Button from "../../components/button/Button";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const NewOrder = () => {
  // const value = <span>4.563</span>;
  const tabsData: TabItem[] = [
    {
      id: "market order",
      label: "Market order",
      content: (
        <div className="px-5 h-[calc(100vh-179px)]">
          <div className="mt-5 flex flex-col gap-2.5 justify-between h-full">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <Counter label="Volume" />
                <span className="text-secondary mt-7">or</span>
                <Counter label="Lot" />
              </div>
              <Counter label="Take Profit" />
              <Counter label="Stop Loss" />
              <CheckList
                options={[
                  {
                    label: "Trailing stop",
                    key: "trailingStop",
                  },
                  { label: "Break even", key: "breakEven" },
                  {
                    label: "Order expiration",
                    key: "orderExpiration",
                  },
                ]}
              />
            </div>
            <div className="mb-9">
              <div className="flex items-center justify-between text-secondary text-sm">
                Required margin/Free margin
                <span>
                  1216.36 /<span className="text-loss">0.00</span>
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <Button
                  label={
                    <>
                      Sell{" "}
                      <span style={{ fontSize: "20px", marginLeft: "10px" }}>
                        4.563
                      </span>
                    </>
                  }
                  width="169.5px"
                  height="44px"
                  bgColor="#FE0000"
                  textColor="#FAFAFA"
                  fontWeight={600}
                />
                <Button
                  label={
                    <>
                      Buy{" "}
                      <span style={{ fontSize: "20px", marginLeft: "10px" }}>
                        4.563
                      </span>
                    </>
                  }
                  width="169.5px"
                  height="44px"
                  bgColor="#02F511"
                  textColor="#FAFAFA"
                  fontWeight={600}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "limit",
      label: "Limit",
      content: (
        <div className="px-5 h-[calc(100vh-179px)]">
          <div className="mt-5 flex flex-col gap-2.5 justify-between h-full">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <Counter label="Volume" />
                <span className="text-secondary mt-7">or</span>
                <Counter label="Lot" />
              </div>
              <Counter label="Take Profit" />
              <Counter label="Stop Loss" />
              <CheckList
                options={[
                  {
                    label: "Trailing stop",
                    key: "trailingStop",
                  },
                  { label: "Break even", key: "breakEven" },
                  {
                    label: "Order expiration",
                    key: "orderExpiration",
                  },
                ]}
              />
            </div>
            <div className="mb-9">
              <div className="flex items-center justify-between text-secondary text-sm">
                Required margin/Free margin
                <span>
                  1216.36 /<span className="text-loss">0.00</span>
                </span>
              </div>
              <div className="mt-3">
                <Button
                  label={
                    <>
                      Sell{" "}
                      <span style={{ fontSize: "20px", marginLeft: "10px" }}>
                        4.563
                      </span>
                    </>
                  }
                  width="353px"
                  height="44px"
                  bgColor="#FE0000"
                  textColor="#FAFAFA"
                  fontWeight={600}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "stop",
      label: "Stop",
      content: (
        <div className="px-5 h-[calc(100vh-179px)]">
          <div className="mt-5 flex flex-col gap-2.5 justify-between h-full">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <Counter label="Volume" />
                <span className="text-secondary mt-7">or</span>
                <Counter label="Lot" />
              </div>
              <Counter label="Take Profit" />
              <Counter label="Stop Loss" />
              <CheckList
                options={[
                  {
                    label: "Trailing stop",
                    key: "trailingStop",
                  },
                  { label: "Break even", key: "breakEven" },
                  {
                    label: "Order expiration",
                    key: "orderExpiration",
                  },
                ]}
              />
            </div>
            <div className="mb-9">
              <div className="flex items-center justify-between text-secondary text-sm">
                Required margin/Free margin
                <span>
                  1216.36 /<span className="text-loss">0.00</span>
                </span>
              </div>
              <div className="mt-3">
                <Button
                  label={
                    <>
                      Buy{" "}
                      <span style={{ fontSize: "20px", marginLeft: "10px" }}>
                        4.563
                      </span>
                    </>
                  }
                  width="353px"
                  height="44px"
                  bgColor="#02F511"
                  textColor="#FAFAFA"
                  fontWeight={600}
                />
              </div>
            </div>
          </div>
        </div>
      ),
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
