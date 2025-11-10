import Button from "../../components/button/Button";
import Counter from "../../components/counter/Counter";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";

const Info = () => {
  const profitBalanceProps: ProfitBalanceProps = {
    balanceItems: [
      { label: "Digits", value: "2" },
      { label: "Lot size", value: "100" },
      { label: "Pip price", value: "$10.00" },
      { label: "Minimum volume", value: "0.01" },
      { label: "Maximum volume", value: "50.00" },
      { label: "Margin percentage", value: "250.0%" },
      { label: "Order execution mode", value: "Market" },
    ],
  };
  return (
    <div className="h-[calc(100vh-250px)] mt-[40px] overflow-auto">
      <div className="flex flex-col justify-between h-full">
        <div className="px-5 flex flex-col gap-5">
          <div className="text-[26px] font-secondary mt-2.5">Gold on Spot</div>
          <p className="text-secondary">
            Figma ipsum component variant main layer. Frame comment editor text
            opacity fill library italic star. Star flatten flatten reesizing
            comment flows align. Subtract.Figma ipsum component variant main
            layer. Frame comment editor text opacity fill library italic star.
            Star flatten flatten reesizing comment flows align. Subtract.
          </p>
          <div className="mb-2.5">
            <EditOrderList {...profitBalanceProps} />
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

export default Info;
