import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
// import { apiClient } from "../../services/socketService";
// import { generateMockChartData } from "../../mockData";
import { apiClient } from "../../services/socketService";

// Define the shape of a single OHLCV data point
export interface OHLVCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Define the shape of the API response data
export interface ChartApiResponseData {
  data: {
    data: OHLVCData;
    time: number;
    id: string;
    instrument_id: string;
    type: string;
  }[];
  message: string;
  status: string;
}

// Define the state for the chart slice
export interface ChartState {
  data: OHLVCData[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ChartState = {
  data: [],
  status: "idle",
  error: null,
};

/**
 * Async thunk to fetch historical chart data for a given instrument.
 * It fetches a specific range of data using the `startIndex` and `endIndex`.
 *
 * @param {string} instrumentId - The unique identifier of the financial instrument.
 * @param {number} startIndex - The starting index for the data slice.
 * @param {number} endIndex - The ending index for the data slice.
 * @param {string} timeframe - The timestamp for the data slice.
 */
export const fetchChartData = createAsyncThunk(
  "chart/fetchData",
  async (
    {instrumentId, startIndex, endIndex, timeframe}: {
      instrumentId: string;
      startIndex: number;
      endIndex: number;
      timeframe: string;
    },
    { rejectWithValue }
  ) => {
    try {
// // mock data
//       // console.log(instrumentId, startIndex, endIndex, timeframe)
//       const mockData = generateMockChartData();
//       // console.log(
//       //   "fetchChartData: Returning 100 mock data points for development.", mockData
//       // );
//       return mockData;
console.log(timeframe);
      const query = `fintrabit.chart_history[instrument_id="${instrumentId}"]._desc(time)[${startIndex}:${endIndex}]`;

            const response = await apiClient.send<ChartApiResponseData>("query", {
              query,
            });

            console.log("sliceThuk", response)

            if (response.status === "success" && response.data) {
              // Map the raw API response to the desired OHLVCData format.
              // The `_desc(time)` query means data comes in descending order,
              // so we reverse it to get a chronological order for the chart.
              const chartData: OHLVCData[] = response.data

                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                .map((item) => ({
                  time: item.time, // Unix timestamp is ideal for charting libraries
                  open: item.data.open,
                  high: item.data.high,
                  low: item.data.low,
                  close: item.data.close,
                  volume: item.data.volume,
                }))
                .reverse(); // Reverse to get chronological order
              console.log("chartData slice", chartData);

              // Ensure unique timestamps (sometimes API might send duplicates at boundaries)
              const uniqueChartData: OHLVCData[] = [];
              const seenTimes = new Set<number>();

              chartData.forEach((d) => {
                if (!seenTimes.has(d.time)) {
                  seenTimes.add(d.time);
                  uniqueChartData.push(d);
                }
              });

              console.log(
                "fetchChartData -> returned points:",
                uniqueChartData.length,
              );

              return uniqueChartData;
            }

            return rejectWithValue(
              response?.payload?.message || "Failed to fetch chart data."
            );
           } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

const chartSlice = createSlice({
  name: "chart",
  initialState,
  reducers: {
    // A reducer to add new data to the beginning of the existing data array.
    // This is useful for "lazy loading" more historical data.
    prependChartData: (state, action: PayloadAction<OHLVCData[]>) => {
      // Prepend new data and keep the state immutable
      state.data = [...action.payload, ...state.data];
    },

    clearChartData: (state) => {
      state.data = [];
      state.status = "idle";
      state.error = null;
    },

    updateLiveCandle: (
      state,
      action: PayloadAction<{
        instrumentId: string;
        data: any;
      }>
    ) => {
      const { data } = action.payload;
      // console.log("🔥 updateLiveCandle reducer called:", data);
      if (!data || !data.ltp || !data.ltpt) return;

      const ltp = Array.isArray(data.ltp) ? data.ltp[0] : data.ltp;
      const ltpt = Array.isArray(data.ltpt) ? data.ltpt[0] : data.ltpt;
      
      // Convert to seconds for Ticktime calculation as per 60/300 etc rule
      const ltptSec = Math.floor(ltpt / 1000);
      const currentTickTime = ltptSec - (ltptSec % 60);

      if (state.data.length === 0) {
        // If empty, create initial candle
        const newCandle: OHLVCData = {
          time: currentTickTime,
          open: ltp,
          high: ltp,
          low: ltp,
          close: ltp,
          volume: 0,
        };
        state.data = [newCandle];
        return;
      }

      const lastCandle = state.data[state.data.length - 1];
      
      if (lastCandle.time === currentTickTime) {
        // Update existing candle
        if (ltp > lastCandle.high) lastCandle.high = ltp;
        if (ltp < lastCandle.low) lastCandle.low = ltp;
        lastCandle.close = ltp;
      } else if (currentTickTime > lastCandle.time) {
        // New candle interval
        const newCandle: OHLVCData = {
          time: currentTickTime,
          open: ltp,
          high: ltp,
          low: ltp,
          close: ltp,
          volume: 0,
        };
        state.data.push(newCandle);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChartData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchChartData.fulfilled,
        (state, action: PayloadAction<OHLVCData[]>) => {
          state.status = "succeeded";
          // If the data array is empty, this is the initial load.
          if (state.data.length === 0) {
            state.data = action.payload;
          } else {
            // Otherwise, we are lazy loading, so we prepend the new data.
            // We also need to handle potential duplicates at the boundary.
            const newData = action.payload;
            const existingData = state.data;

            // Find the index where the new data starts in the existing data
            const lastExistingTime = existingData[0].time;
            const newUniqueData = newData.filter(
              (item) => item.time < lastExistingTime
            );

            // Prepend the new unique data
            state.data = [...newUniqueData, ...existingData];
          }
        }
      )
      .addCase(fetchChartData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { prependChartData, clearChartData, updateLiveCandle } =
  chartSlice.actions;

export default chartSlice.reducer;
