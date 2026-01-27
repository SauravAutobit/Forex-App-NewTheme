import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import AccountHealthCard from "../../components/overview/AccountHealthCard";
import OpenPositionCard from "../../components/overview/OpenPositionCard";
import PerformanceCard from "../../components/overview/PerformanceCard";
import TradeQualityCard from "../../components/overview/TradeQualityCard";
import Button from "../../components/button/Button";
import Counter from "../../components/counter/Counter";
interface OverviewProps {
  // Keeping interface compatible with parent but marking props as optional/unused if needed
  selectedInstrumentId?: string | null;
  handlePlaceOrder?: (side: "buy" | "sell") => void;
  volume?: number;
  setVolume?: (v: number) => void;
}

const Overview = ({ handlePlaceOrder, volume, setVolume }: OverviewProps) => {
  const theme = useSelector((s: RootState) => s.theme.mode);
  // Connect to Redux store for real balance if available
  const { account } = useSelector((state: RootState) => state.account);

  // Use real balance if available, otherwise mock to match Figma for dev
  const balance = account?.balance ?? 15048.12;

  // Mocked data for other fields to match Figma visual
  const equity = 5.2;
  const freeMargin = 6180;

  return (
    //     <div className="h-[calc(100vh-250px)] mt-[10px] overflow-auto">
    //   <div className="flex flex-col justify-between h-full">
    //     <div>
    //       <OverviewCard
    //         key={1}
    //         code={selectedInstrumentId || "EUR/GBP"}
    //         bid={1678.256369}
    //         ask={1078.256369}
    //         high={253659}
    //         low={235698}
    //         ltp={30}
    //         close={23.22}
    //         pip={"5asa"}
    //         timestamp={"15:23:00"}
    //         onClick={() => {
    //           console.log("overview");
    //         }}
    //       />

    //       <div className="px-5 mt-5">
    //         <div className="mb-2.5 text-primary">Market sentiment</div>
    //         <ProgressBar
    //           timeframe="5 minutes (M5)"
    //           buyPercentage={60}
    //           sellPercentage={40}
    //         />

    //         <ProgressBar
    //           timeframe="1 hour (H1)"
    //           buyPercentage={25}
    //           sellPercentage={75}
    //         />

    //         <ProgressBar
    //           timeframe="1 day (D1)"
    //           buyPercentage={50}
    //           sellPercentage={50}
    //         />
    //       </div>
    //     </div>

    //     <div
    //       className="bg-primaryBg h-[90px] flex items-center justify-between gap-3.5 px-5 pt-2.5 pb-9 border-t border-primary"
    //       style={{ position: "fixed", bottom: "65px", left: 0 }}
    //     >
    //       <Button
    //         label={"Sell"}
    //         width="82px"
    //         height="44px"
    //         bgColor={theme === "dark" ? "#FE0000" : "#DD3C48"}
    //         textColor="#FAFAFA"
    //         fontWeight={600}
    //         textShadow="0px 0px 10px 0px #950101"
    //         onClick={() => handlePlaceOrder("sell")}
    //       />
    //       <Counter
    //         label="0"
    //         initialValue={volume}
    //         onValueChange={setVolume}
    //         step={0.01}
    //       />

    //       <Button
    //         label={"Buy"}
    //         width="82px"
    //         height="44px"
    //         bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
    //         textShadow="0px 0px 10px 0px #008508"
    //         textColor="#FAFAFA"
    //         fontWeight={600}
    //         onClick={() => handlePlaceOrder("buy")}
    //       />
    //     </div>
    //   </div>
    // </div>

    <div className="h-[calc(100vh-250px)] mt-[10px] overflow-auto px-5">
      {" "}
      {/* pb-20 */}
      <div className="flex flex-col gap-1">
        <AccountHealthCard
          balance={balance}
          equity={equity}
          freeMargin={freeMargin}
          leverage="1:100"
          healthLevel={60}
        />
        <OpenPositionCard
          balanceCount={3}
          equityCount={3}
          bestPnL={86}
          dailyLossLimit={86}
        />
        <PerformanceCard />
        <TradeQualityCard />{" "}
        <div
          className="bg-primaryBg h-[90px] flex items-center justify-between gap-3.5 px-5 pt-2.5 pb-9 border-t border-primary"
          style={{ position: "fixed", bottom: "65px", left: 0 }}
        >
          <Button
            label={"Sell"}
            width="82px"
            height="44px"
            bgColor={theme === "dark" ? "#FE0000" : "#DD3C48"}
            textColor="#FAFAFA"
            fontWeight={600}
            textShadow="0px 0px 10px 0px #950101"
            onClick={() => handlePlaceOrder?.("sell")}
          />
          <Counter
            label="0"
            initialValue={volume}
            onValueChange={setVolume}
            step={0.01}
          />

          <Button
            label={"Buy"}
            width="82px"
            height="44px"
            bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
            textShadow="0px 0px 10px 0px #008508"
            textColor="#FAFAFA"
            fontWeight={600}
            onClick={() => handlePlaceOrder?.("buy")}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
