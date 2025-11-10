import OverviewCard from "../../components/overviewCard/OverviewCard";

const Overview = () => {
  return (
    <div>
      <OverviewCard
        key={1}
        code={`EUR/GBP ${1}`}
        bid={1678.256369}
        ask={1078.256369}
        high={253659}
        low={235698}
        ltp={30}
        close={23.22}
        pip={"5asa"}
        timestamp={"15:23:00"}
        onClick={() => {
          console.log("overview");
        }}
      />
    </div>
  );
};

export default Overview;
