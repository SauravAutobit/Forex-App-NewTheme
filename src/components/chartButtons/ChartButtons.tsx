import Button from "../button/Button";
import Counter from "../counter/Counter";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface ChartButtonsProps {
  handlePlaceOrder: (side: "buy" | "sell") => void;
  volume: number;
  setVolume: (v: number) => void;
  step: number;
  min: number;
}

const ChartButtons = ({
  handlePlaceOrder,
  volume,
  setVolume,
  step,
  min,
}: ChartButtonsProps) => {
  const theme = useSelector((s: RootState) => s.theme.mode);

  return (
    <div
      className="bg-primaryBg pt-2.5 flex items-center justify-between gap-3.5 px-5 border-t border-primary"
      // style={{ position: "fixed", bottom: "65px", left: 0, width: "100%" }}
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
  );
};

export default ChartButtons;
