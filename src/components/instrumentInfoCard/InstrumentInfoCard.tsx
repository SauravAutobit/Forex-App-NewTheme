import { useState } from "react";
import Button from "../button/Button";

interface BalanceDetail {
  label: string;
  value: string;
}

export interface ProfitBalanceProps {
  profitLoss?: string;
  balanceItems?: BalanceDetail[];
  showProfitLoss?: boolean; // control visibility
  showBalances?: boolean; // control visibility
  showBorder?: boolean; // control border dynamically
  borderRadius?: string; // ← NEW PROP
  fontWeight?: number;
  marginTop?: string;
}

const InstrumentInfoCard = ({
  profitLoss,
  balanceItems = [],
  showProfitLoss = true,
  showBalances = true,
  showBorder = true,
  borderRadius = "20px",
  //   fontWeight = 500,
  marginTop,
}: ProfitBalanceProps) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  //   const cleanProfitLoss = profitLoss
  //     ? profitLoss.replace(/[^0-9.-]/g, "")
  //     : "0";
  //   const profitLossValue = parseFloat(cleanProfitLoss);

  // Check the parsed number value, not the string
  //   const profitLossClass = profitLossValue < 0 ? "text-loss" : "text-profit";
  //   const theme = useAppSelector((state) => state.theme.mode);

  const toggleDetails = () => {
    setIsDetailsVisible((s) => !s);
  };

  //   const handleClick = () => {
  //     //   e.stopPropagation();
  //     toggleDetails();
  //   };
  return (
    <>
      <div
        className={`flex flex-col items-center gap-[10px] text-primary px-[20px] py-[10px] backdrop-blur-[32px] grid transition-all duration-300 ease-in-out overflow-hidden ${
          isDetailsVisible ? "grid-rows-[1fr] " : "grid-rows-[0fr] "
        }`}
        onClick={(e) => {
          e.stopPropagation();
          toggleDetails();
        }}
        style={{
          borderRadius,
          boxShadow: "none",
          //   border:
          //     theme === "dark"
          //       ? "1px solid var(--primary-border-color)"
          //       : "1px solid #C2C2C2",
          //   background: theme === "dark" ? "var(--primary-card-bg)" : "#E9E9E9",
        }}
      >
        {showProfitLoss && profitLoss && (
          <>
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <p className="text-sm">Swastiik</p>
                <Button
                  label="Real"
                  width="62px"
                  height="19px"
                  fontSize="10px"
                />
              </div>
              <h1 className={`font-tertiary`}>12569598</h1>
            </div>
          </>
        )}

        {showProfitLoss && profitLoss && (
          <>
            <div className="w-full flex items-center justify-between">
              <p className="text-sm">Equity</p>
              <h1 className={`font-tertiary`}>{profitLoss}</h1>
            </div>
          </>
        )}

        <div
          className={`w-full flex flex-col gap-[10px] ${
            showBorder ? "border-t border-secondary" : ""
          }`}
        >
          {showBalances &&
            balanceItems.map((balance, index) => (
              <div
                className={`flex justify-between text-secondary`}
                key={index}
                style={{
                  marginTop: index === 0 ? marginTop : "",
                }}
              >
                <span className="text-sm">{balance.label}</span>
                <span
                  className={`${
                    balance.value === "-$8.46" ? "text-[#FE0000]" : ""
                  }`}
                >
                  {balance.value}
                </span>
              </div>
            ))}
          <div
            className="flex justify-end items-center cursor-pointer text-primary text-quaternary"
            onClick={(e) => {
              e.stopPropagation();
              toggleDetails();
            }}
          >
            Hide
          </div>
        </div>
      </div>
    </>
  );
};

export default InstrumentInfoCard;
