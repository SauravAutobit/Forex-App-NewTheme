// import { useState } from "react";
import tooltip from "../../assets/icons/tooltip.svg";
import Checkbox from "../toggleCheckbox/ToggleCheckbox";
import Counter from "../counter/Counter";
import { useLocation } from "react-router-dom";

export interface OptionItem {
  label: string;
  key: string;
}

interface CheckListProps {
  options: OptionItem[];
  activeOptions: Record<string, boolean>;
  setActiveOptions: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  readOnly?: boolean;
}

const CheckList = ({
  options,
  activeOptions,
  setActiveOptions,
  readOnly = false,
}: CheckListProps) => {
  //   const [isStopLossActive, setIsStopLossActive] = useState(true);
  // const [activeOptions, setActiveOptions] = useState<Record<string, boolean>>(
  //   () =>
  //     options.reduce(
  //       (acc, curr) => ({
  //         ...acc,
  //         [curr.key]: false,
  //       }),
  //       {}
  //     )
  // );

  const { pathname } = useLocation();

  const notChartPage = pathname !== "/app/charts";

  // Toggle the specific option on/off
  const handleToggle = (key: string) => {
    if (readOnly) return;
    setActiveOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div>
      {options.map(({ label, key }) => {
        return (
          <div key={key}>
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
          </div>
        );
      })}
    </div>
  );
};

export default CheckList;
