import Button from "../button/Button";
import { useAppSelector } from "../../store/hook";

export interface TradeButtonConfig {
  label: string;
  onClick: () => void;
  bgColor?: string;
  textColor?: string;
  border?: string;
  fontWeight?: number;
  textShadow?: string;
}

interface TradeButtonsProps {
  leftButton?: TradeButtonConfig;
  rightButton?: TradeButtonConfig;
}

const TradeButtons = ({ leftButton, rightButton }: TradeButtonsProps) => {
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div className="flex items-center justify-between mt-3 mb-2.5 px-5">
      {leftButton && (
        <Button
          label={leftButton.label}
          width="169.5px"
          height="44px"
          bgColor={
            leftButton.bgColor || (theme === "dark" ? "#2D2D2D" : "#FAFAFA")
          }
          textColor={
            leftButton.textColor || (theme === "dark" ? "#FAFAFA" : "#2D2D2D")
          }
          border={
            leftButton.border ||
            (theme === "dark" ? "1px solid #505050" : "1px solid #505050")
          }
          fontWeight={leftButton.fontWeight}
          textShadow={leftButton.textShadow}
          onClick={leftButton.onClick}
        />
      )}
      {rightButton && (
        <Button
          label={rightButton.label}
          width="169.5px"
          height="44px"
          bgColor={
            rightButton.bgColor || (theme === "dark" ? "#FE0000" : "#DD3C48")
          }
          textColor={rightButton.textColor || "#FAFAFA"}
          fontWeight={rightButton.fontWeight || 500}
          textShadow={rightButton.textShadow}
          border={rightButton.border}
          onClick={rightButton.onClick}
        />
      )}
    </div>
  );
};

export default TradeButtons;
