/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/chart/ChartComponent.tsx
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
} from "fintrabit-charts";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { clearChartData, fetchChartData } from "../../store/slices/chartSlice";
import IndicatorsModal from "../indicatorsModal/IndicatorsModal";
import InstrumentDropdown from "../instrumentDropdown/InstrumentDropdown";
import { useLocation, useOutletContext } from "react-router-dom";
import TimeframeDropdown, {
  type TimeframeGroup,
} from "../../components/timeframeSelector/TimeframeSelector";
import settings from "../../assets/icons/settings.svg";
import type { OutletContextType } from "../../layout/MainLayout";

type Candle = {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

// Colors / constants
const TV_UP = "#02F511";
const TV_DOWN = "#FE0000";
const TV_LINE = "#2962FF";
const TV_EMA = "#FF9800";
const TV_SMA = "#9C27B0";
const TV_RSI = "#4CAF50";
const TV_MACD = "#03A9F4";

const SL_COLOR = "#FF0000";
const TARGET_COLOR = "#00FF00";

/* helpers */
function normalizeTime(t: number | string) {
  const n = typeof t === "string" ? Number(t) : t;
  if (n > 1_000_000_000_000) return Math.floor(n / 1000);
  return Math.floor(n);
}

/* indicators (unchanged) */
function calcSMA(data: Candle[], period = 20) {
  const out: Array<{ time: number; value: number }> = [];
  if (data.length < period) return out;
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].close;
    if (i >= period) sum -= data[i - period].close;
    if (i >= period - 1) {
      out.push({ time: normalizeTime(data[i].time), value: sum / period });
    }
  }
  return out;
}

function calcEMA(data: Candle[], period = 20) {
  const out: Array<{ time: number; value: number }> = [];
  if (data.length < period) return out;
  const k = 2 / (period + 1);
  let seed = 0;
  for (let i = 0; i < period; i++) seed += data[i].close;
  let prev = seed / period;
  out.push({ time: normalizeTime(data[period - 1].time), value: prev });
  for (let i = period; i < data.length; i++) {
    const val = data[i].close * k + prev * (1 - k);
    prev = val;
    out.push({ time: normalizeTime(data[i].time), value: val });
  }
  return out;
}

function calcRSI(data: Candle[], period = 14) {
  const out: Array<{ time: number; value: number }> = [];
  if (data.length <= period) return out;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgGain / (avgLoss || 1e-9);
  out.push({
    time: normalizeTime(data[period].time),
    value: 100 - 100 / (1 + rs),
  });

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgGain / (avgLoss || 1e-9);
    out.push({
      time: normalizeTime(data[i].time),
      value: 100 - 100 / (1 + rs),
    });
  }
  return out;
}

