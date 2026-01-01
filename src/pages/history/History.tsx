import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import InstrumentInfoCard, {
  type ProfitBalanceProps,
} from "../../components/instrumentInfoCard/InstrumentInfoCard";
import { useAppSelector } from "../../store/hook";
// import { refreshAllHistoryData } from "../../services/socketService";
import type { RootState } from "../../store/store";
import type { Deal } from "../../store/slices/dealsSlice";
import type { HistoryPosition } from "../../store/slices/historyPositionsSlice";
import noData from "../../assets/icons/noData.svg";
import {
  fetchInstrumentsByCategory,
  type Instrument,
} from "../../store/slices/instrumentsSlice";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import { fetchHistoryPositions } from "../../store/slices/historyPositionsSlice";
import { fetchHistoryOrders } from "../../store/slices/historyOrdersSlice";
import { fetchDeals } from "../../store/slices/dealsSlice";
import HistoryCard from "../../components/historyCard/HistoryCard";
import type { AppDispatch } from "../../store/store";
import DirectionArrow from "../../components/directionArrow/DirectionArrow";

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

  // Selectors for pagination state
  const {
    offset: dealsOffset,
    hasMore: dealsHasMore,
    status: dealsStatus,
    deals,
  } = useAppSelector((state) => state.deals);
  const {
    offset: ordersOffset,
    hasMore: ordersHasMore,
    status: historyOrdersStatus,
    data: historyOrders,
  } = useAppSelector((state) => state.historyOrders);
  const {
    offset: positionsOffset,
    hasMore: positionsHasMore,
    status: historyPositionsStatus,
    data: historyPositions,
  } = useAppSelector((state) => state.historyPositions);

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

  // Initial Fetch Effect - replacing refreshAllHistoryData
  useEffect(() => {
    if (apiStatus === "connected") {
      if (historyPositionsStatus === "idle")
        dispatch(fetchHistoryPositions({ offset: 0, limit: 30 }));
      if (historyOrdersStatus === "idle")
        dispatch(fetchHistoryOrders({ offset: 0, limit: 30 }));
      if (dealsStatus === "idle")
        dispatch(fetchDeals({ offset: 0, limit: 30 }));
    }
  }, [
    apiStatus,
    dispatch,
    historyPositionsStatus,
    historyOrdersStatus,
    dealsStatus,
  ]);

  // Scroll Handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      // Threshold of 10px
      if (
        activeTabId === "position" &&
        positionsHasMore &&
        historyPositionsStatus !== "loading"
      ) {
        dispatch(fetchHistoryPositions({ offset: positionsOffset, limit: 30 }));
      } else if (
        activeTabId === "orders" &&
        ordersHasMore &&
        historyOrdersStatus !== "loading"
      ) {
        dispatch(fetchHistoryOrders({ offset: ordersOffset, limit: 30 }));
      } else if (
        activeTabId === "deals" &&
        dealsHasMore &&
        dealsStatus !== "loading"
      ) {
        dispatch(fetchDeals({ offset: dealsOffset, limit: 30 }));
      }
    }
  };

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
    if (
      historyPositionsStatus === "idle" ||
      (historyPositionsStatus === "loading" && historyPositions.length === 0)
    ) {
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
    if (
      dealsStatus === "idle" ||
      (dealsStatus === "loading" && deals.length === 0)
    ) {
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

  const [showTutorial, setShowTutorial] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    if (activeTabId !== "position") {
      setHasDismissed(true);
    }
  }, [activeTabId]);

  useEffect(() => {
    if (
      activeTabId === "position" &&
      historyPositions.length > 0 &&
      !hasDismissed
    ) {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  }, [activeTabId, historyPositions.length, hasDismissed]);

  const handleDismissTutorial = () => {
    setShowTutorial(false);
    setHasDismissed(true);
  };

  const positionsContent = (
    <>
      <div className="mt-4 flex flex-col gap-0 w-full relative">
        {/* Tutorial Backdrop */}
        {showTutorial && activeTabId === "position" && (
          <div
            className="fixed inset-0 bg-black/70 z-[50]"
            onClick={handleDismissTutorial}
          ></div>
        )}

        {historyPositionsStatus === "loading" &&
        historyPositions.length === 0 ? (
          <></>
        ) : historyPositionsStatus === "failed" &&
          historyPositions.length === 0 ? (
          <p className="text-center text-loss">
            Failed to load closed positions.
          </p>
        ) : historyPositions.length === 0 ? (
          <div className="text-secondary text-center flex flex-col items-center justify-center gap-4 mt-6">
            <img src={noData} alt="noData" />
            No closed positions found.
          </div>
        ) : (
          historyPositions.map((pos, index) => (
            <div
              key={pos.id}
              className={index === 0 && showTutorial ? "relative z-[60]" : ""}
            >
              <HistoryCard
                label="Position"
                index={index}
                historyPositionData={pos}
                defaultExpanded={index === 0 && showTutorial}
                onCardClick={() => {
                  if (index === 0 && showTutorial) {
                    setShowTutorial(false);
                  }
                }}
              />
              {index === 0 && showTutorial && (
                // <div className="absolute top-[50px] left-1/2 -translate-x-1/2 z-[70] pointer-events-none w-full flex justify-center">
                <div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-[70] pointer-events-none w-full flex justify-center">
                  <DirectionArrow />
                </div>
              )}
            </div>
          ))
        )}
        {historyPositionsStatus === "loading" &&
          historyPositions.length > 0 && (
            <div className="text-center py-2 text-primary">Loading more...</div>
          )}
      </div>
    </>
  );

  const dealsContent = (
    <>
      <div className="mt-4 flex flex-col gap-0 w-full">
        {dealsStatus === "loading" && deals.length === 0 ? (
          <></>
        ) : dealsStatus === "failed" && deals.length === 0 ? (
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
        {dealsStatus === "loading" && deals.length > 0 && (
          <div className="text-center py-2 text-primary">Loading more...</div>
        )}
      </div>
    </>
  );

  const ordersContent = (
    <>
      <div className="mt-4 flex flex-col gap-0 w-full">
        {historyOrdersStatus === "loading" && historyOrders.length === 0 ? (
          <></>
        ) : historyOrdersStatus === "failed" && historyOrders.length === 0 ? (
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
        {historyOrdersStatus === "loading" && historyOrders.length > 0 && (
          <div className="text-center py-2 text-primary">Loading more...</div>
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

  const activeSummaryProps =
    activeTabId === "orders"
      ? orderDataCalculated
      : activeTabId === "deals"
      ? dealDataCalculated
      : historyPositionDataCalculated;

  return (
    <div className="h-full overflow-y-auto" onScroll={handleScroll}>
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
