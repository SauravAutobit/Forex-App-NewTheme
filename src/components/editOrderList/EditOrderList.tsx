import { useLocation } from "react-router-dom";

interface BalanceDetail {
  label: string;
  value: string | React.ReactNode;
}

export interface ProfitBalanceProps {
  balanceItems?: BalanceDetail[];
  marginTop?: string;
  onClick?: () => void;
  fontWeight?: number;
  lastListColor?: boolean;
}

const EditOrderList = ({
  balanceItems = [],
  marginTop,
  onClick,
  fontWeight,
  lastListColor = false,
}: ProfitBalanceProps) => {
  const { pathname } = useLocation();

  const editHistory = pathname === "/app/editHistory";

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
                className={`flex justify-between ${
                  pathname !== "/app/charts" && "last:text-secondary"
                } ${editHistory && "text-secondary"}`}
                key={index}
                style={{
                  marginTop: index === 0 ? marginTop : "",
                }}
                onClick={onClick}
              >
                <span
                  className={`text-primary ${
                    lastListColor && index === balanceItems.length - 1
                      ? "text-[#878787]"
                      : ""
                  }`}
                  style={{ fontWeight }}
                >
                  {balance.label}
                </span>
                <span
                  className={`text-primary ${
                    typeof balance.value === "string" &&
                    balance.value.startsWith("-")
                      ? "text-[#FE0000]"
                      : ""
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
