import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import InstrumentInfoCard, {
  type ProfitBalanceProps,
} from "../../components/instrumentInfoCard/InstrumentInfoCard";
import { useAppSelector } from "../../store/hook";
import { refreshAllHistoryData } from "../../services/socketService";
import type { RootState } from "../../store/store";
import type { Deal } from "../../store/slices/dealsSlice";
import type { HistoryPosition } from "../../store/slices/historyPositionsSlice";
import noData from "../../assets/icons/noData.svg";
import {
  fetchInstrumentsByCategory,
  type Instrument,
} from "../../store/slices/instrumentsSlice";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import HistoryCard from "../../components/historyCard/HistoryCard";
import type { AppDispatch } from "../../store/store";

// --- Custom Interfaces for Type Safety ---

interface ChargeObject {
  charge?: number;
  name?: string;
  type?: string;
}

interface TradeObject {
  charges?: ChargeObject[];
  type: "in" | "out";
  price: number;
  qty: number;
}

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface HistoryProps {
  onDismissTutorial?: () => void;
  showTutorial?: boolean;
}

const History = ({}: HistoryProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = searchParams.get("tab") || "position";

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "position" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const deals = useAppSelector((state) => state.deals.deals);
  const dealsStatus = useAppSelector((state) => state.deals.status);
  const historyOrders = useAppSelector((state) => state.historyOrders.data);
  const historyOrdersStatus = useAppSelector(
    (state) => state.historyOrders.status
  );
  const historyPositions = useAppSelector(
    (state) => state.historyPositions.data
  );
  const historyPositionsStatus = useAppSelector(
    (state) => state.historyPositions.status
  );

  const apiStatus = useSelector(
    (state: RootState) => state.websockets.apiStatus
  );

  const { data: categories, status: categoriesStatus } = useSelector(
    (state: RootState) => state.categories
  );

  useEffect(() => {
    if (apiStatus === "connected") {
      dispatch(fetchCategories());
    }
  }, [apiStatus, dispatch]);

  useEffect(() => {
    if (
      apiStatus === "connected" &&
      categoriesStatus === "succeeded" &&
      categories.length > 0
    ) {
      categories.forEach((category) => {
        dispatch(fetchInstrumentsByCategory(category));
      });
    }
  }, [apiStatus, categories, categoriesStatus, dispatch]);

  const instrumentsData = useAppSelector((state) => state.instruments.data);

  const instrumentMap = useMemo(() => {
    const allInstruments: Record<string, Instrument> = {};
    if (instrumentsData) {
      Object.values(instrumentsData).forEach((categoryInstruments) => {
        categoryInstruments.forEach((instrument) => {
          allInstruments[instrument.id] = instrument;
        });
      });
    }
    return allInstruments;
  }, [instrumentsData]);

  const getPositionTotalCharges = (pos: HistoryPosition): number => {
    return pos.trades.reduce((sum, trade: TradeObject) => {
      const tradeChargesArray = Array.isArray(trade.charges)
        ? trade.charges
        : [];
      return (
        sum +
        tradeChargesArray.reduce(
          (chargeSum: number, charge) => chargeSum + (charge?.charge ?? 0),
          0
        )
      );
    }, 0);
  };

  const getDealTotalCharges = (deal: Deal): number => {
    const dealChargesArray = Array.isArray(deal.charges)
      ? (deal.charges as ChargeObject[])
      : [];

    return dealChargesArray.reduce(
      (chargeSum: number, charge) => chargeSum + (charge?.charge ?? 0),
      0
    );
  };

  const historyPositionDataCalculated: ProfitBalanceProps = useMemo(() => {
    if (historyPositionsStatus !== "succeeded") {
      return {
        headerLabel: "Equity",
        showProfitLoss: true,
        profitLoss: "0.00",
        showBalances: true,
        balanceItems: [
          { label: "Deposited", value: "0.00" },
          { label: "Swap", value: "0.00" },
          { label: "Charges", value: "0.00" },
          { label: "Balance", value: "0.00" },
        ],
        showBorder: true,
        marginTop: "16px",
      };
    }

    const totalClosedPnl = historyPositions.reduce(
      (sum, pos) => sum + pos.closed_pnl,
      0
    );

    const totalCharges = historyPositions.reduce((sum, pos) => {
      return sum + getPositionTotalCharges(pos);
    }, 0);

    const finalPnl = totalClosedPnl;
    const finalBalance = finalPnl - totalCharges;

    return {
      headerLabel: "Equity",
      showProfitLoss: true,
      profitLoss: `${finalPnl.toFixed(2)}`,
      showBalances: true,
      balanceItems: [
        { label: "Deposited", value: "0.00" },
        { label: "Swap", value: "0.00" },
        { label: "Charges", value: `${totalCharges.toFixed(2)}` },
        { label: "Balance", value: `${finalBalance.toFixed(2)}` },
      ],
      showBorder: true,
      marginTop: "16px",
    };
  }, [historyPositions, historyPositionsStatus]);

  const dealDataCalculated: ProfitBalanceProps = useMemo(() => {
    if (dealsStatus !== "succeeded") {
      return {
        headerLabel: "Equity",
        showProfitLoss: true,
        profitLoss: "0.00",
        showBalances: true,
        balanceItems: [
          { label: "Deposited", value: "0.00" },
          { label: "Swap", value: "0.00" },
          { label: "Charges", value: "0.00" },
          { label: "Balance", value: "0.00" },
        ],
        showBorder: true,
        marginTop: "16px",
      };
    }
    const totalClosedPnl = deals.reduce(
      (sum, deal) => sum + deal.closed_pnl,
      0
    );

    const totalCharges = deals.reduce((sum, deal) => {
      return sum + getDealTotalCharges(deal);
    }, 0);

    const finalPnl = totalClosedPnl;
    const finalBalance = finalPnl - totalCharges;

    return {
      headerLabel: "Equity",
      showProfitLoss: true,
      profitLoss: `${finalPnl.toFixed(2)}`,
      showBalances: true,
      balanceItems: [
        { label: "Deposited", value: "0.00" },
        { label: "Swap", value: "0.00" },
        { label: "Charges", value: `${totalCharges.toFixed(2)}` },
        { label: "Balance", value: `${finalBalance.toFixed(2)}` },
      ],
      showBorder: true,
      marginTop: "16px",
    };
  }, [deals, dealsStatus]);

  const orderDataCalculated: ProfitBalanceProps = useMemo(() => {
    const filledCount = historyOrders?.filter(
      (o) => o.status === "filled"
    ).length;
    const canceledCount = historyOrders?.filter(
      (o) => o.status === "cancelled"
    ).length;
    const totalCount = historyOrders?.length;
    return {
      headerLabel: "Equity",
      showProfitLoss: false,
      profitLoss: "",
      showBalances: true,
      balanceItems: [
        { label: "Filled", value: String(filledCount) },
        { label: "Canceled", value: String(canceledCount) },
        { label: "Total", value: String(totalCount) },
      ],
      showBorder: false,
      marginTop: "16px",
    };
  }, [historyOrders]);

  useEffect(() => {
    if (apiStatus === "connected") {
      refreshAllHistoryData(dispatch);
    }
  }, [dispatch, apiStatus]);

  const positionsContent = (
    <>
      <div className="mt-4 flex flex-col gap-0 w-full">
        {historyPositionsStatus === "loading" ? (
          <></>
        ) : historyPositionsStatus === "failed" ? (
          <p className="text-center text-loss">
            Failed to load closed positions.
          </p>
        ) : historyPositions.length === 0 ? (
          <div className="text-secondary text-center flex flex-col items-center justify-center gap-4 mt-6">
            <img src={noData} alt="noData" />
            No closed positions found.
          </div>
        ) : (
          historyPositions.map((pos) => {
            return (
              <HistoryCard
                key={pos.id}
                label="Position"
                historyPositionData={pos}
              />
            );
          })
        )}
      </div>
    </>
  );

  const dealsContent = (
    <>
      <div className="mt-4 flex flex-col gap-0 w-full">
        {dealsStatus === "loading" ? (
          <></>
        ) : dealsStatus === "failed" ? (
          <p className="text-center text-loss">
            Failed to load deals. Retrying on event.
          </p>
        ) : deals.length === 0 ? (
          <div className="text-secondary text-center flex flex-col items-center justify-center gap-4 mt-6">
            <img src={noData} alt="noData" />
            No deals found.
          </div>
        ) : (
          deals.map((deal) => {
            // Use instrumentMap to resolve name, matching orders/positions logic
            const instrument = instrumentMap[deal.instrument_id];
            return (
              <HistoryCard
                key={deal.id}
                label="Deals"
                dealData={deal}
                instrumentName={instrument?.trading_name}
              />
            );
          })
        )}
      </div>
    </>
  );

  const ordersContent = (
    <>
      <div className="mt-4 flex flex-col gap-0 w-full">
        {historyOrdersStatus === "loading" ? (
          <></>
        ) : historyOrdersStatus === "failed" ? (
          <p className="text-center text-loss">Failed to load orders.</p>
        ) : historyOrders?.length === 0 ? (
          <div className="text-secondary text-center flex flex-col items-center justify-center gap-4 mt-6">
            <img src={noData} alt="noData" />
            No orders found.
          </div>
        ) : (
          historyOrders?.map((order) => {
            const instrument = instrumentMap[order.instrument_id];
            return (
              <HistoryCard
                key={order.id}
                label="Orders"
                historyOrderData={order}
                instrumentName={instrument?.trading_name}
              />
            );
          })
        )}
      </div>
    </>
  );

  const tabsData: TabItem[] = [
    {
      id: "position",
      label: "Position",
      content: positionsContent,
    },
    { id: "orders", label: "Orders", content: ordersContent },
    { id: "deals", label: "Deals", content: dealsContent },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  // Determine which summary card props to use based on the active tab
  const activeSummaryProps =
    activeTabId === "orders"
      ? orderDataCalculated
      : activeTabId === "deals"
      ? dealDataCalculated
      : historyPositionDataCalculated;

  return (
    <div className="h-full overflow-y-auto">
      <InstrumentInfoCard {...activeSummaryProps} marginTop="0" />
      <NavigationTabs
        tabs={tabsData}
        defaultActiveTab={activeTabId}
        onTabChange={handleTabChange}
        className="max-w-md mx-auto pb-2.5 mb-2.5"
      />
    </div>
  );
};

export default History;
