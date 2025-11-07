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