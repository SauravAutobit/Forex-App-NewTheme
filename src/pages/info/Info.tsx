import { useSelector } from "react-redux";
import Button from "../../components/button/Button";
import Counter from "../../components/counter/Counter";
import EditOrderList, {
  type ProfitBalanceProps,
} from "../../components/editOrderList/EditOrderList";
import type { RootState } from "../../store/store";

import type { Instrument } from "../../store/slices/instrumentsSlice";

interface InfoProps {
  instrument: Instrument | null;
  handlePlaceOrder: (side: "buy" | "sell") => void;
  volume: number;
  setVolume: (v: number) => void;
  step?: number;
  min?: number;
}

const Info = ({
  instrument,
  handlePlaceOrder,
  volume,
  setVolume,
  step = 0.01,
  min = 0,
}: InfoProps) => {
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

  const theme = useSelector((s: RootState) => s.theme.mode);

  return (
    //250px
    <div className="h-[calc(100vh-280px)] mt-5 overflow-auto">
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
            onClick={() => handlePlaceOrder("sell")}
          />
          <Counter
            label="0"
            initialValue={volume}
            onValueChange={setVolume}
            step={step}
            min={min}
          />

          <Button
            label={"Buy"}
            width="82px"
            height="44px"
            bgColor={theme === "dark" ? "#02F511" : "#00B22D"}
            textShadow="0px 0px 10px 0px #008508"
            textColor="#FAFAFA"
            fontWeight={600}
            onClick={() => handlePlaceOrder("buy")}
          />
        </div>
      </div>
    </div>
  );
};

export default Info;
