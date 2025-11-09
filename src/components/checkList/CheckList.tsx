import { useState } from "react";
import tooltip from "../../assets/icons/tooltip.svg";
import Checkbox from "../checkbox/Checkbox";
import Counter from "../counter/Counter";

const CheckList = () => {
  //   const [isStopLossActive, setIsStopLossActive] = useState(true);
  const [isTrailingStopActive, setIsTrailingStopActive] = useState(false);

  const options = ["Trailing stop", "Break even", "Order expiration"];
  return (
    <div>
      {options.map((option) => {
        return (
          <>
            <div
              key={option}
              className="flex items-center justify-between mb-5 first:mt-2.5"
            >
              <div className="flex items-center gap-2.5 text-secondary">
                {option}
                <img src={tooltip} alt="tooltip" />
              </div>
              <Checkbox
                isOn={isTrailingStopActive}
                handleToggle={() => setIsTrailingStopActive((prev) => !prev)}
                size="md"
              />
            </div>

            {isTrailingStopActive && (
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
