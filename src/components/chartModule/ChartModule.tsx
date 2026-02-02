import { useRef, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/store/hook";
import { type AppDispatch, type RootState } from "@/store/store";
import { Chart } from "@/chartLibrary/swastiik-chart.esm.js";
import { fetchChartData, clearChartData } from "@/store/slices/chartSlice";
import {
  subscribeToInstruments,
  unsubscribeFromInstruments,
} from "@/services/socketService";

// Dummy data generators removed in favor of real Redux store data.

const ChartModule = () => {
  const dispatch = useDispatch<AppDispatch>();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [chartType, setChartType] = useState<"candlestick" | "area">(
    "candlestick",
  );

  const selectedInstrumentId = useAppSelector(
    (state: RootState) => state.instruments.selectedInstrumentId,
  );
  const chartData = useAppSelector((state: RootState) => state.chart.data);
  const { apiStatus, streamStatus } = useAppSelector(
    (state: RootState) => state.websockets,
  );

  const hasZoomedRef = useRef<Record<string, boolean>>({});

  // Fetch real data when instrument or connection status changes
  useEffect(() => {
    if (apiStatus === "connected" && selectedInstrumentId) {
      // Don't clear immediately here to avoid unnecessary blanking state
      // clearChartData will be handled by the slice or if we want it here
      dispatch(
        fetchChartData({
          instrumentId: selectedInstrumentId,
          timeframe: "1m",
          startIndex: 0,
          endIndex: 200,
        }),
      );
    }
  }, [selectedInstrumentId, apiStatus, dispatch]);

  // Subscribe to live price updates for the selected instrument
  useEffect(() => {
    if (selectedInstrumentId && streamStatus === "connected") {
      subscribeToInstruments([selectedInstrumentId]);
    }
  }, [selectedInstrumentId, streamStatus]);

  // 1. Initialize Chart & Series - ONLY on chartType change
  useEffect(() => {
    if (!mainRef.current) return;

    if (!chartRef.current) {
      chartRef.current = new Chart(mainRef.current);
    }
    const chart = chartRef.current;

    // We only remove/re-add when the chart type changes (Candle/Area)
    // Changing the instrument should NOT destroy the series to avoid blinking.
    chart.removeSeries("main");

    let series: any;
    if (chartType === "candlestick") {
      series = chart.addSeries("candlestick", "main", {
        upColor: "#02F511",
        downColor: "#FE0000",
        borderVisible: false,
        wickUpColor: "#02F511",
        wickDownColor: "#FE0000",
      });
    } else {
      series = chart.addSeries("area", "main", {
        topColor: "rgba(2, 245, 17, 0.4)",
        bottomColor: "rgba(2, 245, 17, 0.0)",
        lineColor: "#02F511",
        lineWidth: 2,
      });
    }
    seriesRef.current = series;

    // Apply layout options for better zoom/scaling
    chart.applyOptions({
      rightPriceScale: {
        autoScale: true,
        borderColor: "#404040",
      },
      timeScale: {
        rightOffset: 12,
        barSpacing: 8,
        minBarSpacing: 1,
        shiftVisibleRangeOnNewBar: true,
      },
    });

    return () => {};
  }, [chartType]); // Removed selectedInstrumentId to stop blinking

  // 2. Clear old data and signal zoom reset when instrument changes
  useEffect(() => {
    if (selectedInstrumentId) {
      if (seriesRef.current) {
        seriesRef.current.setData([]);
      }
      dispatch(clearChartData());
    }
  }, [selectedInstrumentId, dispatch]);

  // 3. Populate History and Apply Initial Zoom
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || chartData.length === 0) return;

    // Fill history
    if (chartType === "candlestick") {
      series.setData(chartData.map((d) => ({ ...d })));
    } else {
      series.setData(chartData.map((d) => ({ time: d.time, value: d.close })));
    }

    // Zoom logic: only once per instrument per visit
    if (selectedInstrumentId && !hasZoomedRef.current[selectedInstrumentId]) {
      const total = chartData.length;
      if (total > 5) {
        chartRef.current.chart.timeScale().setVisibleLogicalRange({
          from: total - 40,
          to: total + 3,
        });
        hasZoomedRef.current[selectedInstrumentId] = true;
      }
    }
  }, [chartData.length, chartType, selectedInstrumentId]);

  // 4. Keep the most recent candle updated
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || chartData.length === 0) return;

    const latest = chartData[chartData.length - 1];
    if (chartType === "candlestick") {
      series.update({ ...latest });
    } else {
      series.update({ time: latest.time, value: latest.close });
    }

    if (chartRef.current) {
      chartRef.current.updateOverlays();
    }
  }, [chartData, chartType]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        background: "#0c0c0c",
        padding: "10px",
        borderRadius: "12px",
      }}
    >
      <div style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
        <button
          onClick={() => setChartType("candlestick")}
          style={{
            padding: "8px 20px",
            background: chartType === "candlestick" ? "#02F511" : "#1e1e1e",
            color: chartType === "candlestick" ? "#000" : "#aaa",
            border: "1px solid #333",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
        >
          Candlestick
        </button>
        <button
          onClick={() => setChartType("area")}
          style={{
            padding: "8px 20px",
            background: chartType === "area" ? "#02F511" : "#1e1e1e",
            color: chartType === "area" ? "#000" : "#aaa",
            border: "1px solid #333",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
        >
          Area View
        </button>
      </div>
      <div
        ref={mainRef}
        className="chart-container"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: "450px",
          flex: 1,
        }}
      ></div>
    </div>
  );
};

export default ChartModule;
