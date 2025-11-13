import { useState } from "react";
import RadioButton from "../radioButton/RadioButton";

const AccountList = () => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const toggleDetails = () => {
    setIsDetailsVisible((s) => !s);
  };

  // The main click handler is now on the card content that is always visible
  const handleCardClick = () => {
    toggleDetails();
  };
  const [selectedOption, setSelectedOption] = useState("");

  const options = [
    {
      key: "1",
      type: "Real",
      account: "12521065",
    },
    {
      key: "2",
      type: "Demo",
      account: "12521065",
    },
    {
      key: "3",
      type: "Demo",
      account: "12521065",
    },
  ];
  return (
    <div className="flex flex-col items-center text-primary">
      <div className="w-full cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-center justify-between py-3 px-4">
          <div>
            <div className="font-secondary">Trading Account</div>
            <div className="text-secondary">12521065</div>
          </div>

          <div className="text-quaternary text-xs">Switch Account</div>
        </div>
      </div>

      {/* COLLAPSIBLE SECTION*/}
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
          <div className={`w-full flex flex-col gap-[10px] pb-3`}>
            <div
              className="flex flex-col gap-5 bg-[#181818] rounded-10 py-4 px-4"
              //   onClick={(e) => {
              //     e.stopPropagation();
              //     toggleDetails();
              //   }}
            >
              {options.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <RadioButton
                      isChecked={selectedOption === option.key}
                      onClick={() => setSelectedOption(option.key)}
                    />
                    <span className="font-secondary pl-1.5">Account</span>
                    <div
                      className={`w-[62px] h-[19px] flex items-center justify-center rounded-10 text-xs ${
                        option.type === "Real"
                          ? "bg-[#AEED09] text-[#2D2D2D]"
                          : "text-secondary"
                      }`}
                    >
                      {option.type}
                    </div>
                  </div>

                  <span className="text-secondary">{option.account}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountList;
