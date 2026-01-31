import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import AccountHealthCard from "../../components/overview/AccountHealthCard";
import OpenPositionCard from "../../components/overview/OpenPositionCard";
// import PerformanceCard from "../../components/overview/PerformanceCard";
import TradeQualityCard from "../../components/overview/TradeQualityCard";

const Overview = () => {
  // <Counter
  //   label="0"
  //   initialValue={volume}
  //   onValueChange={setVolume}
  //   step={step}
  //   min={min}
  // />;
  const theme = useSelector((s: RootState) => s.theme.mode);
  // Connect to Redux store for real data
  const { account } = useSelector((state: RootState) => state.account);
  const { positions } = useSelector((state: RootState) => state.positions);

  // Use real balance if available, otherwise 0
  const balance = account?.balance ?? 0;

  // Calculate metrics based on OPEN positions
  let totalFloatingProfit = 0;
  let winningPositionsCount = 0;
  let losingPositionsCount = 0;
  let totalWinPnL = 0;
  let totalLossPnL = 0;
  let maxProfit = -Infinity;
  let maxLoss = Infinity;

  positions.forEach((pos) => {
    let pnl = 0;
    // Calculate PnL if live prices are available
    if (pos.live_bid !== undefined && pos.live_ask !== undefined) {
      if (pos.side === "buy") {
        pnl = (pos.live_bid - pos.price) * pos.qty;
      } else {
        pnl = (pos.price - pos.live_ask) * pos.qty;
      }
    }

    totalFloatingProfit += pnl;

    if (pnl > 0) {
      winningPositionsCount++;
      totalWinPnL += pnl;
    } else if (pnl < 0) {
      losingPositionsCount++;
      totalLossPnL += pnl;
    }

    if (pnl > maxProfit) maxProfit = pnl;
    if (pnl < maxLoss) maxLoss = pnl;
  });

  // Handle case with no positions
  if (positions.length === 0) {
    maxProfit = 0;
    maxLoss = 0;
  }

  const equity = balance + totalFloatingProfit;

  // Calculate specific metrics
  const usedMargin = positions.reduce(
    (sum, p) => sum + (p.used_balance || 0),
    0,
  );
  const freeMargin = equity - usedMargin;

  const winRate =
    positions.length > 0 ? (winningPositionsCount / positions.length) * 100 : 0;

  const avgWin =
    winningPositionsCount > 0 ? totalWinPnL / winningPositionsCount : 0;

  const avgLoss =
    losingPositionsCount > 0 ? totalLossPnL / losingPositionsCount : 0;

  const marginLevel = (equity / usedMargin) * 100;

  return (
    // 250px
    // h-[calc(100vh-280px)]
    <div className="mt-[10px] overflow-auto px-5">
      {" "}
      {/* pb-20 */}
      <div className="flex flex-col gap-1">
        <AccountHealthCard
          balance={balance}
          equity={equity}
          freeMargin={freeMargin}
          leverage="1:100"
          healthLevel={marginLevel.toFixed(2)}
        />
        <OpenPositionCard
          balanceCount={positions.length}
          equityCount={equity}
          bestPnL={maxProfit}
          dailyLossLimit={maxLoss}
        />
        {/* <PerformanceCard /> */}
        <TradeQualityCard
          winRate={parseFloat(winRate.toFixed(1))}
          avgWin={avgWin}
          avgLoss={avgLoss}
          totalTrades={positions.length}
        />{" "}
      </div>
    </div>
  );
};

export default Overview;

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
