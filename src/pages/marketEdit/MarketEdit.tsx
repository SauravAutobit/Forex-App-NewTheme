import Button from "../../components/button/Button";
import EditOrderList from "../../components/editOrderList/EditOrderList";
import { type ProfitBalanceProps } from "../../components/editOrderList/EditOrderList";
import MarketCard from "../../components/marketCard/MarketCard";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import rightArrowHistory from "../../assets/icons/rightArrowHistory.svg";
import CheckList from "../../components/checkList/CheckList";
import Counter from "../../components/counter/Counter";
import { useNavigate } from "react-router-dom";

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

const MarketEdit = () => {
  const profitBalanceProps: ProfitBalanceProps = {
    balanceItems: [
      { label: "Open  time", value: "2025/10/17  14:12:33" },
      { label: "Gross Profit", value: "-$4.33" },
      { label: "Overnight Fee", value: "$0.00" },
      { label: "Position ID", value: "#58735749" },
      {
        label: "History",
        value: <img src={rightArrowHistory} alt="rightArrowHistory" />,
      },
    ],
    marginTop: "16px",
  };

  const navigate = useNavigate();
  const editHistoryHandler = () => {
    navigate("/app/editHistory", { state: { type: "market" } });
  };

  const tabsData: TabItem[] = [
    {
      id: "info",
      label: "Info",
      content: (
        <div className="px-5 h-[calc(100vh-234px)]">
          <div className="flex flex-col justify-between h-full">
            <div>
              <EditOrderList
                {...profitBalanceProps}
                onClick={editHistoryHandler}
              />
            </div>
            <div className="flex items-center justify-between mt-3 mb-2.5">
              <Button
                label="Show Chart"
                width="169.5px"
                height="44px"
                bgColor="#2D2D2D"
                textColor="#FAFAFA"
                border="1px solid #505050"
              />
              <Button
                label={
                  <div className="flex flex-col">
                    Close Order
                    <div>-$4.57</div>
                  </div>
                }
                width="169.5px"
                height="44px"
                bgColor="#FE0000"
                textColor="#FAFAFA"
                fontWeight={500}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "edit",
      label: "Edit",
      content: (
        <div className="px-5 h-[calc(100vh-234px)]">
          <div className="flex flex-col justify-between h-full">
            <div className="flex flex-col gap-2.5 mt-5">
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
            <div className="flex items-center justify-between mt-3 mb-2.5">
              <Button
                label="Discard"
                width="169.5px"
                height="44px"
                bgColor="#505050"
                textColor="#FAFAFA"
                border="1px solid #505050"
              />
              <Button
                label="Confirm"
                textShadow="1px 1px 3.5px 0px #02900B"
                width="169.5px"
                height="44px"
                bgColor="#02F511"
                textColor="#FAFAFA"
                fontWeight={500}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];
  return (
    <div>
      <MarketCard
        key={1}
        code={`EUR/GBP ${1}`}
        bid={1678.256369}
        ask={1078.256369}
        high={253659}
        low={235698}
        ltp={30}
        close={23.22}
        pip={"5asa"}
        timestamp={"15:23:00"}
        onClick={() => console.log("hey")}
        border={false}
        // active={active}
        // favourites={isFlag.favourites?.status}
      />

      <NavigationTabs
        tabs={tabsData}
        // defaultActiveTab={activeTabId} // Use state from URL
        // onTabChange={handleTabChange} // New handler for URL update
        className="max-w-md mx-auto"
      />
    </div>
  );
};

export default MarketEdit;