function calcMACD(data: Candle[]) {
  const fast = 12;
  const slow = 26;
  const signal = 9;
  if (data.length < slow)
    return { macdLine: [], signalLine: [], histogram: [] };
  const emaFast = calcEMA(data, fast).map((d) => ({
    time: d.time,
    value: d.value,
  }));
  const emaSlow = calcEMA(data, slow).map((d) => ({
    time: d.time,
    value: d.value,
  }));
  const macd: Array<{ time: number; value: number }> = [];
  const fastMap = new Map(emaFast.map((e) => [e.time, e.value]));
  for (const s of emaSlow) {
    const f = fastMap.get(s.time);
    if (f !== undefined) macd.push({ time: s.time, value: f - s.value });
  }
  const macdAsCandles = macd.map((m) => ({
    time: m.time,
    open: 0,
    high: 0,
    low: 0,
    close: m.value,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signalLine = calcEMA(macdAsCandles as any, signal).map((d) => ({
    time: d.time,
    value: d.value,
  }));
  const sigMap = new Map(signalLine.map((s) => [s.time, s.value]));
  const histogram = macd.map((m) => ({
    time: m.time,
    value: m.value - (sigMap.get(m.time) ?? 0),
    color: m.value - (sigMap.get(m.time) ?? 0) >= 0 ? TV_UP : TV_DOWN,
  }));
  return { macdLine: macd, signalLine, histogram };
}

/* ---------------- Component ---------------- */
type Instrument = { id: string; name: string };

interface ChartComponentProps {
  height: string;
  instruments?: Instrument[];
  selectedInstrumentId?: string | null;
  onInstrumentChange?: (id: string) => void;
  stopLossPrice: number | null;
  targetPrice: number | null;
  // 👇 ADDED PROPS
  selectedTimeframe: string; // The currently selected time frame value
  onTimeframeChange: (timeframeValue: string) => void; // Handler for time frame change
  timeframeGroups: TimeframeGroup[];
}

export default function ChartComponent({
  height,
  instruments,
  selectedInstrumentId,
  onInstrumentChange,
  stopLossPrice,
  targetPrice,
  selectedTimeframe,
  onTimeframeChange,
  timeframeGroups,
}: ChartComponentProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { pathname } = useLocation();
  const { setIsDrawerOpen } = useOutletContext<OutletContextType>();
  // commented coz using mock data
  // // Theme from Redux — chart picks this automatically
  //   const themeMode = useSelector((s: RootState) => s.theme.mode);
  //   const dark = themeMode === "dark";

  // mock data
  const dark = "dark";

  // main chart-type state: only one of these at a time
  const [chartType, setChartType] = useState<"candles" | "line" | "area">(
    "candles"
  );

  // indicator toggles
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [showHollow, setShowHollow] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const chartData = useSelector(
    (state: RootState) => state.chart.data
  ) as Candle[];
  const chartStatus = useSelector((state: RootState) => state.chart.status);
  // commented coz using mock data
  // const apiStatus = useSelector(
  //   (state: RootState) => state.websockets.apiStatus
  // );

  // mock data
  const apiStatus = "connected";

  const mainRef = useRef<HTMLDivElement | null>(null);
  const chart = useRef<IChartApi | null>(null);

  // series refs
  const candleSeries = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeries = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lineSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const areaSeries = useRef<ISeriesApi<"Area"> | null>(null);

  // indicator series refs
  const smaSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const macdLineSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSignalSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistSeries = useRef<ISeriesApi<"Histogram"> | null>(null);

  // price lines
  const stopLossLine = useRef<ReturnType<
    ISeriesApi<"Candlestick">["createPriceLine"]
  > | null>(null);
  const targetLine = useRef<ReturnType<
    ISeriesApi<"Candlestick">["createPriceLine"]
  > | null>(null);

  const loadingMoreDataRef = useRef(false);
  const chartDataLengthRef = useRef<number>(chartData.length);

  // initial-zoom guard — apply initial zoom only once per instrument load
  const initialZoomAppliedRef = useRef(false);

  // configurable: how many bars to show initially (smaller = more zoomed in)
  const INITIAL_VISIBLE_BARS = 20;

  useEffect(() => {
    chartDataLengthRef.current = chartData.length;
  }, [chartData.length]);

  /* ---------- safer helper to remove and null a ref ---------- */
  const removeSeriesRef = <T extends ISeriesApi<any> | null>(ref: {
    current: T | null;
  }) => {
    if (!ref?.current || !chart.current) {
      ref.current = null;
      return;
    }
    try {
      chart.current.removeSeries(ref.current as ISeriesApi<any>);
    } catch (e) {
      void e;
    } finally {
      ref.current = null;
    }
  };

  /* ---------- When instrument changes: clear & fetch new data ---------- */
  useEffect(() => {
    // commented coz using mock data
    // if (!selectedInstrumentId) return;

    // reset zoom guard so each instrument gets its initial zoom
    initialZoomAppliedRef.current = false;
    // clear old data immediately to avoid showing previous instrument's candles
    dispatch(clearChartData());
    // fetch fresh data (only if websocket connected)
    if (apiStatus === "connected") {
      // dispatch(
      //   fetchChartData({
      //     instrumentId: selectedInstrumentId,
      //     startIndex: 0,
      //     endIndex: 500,
      //   })
      // );
    }
  }, [selectedInstrumentId, dispatch, apiStatus]);

  /* ---------- lazy load more ---------- */
  useEffect(() => {
    if (!chart.current) return;

    const handleVisibleLogicalRangeChange = () => {
      const logicalRange = chart.current?.timeScale().getVisibleLogicalRange();
      if (!logicalRange || loadingMoreDataRef.current) return;
      const barsInfo = candleSeries.current?.barsInLogicalRange(logicalRange);
      if (!barsInfo || !barsInfo.barsBefore) return;
      if (barsInfo.barsBefore < 15 && chartStatus !== "loading") {
        loadingMoreDataRef.current = true;
        const currentFirstIndex = chartData.length;
        dispatch(
          fetchChartData({
            // @ts-expect-error instrumentId might be null at compile-time
            instrumentId: selectedInstrumentId,
            startIndex: currentFirstIndex,
            endIndex: currentFirstIndex + 500,
          })
        ).finally(() => {
          loadingMoreDataRef.current = false;
        });
      }
    };

    chart.current
      .timeScale()
      .subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);
    return () => {
      chart.current
        ?.timeScale()
        .unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);
    };
  }, [chart, chartStatus, chartData.length, dispatch, selectedInstrumentId]);

  /* ---------- Initialize chart ---------- */
  useEffect(() => {
    if (!mainRef.current) return;
    // ensure initial zoom will be applied for this new chart
    initialZoomAppliedRef.current = false;

    try {
      chart.current = createChart(mainRef.current, {
        width: mainRef.current.clientWidth,
        height: mainRef.current.clientHeight,
        layout: {
          background: { color: dark ? "#0c0c0c" : "#FFFFFF" },
          textColor: dark ? "#D9D9D9" : "#191919",
        },
        grid: {
          vertLines: { color: dark ? "#292929" : "#E6E6E6" },
          horzLines: { color: dark ? "#292929" : "#E6E6E6" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        timeScale: {
          borderColor: dark ? "#0c0c0c" : "#E6E6E6",
          timeVisible: true,
          secondsVisible: false,
        },
      });
    } catch (e) {
      void e;
      return;
    }

    // Create initial series (we control visibility by remove/add)
    try {
      candleSeries.current = chart.current!.addCandlestickSeries({
        upColor: TV_UP,
        downColor: TV_DOWN,
        borderVisible: true,
        wickUpColor: TV_UP,
        wickDownColor: TV_DOWN,
      });

      lineSeries.current = chart.current!.addLineSeries({
        color: TV_LINE,
        lineWidth: 2,
      });
      areaSeries.current = chart.current!.addAreaSeries({
        topColor: `${TV_LINE}50`,
        bottomColor: `${TV_LINE}00`,
        lineColor: TV_LINE,
        lineWidth: 2,
      });
    } catch (e) {
      void e;
    }

    // set empty data to prevent errors until real data arrives
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emptyData: any[] = [];
    try {
      candleSeries.current?.setData(emptyData as any);
      lineSeries.current?.setData(emptyData as any);
      areaSeries.current?.setData(emptyData as any);
    } catch (e) {
      void e;
    }

    // If we already have chartData at the moment of creation, populate series & apply zoom now.
    if (chartData.length > 0) {
      // same preprocessing as the update effect
      const sorted = [...chartData].sort(
        (a, b) => normalizeTime(a.time) - normalizeTime(b.time)
      );
      const unique = sorted.filter(
        (it, idx, arr) =>
          idx === 0 ||
          normalizeTime(it.time) !== normalizeTime(arr[idx - 1].time)
      );
      const barData = unique.map((c) => ({
        time: normalizeTime(c.time),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      // populate series for the current chartType (we default to candles overlay behavior)
      try {
        if (chartType === "candles" && candleSeries.current) {
          //// @ts-expect-error safe mapping
          candleSeries.current.setData(barData as any);
        } else if (chartType === "line" && lineSeries.current) {
          lineSeries.current.setData(
            barData.map((d) => ({ time: d.time, value: d.close })) as any
          );
        } else if (chartType === "area" && areaSeries.current) {
          areaSeries.current.setData(
            barData.map((d) => ({ time: d.time, value: d.close })) as any
          );
        }
      } catch (e) {
        void e;
      }

      // reliable initial zoom (next paint + fallback)
      const total = barData.length;
      const barsToShow = Math.min(INITIAL_VISIBLE_BARS, Math.max(1, total));
      const from = Math.max(0, total - barsToShow);
      const to = Math.max(0, total - 1);
      const execZoom = () => {
        if (!chart.current) return;
        try {
          chart.current.timeScale().setVisibleLogicalRange({ from, to });
        } catch (e) {
          void e;
        } finally {
          initialZoomAppliedRef.current = true;
        }
      };
      requestAnimationFrame(() => {
        execZoom();
        setTimeout(execZoom, 60);
      });
    } else {
      // fit content initially if no data
      try {
        chart.current.timeScale().fitContent();
      } catch (e) {
        void e;
      }
    }

    return () => {
      if (chart.current) {
        try {
          chart.current.remove();
        } catch (e) {
          void e;
        }
        chart.current = null;
      }
      // null refs
      candleSeries.current = null;
      volumeSeries.current = null;
      lineSeries.current = null;
      areaSeries.current = null;
      smaSeries.current = null;
      emaSeries.current = null;
      rsiSeries.current = null;
      macdLineSeries.current = null;
      macdSignalSeries.current = null;
      macdHistSeries.current = null;
      stopLossLine.current = null;
      targetLine.current = null;
    };
    // theme/dark controls chart palette - when theme changes recreate/apply options
  }, [dark]); // recreate chart when theme toggles

  /* ---------- resize handling ---------- */
  useEffect(() => {
    if (!chart.current || !mainRef.current) return;
    const handleResize = () => {
      chart.current?.applyOptions({
        width: mainRef.current?.clientWidth || 0,
        height: mainRef.current?.clientHeight || 0,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------- theme apply when changed ---------- */
  useEffect(() => {
    if (!chart.current) return;
    try {
      chart.current.applyOptions({
        layout: {
          background: { color: dark ? "#0c0c0c" : "#FFFFFF" },
          textColor: dark ? "#D9D9D9" : "#191919",
        },
        grid: {
          vertLines: { color: dark ? "#292929" : "#E6E6E6" },
          horzLines: { color: dark ? "#292929" : "#E6E6E6" },
        },
        timeScale: { borderColor: dark ? "#0c0c0c" : "#E6E6E6" },
      });
    } catch (e) {
      void e;
    }
  }, [dark]);

  /* ---------- Update series & indicators when data OR chartType changes ----------
     NOTE: added 'dark' to deps so this effect runs after chart recreation on theme change.
  */
  useEffect(() => {
    if (!chart.current || chartData.length === 0) return;

    // Prepare deduped sorted bar data
    const sorted = [...chartData].sort(
      (a, b) => normalizeTime(a.time) - normalizeTime(b.time)
    );
    const unique = sorted.filter(
      (it, idx, arr) =>
        idx === 0 || normalizeTime(it.time) !== normalizeTime(arr[idx - 1].time)
    );
    const barData = unique.map((c) => ({
      time: normalizeTime(c.time),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    // --- Reliable initial zoom helper ---
    // Use requestAnimationFrame + fallback setTimeout to avoid racing with chart internal updates.
    const applyInitialZoomIfNeeded = (total: number): boolean => {
      if (!initialZoomAppliedRef.current && chart.current && total > 0) {
        const barsToShow = Math.min(INITIAL_VISIBLE_BARS, Math.max(1, total));
        const from = Math.max(0, total - barsToShow);
        const to = Math.max(0, total - 1);

        const exec = () => {
          if (!chart.current) return;
          try {
            chart.current.timeScale().setVisibleLogicalRange({ from, to });
          } catch (e) {
            void e;
          } finally {
            initialZoomAppliedRef.current = true;
          }
        };

        // Try on next paint; also schedule a short fallback.
        requestAnimationFrame(() => {
          exec();
          // small fallback in case the chart needs slightly more time
          setTimeout(exec, 60);
        });

        return true;
      }
      return false;
    };

    // ---------- Main series logic (mutually exclusive) ----------
    if (chartType === "candles") {
      if (!candleSeries.current && chart.current) {
        try {
          candleSeries.current = chart.current.addCandlestickSeries({
            upColor: TV_UP,
            downColor: TV_DOWN,
            borderVisible: true,
            wickUpColor: TV_UP,
            wickDownColor: TV_DOWN,
          });
        } catch (e) {
          void e;
        }
      }
      if (candleSeries.current) {
        try {
          //// @ts-expect-error safe mapping
          candleSeries.current.setData(barData as any);
          candleSeries.current.applyOptions({
            upColor: showHollow ? "transparent" : TV_UP,
            downColor: showHollow ? "transparent" : TV_DOWN,
            borderUpColor: TV_UP,
            borderDownColor: TV_DOWN,
            wickUpColor: TV_UP,
            wickDownColor: TV_DOWN,
            borderVisible: true,
          });
        } catch (e) {
          void e;
        }
      }
      removeSeriesRef(lineSeries);
      removeSeriesRef(areaSeries);
      removeSeriesRef(volumeSeries);

      applyInitialZoomIfNeeded(barData.length);
      // const appliedNow = applyInitialZoomIfNeeded(barData.length);
      // if (!appliedNow) {
      //   try {
      //     chart.current.timeScale().fitContent();
      //   } catch (e) {
      //     void e;
      //   }
      // }
    } else if (chartType === "line") {
      if (!lineSeries.current && chart.current) {
        try {
          lineSeries.current = chart.current.addLineSeries({
            color: TV_LINE,
            lineWidth: 2,
          });
        } catch (e) {
          void e;
        }
      }
      try {
        lineSeries.current?.setData(
          barData.map((d) => ({ time: d.time, value: d.close })) as any
        );
      } catch (e) {
        void e;
      }
      removeSeriesRef(candleSeries);
      removeSeriesRef(areaSeries);
      removeSeriesRef(volumeSeries);

      applyInitialZoomIfNeeded(barData.length);
      // const appliedNow = applyInitialZoomIfNeeded(barData.length);
      // if (!appliedNow) {
      //   try {
      //     chart.current.timeScale().fitContent();
      //   } catch (e) {
      //     void e;
      //   }
      // }
    } else if (chartType === "area") {
      if (!areaSeries.current && chart.current) {
        try {
          areaSeries.current = chart.current.addAreaSeries({
            topColor: `${TV_LINE}50`,
            bottomColor: `${TV_LINE}00`,
            lineColor: TV_LINE,
            lineWidth: 2,
          });
        } catch (e) {
          void e;
        }
      }
      try {
        areaSeries.current?.setData(
          barData.map((d) => ({ time: d.time, value: d.close })) as any
        );
      } catch (e) {
        void e;
      }
      removeSeriesRef(candleSeries);
      removeSeriesRef(lineSeries);
      removeSeriesRef(volumeSeries);

      applyInitialZoomIfNeeded(barData.length);
      // const appliedNow = applyInitialZoomIfNeeded(barData.length);
      // if (!appliedNow) {
      //   try {
      //     chart.current.timeScale().fitContent();
      //   } catch (e) {
      //     void e;
      //   }
      // }
    } else if (chartType === "volume") {
      if (!volumeSeries.current && chart.current) {
        try {
          volumeSeries.current = chart.current.addHistogramSeries({
            color: TV_UP,
            priceFormat: { type: "volume" },
            priceScaleId: "volume",
          });
        } catch (e) {
          void e;
        }
      }
      try {
        volumeSeries.current?.setData(
          unique.map((c) => ({
            time: normalizeTime(c.time),
            value: c.volume ?? 0,
            color: c.close >= c.open ? TV_UP : TV_DOWN,
          })) as any
        );
        chart.current.priceScale("volume").applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
          borderVisible: false,
        });
      } catch (e) {
        void e;
      }
      removeSeriesRef(candleSeries);
      removeSeriesRef(lineSeries);
      removeSeriesRef(areaSeries);

      applyInitialZoomIfNeeded(barData.length);
      // const appliedNow = applyInitialZoomIfNeeded(barData.length);
      // if (!appliedNow) {
      //   try {
      //     chart.current.timeScale().fitContent();
      //   } catch (e) {
      //     void e;
      //   }
      // }
    }

    // ---------- Indicators ----------
    if (showSMA) {
      if (!smaSeries.current && chart.current) {
        try {
          smaSeries.current = chart.current.addLineSeries({
            color: TV_SMA,
            lineWidth: 2,
          });
        } catch (e) {
          void e;
        }
      }
      try {
        smaSeries.current?.setData(calcSMA(unique, 20) as any);
      } catch (e) {
        void e;
      }
    } else removeSeriesRef(smaSeries);

    if (showEMA) {
      if (!emaSeries.current && chart.current) {
        try {
          emaSeries.current = chart.current.addLineSeries({
            color: TV_EMA,
            lineWidth: 2,
          });
        } catch (e) {
          void e;
        }
      }
      try {
        emaSeries.current?.setData(calcEMA(unique, 20) as any);
      } catch (e) {
        void e;
      }
    } else removeSeriesRef(emaSeries);

    if (showRSI) {
      if (!rsiSeries.current && chart.current) {
        try {
          rsiSeries.current = chart.current.addLineSeries({
            color: TV_RSI,
            lineWidth: 2,
            priceScaleId: "rsi",
          });
          rsiSeries.current
            .priceScale()
            .applyOptions({ scaleMargins: { top: 0.7, bottom: 0.2 } });
        } catch (e) {
          void e;
        }
      }
      try {
        rsiSeries.current?.setData(calcRSI(unique, 14) as any);
      } catch (e) {
        void e;
      }
    } else removeSeriesRef(rsiSeries);

    if (showMACD) {
      const { macdLine, signalLine, histogram } = calcMACD(unique);
      if (!macdLineSeries.current && chart.current) {
        try {
          macdLineSeries.current = chart.current.addLineSeries({
            color: TV_MACD,
            lineWidth: 2,
            priceScaleId: "macd",
          });
          macdSignalSeries.current = chart.current.addLineSeries({
            color: "red",
            lineWidth: 2,
            priceScaleId: "macd",
          });
          macdHistSeries.current = chart.current.addHistogramSeries({
            base: 0,
            priceScaleId: "macd",
          });
          chart.current
            .priceScale("macd")
            .applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
        } catch (e) {
          void e;
        }
      }
      try {
        macdLineSeries.current?.setData(macdLine as any);
        macdSignalSeries.current?.setData(signalLine as any);
        macdHistSeries.current?.setData(histogram as any);
      } catch (e) {
        void e;
      }
    } else {
      removeSeriesRef(macdLineSeries);
      removeSeriesRef(macdSignalSeries);
      removeSeriesRef(macdHistSeries);
    }

    // no unconditional fitContent here (we either applied initial zoom or already fit)
  }, [
    chartData,
    chartType,
    showHollow,
    showSMA,
    showEMA,
    showRSI,
    showMACD,
    dark,
  ]); // <-- keep dark here so updates run after theme change

  /* ---------- Manage Stop-Loss and Target Price Lines ---------- */
  useEffect(() => {
    const seriesForLines =
      candleSeries.current ?? lineSeries.current ?? areaSeries.current;
    if (!seriesForLines) return;

    // Stop-Loss
    if (stopLossPrice !== null && stopLossPrice > 0) {
      if (!stopLossLine.current) {
        try {
          stopLossLine.current = (seriesForLines as any).createPriceLine({
            price: stopLossPrice,
            color: SL_COLOR,
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: "SL",
          });
        } catch (e) {
          void e;
        }
      } else {
        try {
          stopLossLine.current.applyOptions({ price: stopLossPrice });
        } catch (e) {
          void e;
        }
      }
    } else {
      try {
        seriesForLines.removePriceLine?.(stopLossLine.current as any);
      } catch (e) {
        void e;
      }
      stopLossLine.current = null;
    }

    // Target
    if (targetPrice !== null && targetPrice > 0) {
      if (!targetLine.current) {
        try {
          targetLine.current = (seriesForLines as any).createPriceLine({
            price: targetPrice,
            color: TARGET_COLOR,
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: "Target",
          });
        } catch (e) {
          void e;
        }
      } else {
        try {
          targetLine.current.applyOptions({ price: targetPrice });
        } catch (e) {
          void e;
        }
      }
    } else {
      try {
        seriesForLines.removePriceLine?.(targetLine.current as any);
      } catch (e) {
        void e;
      }
      targetLine.current = null;
    }
  }, [stopLossPrice, targetPrice, chartType]);

  /* ---------- Controls renderer ---------- */
  const renderControls = () => (
    <>
      {/* Chart type selector — mutually exclusive */}
      <div className="form-control mb-2">
        <label className="label">
          <span className="label-text">Chart Type</span>
        </label>
        <div className="flex gap-2">
          <label
            className={`btn btn-sm ${
              chartType === "candles" ? "btn-primary" : "btn-ghost"
            }`}
          >
            <input
              type="radio"
              name="chartType"
              checked={chartType === "candles"}
              onChange={() => setChartType("candles")}
              className="hidden"
            />
            Candles
          </label>

          <label
            className={`btn btn-sm ${
              chartType === "line" ? "btn-primary" : "btn-ghost"
            }`}
          >
            <input
              type="radio"
              name="chartType"
              checked={chartType === "line"}
              onChange={() => setChartType("line")}
              className="hidden"
            />
            Line
          </label>

          <label
            className={`btn btn-sm ${
              chartType === "area" ? "btn-primary" : "btn-ghost"
            }`}
          >
            <input
              type="radio"
              name="chartType"
              checked={chartType === "area"}
              onChange={() => setChartType("area")}
              className="hidden"
            />
            Area
          </label>

          {/* <label
            className={`btn btn-sm ${
              chartType === "volume" ? "btn-primary" : "btn-ghost"
            }`}
          >
            <input
              type="radio"
              name="chartType"
              checked={chartType === "volume"}
              onChange={() => setChartType("volume")}
              className="hidden"
            />
            Volume
          </label> */}
        </div>
      </div>

      {/* Hollow candles */}
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">Hollow Candles</span>
          <input
            type="checkbox"
            checked={showHollow}
            onChange={(e) => setShowHollow(e.target.checked)}
            className="toggle toggle-secondary"
          />
        </label>
      </div>

      {/* Indicators */}
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">SMA (20)</span>
          <input
            type="checkbox"
            checked={showSMA}
            onChange={(e) => setShowSMA(e.target.checked)}
            className="toggle toggle-secondary"
          />
        </label>
      </div>

      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">EMA (20)</span>
          <input
            type="checkbox"
            checked={showEMA}
            onChange={(e) => setShowEMA(e.target.checked)}
            className="toggle toggle-accent"
          />
        </label>
      </div>

      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">RSI (14)</span>
          <input
            type="checkbox"
            checked={showRSI}
            onChange={(e) => setShowRSI(e.target.checked)}
            className="toggle toggle-success"
          />
        </label>
      </div>

      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">MACD</span>
          <input
            type="checkbox"
            checked={showMACD}
            onChange={(e) => setShowMACD(e.target.checked)}
            className="toggle toggle-info"
          />
        </label>
      </div>
    </>
  );

  return (
    <>
      <div className="flex flex-col relative" style={{ height }}>
        {pathname === "/app/charts" && (
          <>
            <div className="absolute top-0 left-0 right-0 z-10 px-5 flex justify-between mt-2.5">
              <InstrumentDropdown
                instruments={instruments ?? []}
                selectedInstrumentId={selectedInstrumentId!}
                onSelect={onInstrumentChange!}
              />

              <TimeframeDropdown
                timeframeGroups={timeframeGroups} // ✅ Passed data
                selectedTimeframe={selectedTimeframe} // ✅ Passed state
                onSelect={onTimeframeChange} // ✅ Passed handler
              />
              <InstrumentDropdown
                instruments={instruments ?? []}
                selectedInstrumentId={selectedInstrumentId!}
                onSelect={onInstrumentChange!}
              />
            </div>

            <div
              className="w-[40px] h-[40px] bg-primaryBg border border-primary rounded-10 absolute top-[70px] left-5 right-0 z-10 flex items-center justify-center"
              onClick={() =>
                setIsDrawerOpen((prev) => ({
                  ...prev,
                  chartDrawer: true,
                }))
              }
            >
              <img src={settings} alt="settings" />
            </div>
          </>
        )}

        <main className="flex-1 flex flex-col gap-2 overflow-auto">
          <div
            ref={mainRef}
            className="flex-1 w-full min-h-[300px] rounded-lg"
            style={{ border: "none", outline: "none" }}
          />
        </main>

        <IndicatorsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          {renderControls()}
        </IndicatorsModal>
      </div>
    </>
  );
}
