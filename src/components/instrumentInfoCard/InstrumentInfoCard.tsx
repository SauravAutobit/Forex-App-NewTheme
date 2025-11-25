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
  // showBorder = true,
  borderRadius = "20px",
  marginTop,
}: ProfitBalanceProps) => {
  // State to control the visibility of the detailed balances
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const toggleDetails = () => {
    setIsDetailsVisible((s) => !s);
  };

  // The main click handler is now on the card content that is always visible
  const handleCardClick = () => {
    toggleDetails();
  };

  return (
    <div
      className="flex flex-col items-center text-primary px-[20px] py-[10px] backdrop-blur-[32px]"
      style={{
        borderRadius,
        boxShadow: "none",
      }}
    >
      {/* TOP SECTION: Always visible (Equity, Swastiik) */}
      <div className="w-full cursor-pointer" onClick={handleCardClick}>
        {showProfitLoss && profitLoss && isDetailsVisible && (
          <>
            <div className="w-full flex items-center justify-between mb-[10px]">
              <div className="flex items-center gap-2.5">
                <p className="text-sm">Swastiik</p>
                <Button
                  label="Real"
                  width="62px"
                  height="19px"
                  fontSize="10px"
                  textColor="#2D2D2D"
                />
              </div>
              <h1 className={`font-tertiary`}>12569598</h1>
            </div>
          </>
        )}

        {showProfitLoss && profitLoss && (
          <>
            <div className="w-full flex items-center justify-between border-b border-primary pb-2.5">
              <p className="text-sm">Equity</p>
              <h1 className={`font-tertiary`}>{profitLoss}</h1>
            </div>
          </>
        )}
      </div>
      {/* END TOP SECTION */}

      {/* COLLAPSIBLE SECTION: Balance Details */}
      <div
        className={`
          w-full grid transition-all duration-300 ease-in-out
          ${
            isDetailsVisible
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          {/* // ${showBorder ? "border-t border-secondary" : ""} */}
          <div
            className={`w-full flex flex-col gap-[10px] pt-[10px]
              `}
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
              className="flex justify-end items-center cursor-pointer text-primary"
              onClick={(e) => {
                e.stopPropagation(); // Prevents the outer div's click handler from firing
                toggleDetails();
              }}
            >
              Hide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentInfoCard;
