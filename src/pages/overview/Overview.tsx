import Button from "../../components/button/Button";
import Counter from "../../components/counter/Counter";
import OverviewCard from "../../components/overviewCard/OverviewCard";
import OverviewPerformance from "../../components/overviewPerformance/OverviewPerformance";
import ProgressBar from "../../components/progressBar/ProgressBar";

const Overview = () => {
  return (
    <div className="h-[calc(100vh-250px)] mt-[40px] overflow-auto">
      <div className="flex flex-col justify-between h-full">
        <div>
          <OverviewCard
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
            onClick={() => {
              console.log("overview");
            }}
          />
          <OverviewPerformance />

          <div className="px-5 mt-5">
            <div className="mb-2.5">Market sentiment</div>
            {/* Scenario 1: Matches your screenshot (60% Buy, 40% Sell) */}
            <ProgressBar
              timeframe="5 minutes (M5)"
              buyPercentage={60}
              sellPercentage={40}
            />

            {/* Scenario 2: Strong Sell Sentiment */}
            <ProgressBar
              timeframe="1 hour (H1)"
              buyPercentage={25}
              sellPercentage={75}
            />

            {/* Scenario 3: Balanced Sentiment */}
            <ProgressBar
              timeframe="1 day (D1)"
              buyPercentage={50}
              sellPercentage={50}
            />
          </div>
        </div>

        <div
          className="bg-primaryBg h-[90px] flex items-center justify-between gap-3.5 px-5 pt-2.5 pb-9 border-t border-primary"
          style={{ position: "fixed", bottom: "65px", left: 0, zIndex: 1000 }}
        >
          <Button
            label={"Sell"}
            width="82px"
            height="44px"
            bgColor="#FE0000"
            textColor="#FAFAFA"
            fontWeight={600}
            textShadow="0px 0px 10px 0px #950101"
          />
          <Counter label="Take Profit" />

          <Button
            label={"Buy"}
            width="82px"
            height="44px"
            bgColor="#02F511"
            textShadow="0px 0px 10px 0px #008508"
            textColor="#FAFAFA"
            fontWeight={600}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
