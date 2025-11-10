import flag from "../../assets/icons/flag.svg";
import Button from "../button/Button";
import Counter from "../counter/Counter";

const Calender = () => {
  return (
    <div className="h-[calc(100vh-260px)] px-5 mt-[50px] overflow-auto">
      <div className="flex flex-col justify-between h-full">
        <div className="">
          <div>
            <div className="bg-tertiary h-[28px] py-0.5 px-2 rounded-[2px]">
              Today, 05 November
            </div>
            <div className="flex items-center justify-between mt-2.5">
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
            <div className="mt-2 border-b border-primary pb-1">
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

            <div className="flex items-center justify-between mt-2.5">
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
            <div className="mt-2 border-b border-primary pb-1">
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

            <div className="flex items-center justify-between mt-2.5">
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
            <div className="mt-2 border-b border-primary pb-1">
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

          <div>
            <div className="bg-tertiary h-[28px] py-0.5 px-2 rounded-[2px]">
              Today, 04 November
            </div>
            <div className="flex items-center justify-between mt-2.5">
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
            <div className="mt-2 border-b border-primary pb-1">
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

            <div className="flex items-center justify-between mt-2.5">
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
            <div className="mt-2 border-b border-primary pb-1">
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

            <div className="flex items-center justify-between mt-2.5">
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
            <div className="mt-2 border-b border-primary pb-1">
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
        
        </div>
        <div
          className="bg-primaryBg h-[90px] flex items-center justify-between gap-3.5 px-5 pt-2.5 pb-9 border-t border-primary"
          style={{ position: "fixed", bottom: "65px", left: 0, zIndex: 1000 }}
        >
          <Button
            label={"Sell"}
            width="82px"
            height="44px"
            bgColor="#FE0000"
            textColor="#FAFAFA"
            fontWeight={600}
            textShadow="0px 0px 10px 0px #950101"
          />
          <Counter label="Take Profit" />

          <Button
            label={"Buy"}
            width="82px"
            height="44px"
            bgColor="#02F511"
            textShadow="0px 0px 10px 0px #008508"
            textColor="#FAFAFA"
            fontWeight={600}
          />
        </div>
      </div>
    </div>
  );
};

export default Calender;
