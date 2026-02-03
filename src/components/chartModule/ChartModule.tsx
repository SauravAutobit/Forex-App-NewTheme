import { useRef, useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import ReactDOM from "react-dom";
import { useAppSelector } from "@/store/hook";
import { type AppDispatch, type RootState } from "@/store/store";
import { Chart } from "@/chartLibrary/swastiik-chart.esm.js";
import { fetchChartData, clearChartData } from "@/store/slices/chartSlice";
import { setSelectedInstrument } from "@/store/slices/instrumentsSlice";
import { subscribeToInstruments } from "@/services/socketService";
import ChartSkeleton from "../chartSkeleton/ChartSkeleton";
import InstrumentDropdown from "../instrumentDropdown/InstrumentDropdown";
import TimeframeDropdown from "../timeframeSelector/TimeframeSelector";
import ToolDropdown from "../toolDropdown/ToolDropdown";
import { mockTimeframes } from "@/mockData";

// Dummy data generators removed in favor of real Redux store data.

const ChartModule = ({ oneTouchTrading }: { oneTouchTrading?: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [chartType, setChartType] = useState<"candlestick" | "area">(
    "candlestick",
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [overlayTargets, setOverlayTargets] = useState<
    Record<string, HTMLElement>
  >({});

  const allInstrumentsData = useAppSelector(
    (state: RootState) => state.instruments.data,
  );
  const selectedInstrumentId = useAppSelector(
    (state: RootState) => state.instruments.selectedInstrumentId,
  );

  const instrumentsForDropdown = useMemo(() => {
    return Object.values(allInstrumentsData)
      .flat()
      .map((inst) => ({
        id: inst.id,
        name: inst.name || inst.trading_name, 
      }));
  }, [allInstrumentsData]);

  const chartData = useAppSelector((state: RootState) => state.chart.data);
  const { apiStatus, streamStatus } = useAppSelector(
    (state: RootState) => state.websockets,
  );
  const chartStatus = useAppSelector((state: RootState) => state.chart.status);

  const hasZoomedRef = useRef<Record<string, boolean>>({});

  // Fetch real data when instrument or connection status changes
  useEffect(() => {
    if (apiStatus === "connected" && selectedInstrumentId) {
      dispatch(
        fetchChartData({
          instrumentId: selectedInstrumentId,
          timeframe: selectedTimeframe || "1m",
          startIndex: 0,
          endIndex: 200,
        }),
      );
    }
  }, [selectedInstrumentId, apiStatus, selectedTimeframe, dispatch]);

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

    // Add Overlays
    // chart.addOverlay(
    //   "watermark",
    //   '<h1 style="color: rgba(255, 255, 255, 0.05); font-family: Arial; font-size: 60px; pointer-events: none; user-select: none;">SWASTIIK</h1>',
    //   () => ({ x: 40, y: 70, visible: true }),
    // );

    const instDiv = chart.addOverlay("inst-overlay", "", () => ({
      x: 15,
      y: 15,
      visible: true,
    }));
    const tfDiv = chart.addOverlay("tf-overlay", "", () => ({
      x: 130, // Increased gap
      y: 15,
      visible: true,
    }));
    const toolDiv = chart.addOverlay("tool-overlay", "", () => ({
      x: 245, // Increased gap
      y: 15,
      visible: true,
    }));

    // CRITICAL: Ensure the root overlay layer allows dropdowns to pop out and captures events
    if (chartRef.current.overlayLayer) {
      chartRef.current.overlayLayer.style.overflow = "visible";
      chartRef.current.overlayLayer.style.pointerEvents = "none";
      chartRef.current.overlayLayer.style.zIndex = "1000"; // Higher than skeleton (150)
    }

    [instDiv, tfDiv, toolDiv].forEach((div) => {
      div.style.pointerEvents = "auto";
      div.style.zIndex = "1100"; // Above the overlayLayer
      div.style.overflow = "visible";
      div.style.width = "auto";
      div.style.height = "auto";
      // Ensure the container for the portal doesn't clip children
      div.style.display = "flex";
      div.style.alignItems = "center";
    });

    setOverlayTargets({
      instrument: instDiv,
      timeframe: tfDiv,
      tools: toolDiv,
    });

    return () => {
      chart.removeOverlay("inst-overlay");
      chart.removeOverlay("tf-overlay");
      chart.removeOverlay("tool-overlay");
    };
  }, [chartType]); // Removed selectedInstrumentId to stop blinking

  // 2. Clear old data and signal zoom reset when instrument or timeframe changes
  useEffect(() => {
    if (selectedInstrumentId) {
      if (seriesRef.current) {
        seriesRef.current.setData([]);
      }
      dispatch(clearChartData());
      // Reset zoom guard for the new view
      hasZoomedRef.current[selectedInstrumentId] = false;
    }
  }, [selectedInstrumentId, selectedTimeframe, dispatch]);

  // 3. Populate History and Apply Initial Zoom
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !chartData || chartData.length === 0) return;

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
        // Use visible logical range for better initial scaling
        if (chartRef.current && chartRef.current.chart) {
          chartRef.current.chart.timeScale().setVisibleLogicalRange({
            from: total - 40,
            to: total + 3,
          });
          hasZoomedRef.current[selectedInstrumentId] = true;
        }
      }
    }
  }, [chartData, chartType, selectedInstrumentId]);

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
        background: "#0c0c0c",
        padding: "10px",
        borderRadius: "12px",
        position: "relative",
      }}
    >
      {/* Chart Skeleton as an Overlay */}
      {chartStatus === "loading" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 150,
            backgroundColor: "#0c0c0c",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <ChartSkeleton oneTouchTrading={oneTouchTrading} />
        </div>
      )}

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

      {overlayTargets.instrument &&
        ReactDOM.createPortal(
          <InstrumentDropdown
            instruments={instrumentsForDropdown}
            selectedInstrumentId={selectedInstrumentId}
            onSelect={(id) => {
              dispatch(setSelectedInstrument(id));
              setActiveDropdown(null);
            }}
            isOpen={activeDropdown === "instrument"}
            setIsOpen={(open) => setActiveDropdown(open ? "instrument" : null)}
          />,
          overlayTargets.instrument,
        )}

      {overlayTargets.timeframe &&
        ReactDOM.createPortal(
          <TimeframeDropdown
            timeframeGroups={mockTimeframes}
            selectedTimeframe={selectedTimeframe}
            onSelect={(tf) => {
              setSelectedTimeframe(tf);
              setActiveDropdown(null);
            }}
            isOpen={activeDropdown === "timeframe"}
            setIsOpen={(open) => setActiveDropdown(open ? "timeframe" : null)}
          />,
          overlayTargets.timeframe,
        )}

      {overlayTargets.tools &&
        ReactDOM.createPortal(
          <ToolDropdown
            selectedTool={chartType}
            onSelect={(type) => {
              setChartType(type as any);
              setActiveDropdown(null);
            }}
            isOpen={activeDropdown === "tools"}
            setIsOpen={(open) => setActiveDropdown(open ? "tools" : null)}
          />,
          overlayTargets.tools,
        )}
    </div>
  );
};

export default ChartModule;
