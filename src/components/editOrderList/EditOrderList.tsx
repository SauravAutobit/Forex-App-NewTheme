interface BalanceDetail {
  label: string;
  value: string | React.ReactNode;
}

export interface ProfitBalanceProps {
  balanceItems?: BalanceDetail[];
  marginTop?: string;
}

const EditOrderList = ({
  balanceItems = [],
  marginTop,
}: ProfitBalanceProps) => {
  return (
    <div>
      <div
        className={`
          w-full grid transition-all duration-300 ease-in-out`}
      >
        <div className="overflow-hidden">
          {/* // ${showBorder ? "border-t border-secondary" : ""} */}
          <div
            className={`w-full flex flex-col gap-[18px]
              `}
          >
            {balanceItems.map((balance, index) => (
              <div
                className={`flex justify-between last:text-secondary`}
                key={index}
                style={{
                  marginTop: index === 0 ? marginTop : "",
                }}
              >
                <span>{balance.label}</span>
                <span
                  className={`${
                    balance.value === "-$8.46" ? "text-[#FE0000]" : ""
                  }`}
                >
                  {balance.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderList;
