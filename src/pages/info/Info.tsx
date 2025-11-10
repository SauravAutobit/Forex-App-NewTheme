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
    <div className="px-5 flex flex-col gap-5 mt-[40px]">
      <div className="text-[26px] font-secondary mt-2.5">Gold on Spot</div>
      <p className="text-secondary">
        Figma ipsum component variant main layer. Frame comment editor text
        opacity fill library italic star. Star flatten flatten reesizing comment
        flows align. Subtract.Figma ipsum component variant main layer. Frame
        comment editor text opacity fill library italic star. Star flatten
        flatten reesizing comment flows align. Subtract.
      </p>
      <EditOrderList {...profitBalanceProps} />
    </div>
  );
};

export default Info;
