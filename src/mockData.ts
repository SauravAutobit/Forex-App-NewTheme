import type { OHLVCData } from "./store/slices/chartSlice"; // Assuming your interface is exported from the slice file
 // Assuming your interface is exported from the slice file

/**
 * Generates an array of 100 simulated historical OHLCV data points.
 *
 * @returns {OHLVCData[]} An array of 100 simulated OHLCV objects.
 */
export const generateMockChartData = (): OHLVCData[] => {
  const mockData: OHLVCData[] = [];
  const count = 100;
  
  // Start with a recent Unix timestamp (e.g., now, then work backward)
  // Use a fixed starting point for predictable testing
  let currentTime = 1758905340; 
  let currentClose = 28.55;
  const periodSeconds = 60 * 5; // 5-minute bars for simulation

  for (let i = 0; i < count; i++) {
    // 1. Calculate the time for the current bar (working backward)
    currentTime -= periodSeconds; 

    // 2. Simulate price movement
    const volatility = 0.05; // Base volatility for realistic change
    const priceChange = (Math.random() * volatility * 2) - volatility;
    
    // Calculate new prices based on the previous close
    const newOpen = parseFloat((currentClose).toFixed(2));
    const newClose = parseFloat((newOpen + priceChange).toFixed(2));
    
    // Determine high and low
    const simulatedHigh = parseFloat((Math.max(newOpen, newClose) + Math.random() * 0.02).toFixed(2));
    const simulatedLow = parseFloat((Math.min(newOpen, newClose) - Math.random() * 0.02).toFixed(2));

    // Simulate volume
    const volume = Math.floor(1000 + Math.random() * 500);

    // 3. Create the data point and add it to the start of the array (descending order)
    mockData.unshift({
      time: currentTime,
      open: newOpen,
      high: simulatedHigh,
      low: simulatedLow,
      close: newClose,
      volume: volume,
    });

    // 4. Update the close price for the next iteration
    currentClose = newClose;
  }
  
  // The generator returns data in chronological (time ascending) order,
  // which is typically what charting libraries expect.
  return mockData;
};


export const mockInstruments = [
  { id: "EURUSD_ID", name: "EURUSD" },
  { id: "GBPUSD_ID", name: "GBPUSD" },
  { id: "XAUUSD_ID", name: "XAUUSD)" },
  { id: "BTCUSD_ID", name: "BTCUSD" },
  { id: "SPX500_ID", name: "S&P500" },
  { id: "JP225_ID", name: "Nikkei225" },
];

export type Instrument = {
  id: string;
  name: string;
};


// mockData.ts (Add this to your existing file)

export const mockTimeframes = [
  {
    category: "Minutes",
    options: [
      { label: "1M", value: "1m" },
      { label: "5M", value: "5m" },
      { label: "10M", value: "10m" },
      { label: "15M", value: "15m" },
      { label: "30M", value: "30m" },
    ],
  },
  {
    category: "Hours",
    options: [
      { label: "1H", value: "1h" },
      { label: "5H", value: "5h" },
      { label: "10H", value: "10h" },
      { label: "24H", value: "24h" },
    ],
  },
  {
    category: "Days",
    options: [
      { label: "1D", value: "1d" },
      { label: "5D", value: "5d" },
      { label: "10D", value: "10d" },
      { label: "20D", value: "20d" },
    ],
  },
  {
    category: "Months",
    options: [
      { label: "1M", value: "1mo" },
      { label: "5M", value: "5mo" },
      { label: "10M", value: "10mo" },
    ],
  },
  {
    category: "Years",
    options: [
      { label: "1Y", value: "1y" },
      { label: "5Y", value: "5y" },
      { label: "10Y", value: "10y" },
    ],
  },
];