import { useState, useMemo, useEffect } from "react";
import DateCalender from "../../components/dateCalender/DateCalender";
import InstrumentInfoCard, {
  type ProfitBalanceProps,
} from "../../components/instrumentInfoCard/InstrumentInfoCard";
import NavigationTabs from "../../components/navigationTabs/NavigationTabs";
import DateChanger from "../../components/dateChanger/DateChanger";
// import SearchBar from "../../components/searchBar/SearchBar";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchHistoryPositions } from "../../store/slices/historyPositionsSlice";
// import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import dropdownArrowGreen from "../../assets/icons/dropdownArrowGreen.svg";

// Helper to format Date object to your desired string format (DD/MM/YYYY)
const formatDateStr = (date: Date | null | undefined): string => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

interface TradeLogEntry {
  accountName: string;
  brokerCode: string;
  quotes: string;
  dateTime: string;
  buyAt: number;
  profitAndLoss: number;
}

const General = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState("date");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  const { data: historyPositions } = useSelector(
    (state: RootState) => state.historyPositions
  );
  const { apiStatus } = useSelector((state: RootState) => state.websockets);
  const theme = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    if (apiStatus === "connected") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dispatch(
        fetchHistoryPositions(Math.floor(thirtyDaysAgo.getTime() / 1000))
      );
    }
  }, [apiStatus, dispatch]);

  const tradeData = useMemo(() => {
    if (!historyPositions) return [];

    return historyPositions.map((position) => {
      const instrumentName = position.trading_name || "Unknown";
      const pnl = position.closed_pnl || 0;
      const timeMs = (position.updated_at || position.created_at) * 1000;

      return {
        accountName: position.account_id,
        brokerCode: "002",
        quotes: `${instrumentName}`,
        dateTime: new Date(timeMs).toLocaleString("en-GB").replace(",", " |"),
        buyAt: position.price,
        profitAndLoss: pnl,
      } as TradeLogEntry;
    });
  }, [historyPositions]);

  const handleApplyDate = (start: Date, _end: Date | null) => {
    setStartDate(start);
    setShowCalendar(false);
  };

  const filteredData = useMemo(() => {
    let filtered = tradeData;

    if (activeTab === "date") {
      filtered = filtered.filter((item) => {
        const dateTimeStr = String(item.dateTime || "");
        if (!dateTimeStr) return false;
        const datePart = dateTimeStr.split(" | ")[0];
        const [d, m, y] = datePart.split("/");
        return (
          parseInt(d) === startDate.getDate() &&
          parseInt(m) === startDate.getMonth() + 1 &&
          parseInt(y) === startDate.getFullYear()
        );
      });
    } else if (activeTab === "weekly") {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const dayOfWeek = start.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      const endOfWeek = new Date(start);
      endOfWeek.setDate(start.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);

      filtered = filtered.filter((item) => {
        const dateTimeStr = String(item.dateTime || "");
        if (!dateTimeStr) return false;
        const datePart = dateTimeStr.split(" | ")[0];
        const [d, m, y] = datePart.split("/");
        const itemDate = new Date(Number(y), Number(m) - 1, Number(d));
        return itemDate >= start && itemDate <= endOfWeek;
      });
    } else if (activeTab === "monthly") {
      const targetMonth = startDate.getMonth();
      const targetYear = startDate.getFullYear();

      filtered = filtered.filter((item) => {
        const dateTimeStr = String(item.dateTime || "");
        if (!dateTimeStr) return false;
        const datePart = dateTimeStr.split(" | ")[0];
        const [, m, y] = datePart.split("/");
        return Number(m) - 1 === targetMonth && Number(y) === targetYear;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        String(item.quotes || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, startDate, searchTerm, tradeData]);

  const groupedData = useMemo(() => {
    const groups: {
      [key: string]: { totalPnL: number; trades: TradeLogEntry[] };
    } = {};

    filteredData.forEach((trade) => {
      const quotesValue = String(trade.quotes || "");
      if (!quotesValue) return;

      const symbol = quotesValue.split(" ")[0];
      if (!groups[symbol]) {
        groups[symbol] = { totalPnL: 0, trades: [] };
      }
      groups[symbol].trades.push(trade);
      groups[symbol].totalPnL += Number(trade.profitAndLoss);
    });

    return groups;
  }, [filteredData]);

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
    marginTop: "16px",
  };

  const tabsData = [
    { id: "date", label: "Date" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
  ];

  const handleToggleAccordion = (symbol: string) => {
    setExpandedSymbol(expandedSymbol === symbol ? null : symbol);
  };

  return (
    <div className="pb-20">
      <InstrumentInfoCard {...profitBalanceProps} marginTop="0" />

      <div>
        <NavigationTabs
          tabs={tabsData}
          onActiveTabChange={setActiveTab}
          defaultActiveTab={activeTab}
        />
      </div>

      {/* <div className="px-5">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div> */}

      <div className="px-5">
        {activeTab === "date" && (
          <DateChanger
            text="Date:"
            date={formatDateStr(startDate)}
            onOpen={() => setShowCalendar(true)}
          />
        )}
        {activeTab === "weekly" && (
          <DateChanger
            text="Start Date:"
            date={formatDateStr(startDate)}
            secondaryText="(Till Sunday)"
            onOpen={() => setShowCalendar(true)}
          />
        )}
        {activeTab === "monthly" && (
          <DateChanger
            text="Select Month:"
            date={startDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
            onOpen={() => setShowCalendar(true)}
          />
        )}
      </div>

      <div className="mt-4 space-y-4">
        {Object.keys(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([symbol, group]) => {
            const isPositive = group.totalPnL >= 0;
            const isExpanded = expandedSymbol === symbol;

            return (
              <div key={symbol} className="w-full">
                {/* Dropdown Header */}
                <button
                  className={`w-full h-[49px] outline-none flex justify-between items-center border-b border-primary px-5 py-2.5 transition-all duration-300`}
                  onClick={() => handleToggleAccordion(symbol)}
                  style={{ boxShadow: "none" }}
                >
                  <div className="flex items-center gap-3">
                    {/* <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full border border-[#181818] bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D]" />
                      <div className="w-6 h-6 rounded-full border border-[#181818] bg-gradient-to-br from-[#4facfe] to-[#00f2fe]" />
                    </div> */}
                    <span className="text-primary">{symbol}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-secondary ${
                        isPositive ? "text-[#2DE439]" : "text-[#D00416]"
                      }`}
                    >
                      {isPositive ? "+" : ""}${group.totalPnL.toFixed(2)}
                    </span>
                    <motion.img
                      src={dropdownArrowGreen}
                      alt="dropdownArrow"
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      // className="w-4 h-4"
                    />
                  </div>
                </button>

                {/* Dropdown Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: easeInOut }}
                      className="bg-cardBg overflow-hidden border border-t-0 border-primary"
                    >
                      {group.trades.map((trade, idx) => {
                        const tradePnL = Number(trade.profitAndLoss);
                        const isTradePositive = tradePnL >= 0;
                        return (
                          <div
                            key={idx}
                            className="h-[49px] flex items-center justify-between py-2.5 px-5 border-b border-primary last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              {/* <div className="w-6 h-6 rounded-full border border-white/10 bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D]" /> */}
                              <span className="font-tertiary">{symbol}</span>
                            </div>
                            <span
                              className={`font-secondary ${
                                isTradePositive
                                  ? "text-[#2DE439]"
                                  : "text-[#D00416]"
                              }`}
                            >
                              {isTradePositive ? "+" : ""}${tradePnL.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-secondary">No Data Found</div>
        )}
      </div>

      <DateCalender
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        activeTab={activeTab}
        initialStartDate={startDate}
        initialEndDate={null}
        onApply={handleApplyDate}
        showMonthYearPicker={activeTab === "monthly"}
      />
    </div>
  );
};

export default General;
