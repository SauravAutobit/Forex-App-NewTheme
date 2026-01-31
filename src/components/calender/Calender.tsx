import { useAppSelector } from "../../store/hook";
import flag from "../../assets/icons/flag.svg";

const Calender = () => {
  const theme = useAppSelector((state) => state.theme.mode);
  // // ...
  // <Counter
  //   label="0"
  //   initialValue={volume}
  //   onValueChange={setVolume}
  //   step={step}
  //   min={min}
  // />;

  return (
    // h-[calc(100vh-260px)]
    <div className="px-5 mt-2.5 overflow-auto">
      <div className="flex flex-col justify-between h-full">
        <div className="">
          {Array.from({ length: 3 }).map((_, index) => {
            return (
              <div key={index}>
                <div
                  className={`h-[28px] py-0.5 px-2 rounded-[2px] text-primary ${
                    theme === "dark" ? "bg-tertiary" : "bg-[#E5E5E5]"
                  }`}
                >
                  {index === 0
                    ? "27 January 2026"
                    : index === 1
                    ? "26 January 2026"
                    : "25 January 2026"}
                </div>
                <div className="flex items-center justify-between mt-2.5 text-primary">
                  <div className="flex items-center gap-2.5">
                    18:45
                    <div className="text-loss font-secondary text-xs w-[43px] h-[19px] bg-[#FE000033] rounded-[4px] flex items-center justify-center">
                      High
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    USD
                    <img src={flag} alt="flag" />
                  </div>
                </div>
                <div className="mt-2 border-b border-primary pb-1 text-primary">
                  <div>ADP Employment Changes</div>
                  <div className="mt-0.5 flex items-center justify-between pr-[73.58px]">
                    <div className="text-xs text-secondary">
                      Actual
                      <div className="font-tertiary text-primary">-</div>
                    </div>
                    <div className="text-xs text-secondary">
                      Consensus
                      <div className="font-tertiary text-primary">25k</div>
                    </div>
                    <div className="text-xs text-secondary">
                      Previous
                      <div className="font-tertiary text-primary">-32k</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 text-primary">
                  <div className="flex items-center gap-2.5">
                    18:45
                    <div className="text-primary font-secondary text-xs w-[39px] h-[19px] bg-[#FAFAFA33] rounded-[4px] flex items-center justify-center">
                      Low
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    USD
                    <img src={flag} alt="flag" />
                  </div>
                </div>
                <div className="mt-2 border-b border-primary pb-1 text-primary">
                  <div>ADP Employment Changes</div>
                  <div className="mt-0.5 flex items-center justify-between pr-[73.58px]">
                    <div className="text-xs text-secondary">
                      Actual
                      <div className="font-tertiary text-primary">-</div>
                    </div>
                    <div className="text-xs text-secondary">
                      Consensus
                      <div className="font-tertiary text-primary">25k</div>
                    </div>
                    <div className="text-xs text-secondary">
                      Previous
                      <div className="font-tertiary text-primary">-32k</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 text-primary">
                  <div className="flex items-center gap-2.5">
                    18:45
                    <div className="text-[#FF9500] font-secondary text-xs w-[61px] h-[19px] bg-[#FF950033] rounded-[4px] flex items-center justify-center">
                      Medium
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    USD
                    <img src={flag} alt="flag" />
                  </div>
                </div>
                <div className="mt-2 border-b border-primary pb-1 text-primary">
                  <div>ADP Employment Changes</div>
                  <div className="mt-0.5 flex items-center justify-between pr-[73.58px]">
                    <div className="text-xs text-secondary">
                      Actual
                      <div className="font-tertiary text-primary">-</div>
                    </div>
                    <div className="text-xs text-secondary">
                      Consensus
                      <div className="font-tertiary text-primary">25k</div>
                    </div>
                    <div className="text-xs text-secondary">
                      Previous
                      <div className="font-tertiary text-primary">-32k</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calender;
