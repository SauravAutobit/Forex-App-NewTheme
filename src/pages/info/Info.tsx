import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";

import type { Instrument } from "../../store/slices/instrumentsSlice";

interface InfoProps {
  instrument: Instrument | null;
}

const Info = ({ instrument }: InfoProps) => {
  // // ...
  // <Counter
  //   label="0"
  //   initialValue={volume}
  //   onValueChange={setVolume}
  //   step={step}
  //   min={min}
  // />;
  const staticData = instrument?.static_data || {};

  const profitBalanceProps: ProfitBalanceProps = {
    balanceItems: [
      { label: "Digits", value: String(staticData["digits"] || "0") },
      { label: "Lot size", value: String(staticData["lot size"] || "0") },
      {
        label: "Pip price",
        value: String(
          staticData["pip price"]
            ? `$${Number(staticData["pip price"]).toFixed(2)}`
            : "0",
        ),
      },
      {
        label: "Minimum volume",
        value: String(staticData["minimum volume"] || "0"),
      },
      {
        label: "Maximum volume",
        value: String(staticData["maximum volume"] || "0"),
      },
      {
        label: "Margin percentage",
        value: String(staticData["margin percentage"] || "0%"),
      },
      {
        label: "Order execution mode",
        value: String(staticData["order execution mode"] || "Market"),
      },
    ],
  };

  return (
    //250px h-[calc(100vh-280px)]
    <div className="mt-5 overflow-auto">
      <div className="flex flex-col justify-between h-full">
        <div className="px-5 flex flex-col gap-5">
          <div className="text-[26px] font-secondary text-primary">
            {instrument?.name || "Unknown Instrument"}
          </div>
          <p className="text-secondary">
            {String(
              staticData["info"] ||
                "No description available for this instrument.",
            )}
          </p>
          <div className="mb-2.5">
            <EditOrderList {...profitBalanceProps} fontWeight={600} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
