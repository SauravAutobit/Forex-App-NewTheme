import { useState } from "react";
import tooltip from "../../assets/icons/tooltip.svg";
import Checkbox from "../checkbox/Checkbox";
import Counter from "../counter/Counter";
import { useLocation } from "react-router-dom";

export interface OptionItem {
  label: string;
  key: string;
}

interface CheckListProps {
  options: OptionItem[];
}

const CheckList = ({ options }: CheckListProps) => {
  //   const [isStopLossActive, setIsStopLossActive] = useState(true);
  const [activeOptions, setActiveOptions] = useState<Record<string, boolean>>(
    () =>
      options.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.key]: false,
        }),
        {}
      )
  );

  const { pathname } = useLocation();

  const notChartPage = pathname !== "/app/charts";

  // const options: OptionItem[] = [
  //   { label: "Trailing stop", key: "trailingStop" },
  //   { label: "Break even", key: "breakEven" },
  //   { label: "Order expiration", key: "orderExpiration" },
  // ];

  // Toggle the specific option on/off
  const handleToggle = (key: string) => {
    setActiveOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div>
      {options.map(({ label, key }) => {
        return (
          <>
            <div
              key={key}
              className="flex items-center justify-between mb-5 first:mt-2.5"
            >
              <div className="flex items-center gap-2.5 text-secondary">
                {label}
                {notChartPage && <img src={tooltip} alt="tooltip" />}
              </div>
              <Checkbox
                isOn={activeOptions[key]}
                handleToggle={() => handleToggle(key)}
                size="md"
              />
            </div>

            {notChartPage && activeOptions[key] && (
              <div className="mb-5">
                <Counter />
              </div>
            )}
          </>
        );
      })}
    </div>
  );
};

export default CheckList;

//  <div>
//       {options.map(({ label, key }) => (
//         <div key={key} className="first:mt-2.5 mb-5 last:mb-0">
//           {/* Option + Checkbox Row */}
//           <div className="flex items-center justify-between mb-2.5">
//             <div className="flex items-center gap-2.5 text-secondary">
//               {label}
//               <img src={tooltip} alt="tooltip" />
//             </div>
//             <Checkbox
//               isOn={activeOptions[key]}
//               handleToggle={() => handleToggle(key)}
//               size="md"
//             />
//           </div>

//           {/* Conditionally show counter if active */}
//           {activeOptions[key] && (
//             <div className="ml-6">
//               <Counter />
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
