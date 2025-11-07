import React from "react";
import HistoryCard from "../../components/historyCard/HistoryCard";
import InstrumentInfoCard, {
  type ProfitBalanceProps,
} from "../../components/instrumentInfoCard/InstrumentInfoCard";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
// import DirectionArrow from "../../components/directionArrow/DirectionArrow"; // Assuming DirectionArrow is here or imported correctly

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode; // Content is no longer optional
}

interface HistoryProps {
  // New props passed down from the container
  onDismissTutorial: () => void;
  showTutorial: boolean;
}

const profitBalanceProps: ProfitBalanceProps = {
  showProfitLoss: true,
  profitLoss: "$10.46",
  showBalances: true,
  balanceItems: [
    { label: "Bonus", value: "$0.00" },
    { label: "Profit | Loss", value: "-$8.46" },
    { label: "Margin", value: "$19.98" },
    { label: "Margin level", value: "461.97%" },
    { label: "Free margin", value: "$8.44" },
  ],
  showBorder: true,
  marginTop: "16px",
};

// History component now receives props to handle the tutorial
const History = ({ onDismissTutorial, showTutorial }: HistoryProps) => {
  // We define tabsData inside History so we can use the props
  const tabsData: TabItem[] = [
    {
      id: "position",
      label: "Position",
      content: (
        // The first card needs the tutorial props. The rest don't.
        <div className="mt-2.5">
          {/* {showTutorial && (
            <div className="absolute top-[30px] right-[45px] z-100">
              <DirectionArrow />
            </div>
          )} */}
          {Array.from({ length: 10 }).map((_, index) => {
            return (
              <HistoryCard
                key={index}
                label={"Position"}
                index={index}
                // Pass props only to the first card, and only if the tutorial is active
                onCardClick={index === 0 ? onDismissTutorial : () => {}}
                isTutorialTarget={index === 0 && showTutorial}
              />
            );
          })}
        </div>
      ),
    },
    {
      id: "order",
      label: "Order",
      content: (
        <div className="mt-2.5">
          <HistoryCard
            label="Orders"
            onCardClick={() => {}}
            isTutorialTarget={false}
          />
        </div>
      ),
    },
    {
      id: "deal",
      label: "Deal",
      content: (
        <div className="mt-2.5">
          <HistoryCard
            label="Deals"
            onCardClick={() => {}}
            isTutorialTarget={false}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <InstrumentInfoCard {...profitBalanceProps} marginTop="0" />
      <NavigationTabs
        tabs={tabsData}
        className="max-w-md mx-auto py-2.5 mb-2.5"
      />
    </div>
  );
};

export default History;
