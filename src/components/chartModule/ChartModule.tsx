import { useRef, useEffect, useState, useMemo } from "react";
import { Chart } from "@/chartLibrary/swastiik-chart.esm.js";

const generateData = () => {
  const data = [];
  let time = Math.floor(Date.now() / 1000) - 24 * 60 * 60 * 100; // Start 100 days ago
  let open = 100;
  let high, low, close;

  for (let i = 0; i < 1000; i++) {
    // Random walk
    const volatility = 2;
    const change = (Math.random() - 0.5) * volatility;

    close = open + change;
    high = Math.max(open, close) + Math.random() * volatility * 0.5;
    low = Math.min(open, close) - Math.random() * volatility * 0.5;

    data.push({
      time: time + i * 60 * 60, // Hourly data
      open: open,
      high: high,
      low: low,
      close: close,
    });

    open = close;
  }
  return data;
};

const startFeed = (
  initialData: string | any[],
  onUpdate: { (candle: { time: any; close: any }): void; (arg0: any): void },
) => {
  let lastCandle = initialData[initialData.length - 1];
  let currentPrice = lastCandle.close;
  let targetPrice = currentPrice;
  let lastTime = lastCandle.time;

  // Configuration
  const updateInterval = 20; // 50 updates per second for smoothness
  const volatility = 0.5;

  // Interpolation loop
  const intervalId = setInterval(() => {
    // Occasionally pick a new target price (simulating market move)
    if (Math.random() < 0.05) {
      // 5% chance per tick to change target
      const change = (Math.random() - 0.5) * volatility * 5;
      targetPrice = currentPrice + change;
    }

    // Smoothly move currentPrice towards targetPrice
    const diff = targetPrice - currentPrice;
    if (Math.abs(diff) > 0.01) {
      currentPrice += diff * 0.1; // Move 10% towards target per tick
    } else {
      currentPrice = targetPrice;
    }

    const updatedCandle = {
      ...lastCandle,
      close: currentPrice,
      high: Math.max(lastCandle.high, currentPrice),
      low: Math.min(lastCandle.low, currentPrice),
    };

    onUpdate(updatedCandle);
    lastCandle = updatedCandle;
  }, updateInterval);

  // return intervalId;

  return () => {
    clearInterval(intervalId);
  };
};

const ChartModule = () => {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const [chartType, setChartType] = useState<"candlestick" | "area">(
    "candlestick",
  );

  // Stabilize data so the chart doesn't "jump" when toggling types
  const currentData = useMemo(() => generateData(), []);

  useEffect(() => {
    if (!mainRef.current) return;

    // Persist chart instance across toggles
    if (!chartRef.current) {
      chartRef.current = new Chart(mainRef.current);
    }
    const chart = chartRef.current;

    // Explicitly remove previous series to ensure a clean switch
    chart.removeSeries("main");

    // Add new series based on current type
    let series: any;
    if (chartType === "candlestick") {
      series = chart.addSeries("candlestick", "main", {
        upColor: "#02F511",
        downColor: "#FE0000",
        borderVisible: false,
        wickUpColor: "#02F511",
        wickDownColor: "#FE0000",
      });
      series.setData(currentData);
    } else {
      series = chart.addSeries("area", "main", {
        topColor: "rgba(2, 245, 17, 0.4)",
        bottomColor: "rgba(2, 245, 17, 0.0)",
        lineColor: "#02F511",
        lineWidth: 2,
      });
      series.setData(
        currentData.map((d) => ({ time: d.time, value: d.close })),
      );
    }

    chart.fitContent();

    // Setup live feed with correct data mapping for each type
    const stopFeed = startFeed(currentData, (candle: any) => {
      // Use the series instance directly instead of fetching by name for reliability
      if (chartType === "candlestick") {
        series.update(candle); // OHLC format
      } else {
        series.update({ time: candle.time, value: candle.close }); // Single value format
      }
      chart.updateOverlays();
    });

    return () => {
      stopFeed();
    };
  }, [chartType, currentData]);

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
