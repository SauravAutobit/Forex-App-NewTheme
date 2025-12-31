// src/store/slices/historyPositionsSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";
import { hideLoader, showLoader } from "./loadingSlice";

export interface InstrumentStaticData {
  contract_size?: number;
  contractsize?: number;
  tick_size?: number;
  ticksize?: number;
}

export interface TradeCharge {
  charge: number;
  name: string;
  type: string;
}

export interface Trade {
  account_id: string;
  charges: TradeCharge[];
  closed_pnl: number;
  id: string;
  instrument_id: string;
  order_id: string;
  position_id: string;
  price: number;
  qty: number;
  side: "buy" | "sell";
  status: string;
  tid: string;
  time: number;
  type: "in" | "out";
}

export interface HistoryTOrder {
  account_id: string;
  end_execution_time: number;
  filled_qty: number;
  id: string;
  instrument_id: string;
  metadata: { legs: { stoploss: number; target: number } };
  order_type: string;
  placed_qty: number;
  placed_time: number;
  position_id: string;
  price: number;
  side: "buy" | "sell";
  start_execution_time: number;
  status: "filled" | "cancelled" | string;
  tid: string;
  validity: string;
  validity_type: string;
}

export interface HistoryPosition {
  instrument: any;
  time_setup: string | number | Date;
  account_id: string;
  closed_pnl: number;
  created_at: number;
  id: string;
  instrument_id: string;
  instruments: InstrumentStaticData[];
  price: number;
  qty: number;
  side: "buy" | "sell";
  status: "closed" | string;
  tid: string;
  torders: HistoryTOrder[];
  trades: Trade[];
  trading_name: string;
  updated_at: number;
  used_balance: number;
}

interface HistoryPositionsState {
  data: HistoryPosition[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  offset: number;
  hasMore: boolean;
}

const initialState: HistoryPositionsState = {
  data: [],
  status: "idle",
  error: null,
  offset: 0,
  hasMore: true,
};

export const fetchHistoryPositions = createAsyncThunk<
  { data: HistoryPosition[]; isLoadMore: boolean },
  { offset: number; limit: number },
  { rejectValue: string }
>(
  "historyPositions/fetchHistoryPositions",
  async ({ offset, limit }, { dispatch, rejectWithValue }) => {
    // Only show global loader on initial fetch
    if (offset === 0) dispatch(showLoader());
    
    // Dynamic query with offset and limit
    const query = `fintrabit.positions[status="closed" and created_at>${1}][${offset}:${offset + limit}]{account_id,closed_pnl,created_at,id,instrument_id,price,qty,side,status,tid,updated_at,used_balance,"trading_name":instruments.trading_name[0],instruments.static_data,trades,torders[status="filled"],instruments.static_data}`;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.send<any>("query", { query });
      if (
        response &&
        response.status === "success" &&
        Array.isArray(response.data)
      ) {
        return { data: response.data as HistoryPosition[], isLoadMore: offset > 0 };
      }
      return rejectWithValue(
        response?.message || "Failed to fetch closed positions."
      );
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorResponse: any = error;
      const NO_DATA_SUBSTRING = "expect table data in projection but got";

      const isExpectedEmptyError =
        errorResponse?.status === "failed" &&
        typeof errorResponse.message === "string" &&
        errorResponse.message.includes(NO_DATA_SUBSTRING) &&
        typeof errorResponse.data === "object" &&
        errorResponse.data !== null &&
        Object.keys(errorResponse.data).length === 0;

      if (isExpectedEmptyError) {
        return { data: [] as HistoryPosition[], isLoadMore: offset > 0 };
      }

      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    } finally {
      if (offset === 0) dispatch(hideLoader());
    }
  }
);

const historyPositionsSlice = createSlice({
  name: "historyPositions",
  initialState,
  reducers: {
    resetHistoryPositions: (state) => {
      state.data = [];
      state.offset = 0;
      state.hasMore = true;
      state.status = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoryPositions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchHistoryPositions.fulfilled,
        (state, action: PayloadAction<{ data: HistoryPosition[]; isLoadMore: boolean }>) => {
          state.status = "succeeded";
          const { data, isLoadMore } = action.payload;
          
          if (isLoadMore) {
            state.data = [...state.data, ...data];
          } else {
            state.data = data;
          }
          
          // Update offset for next fetch
          state.offset += data.length;
          // If we received fewer items than the limit (assumed 30 based on usage), no more data
          state.hasMore = data.length === 30; 
        }
      )
      .addCase(fetchHistoryPositions.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || action.error.message || null;
        // Don't clear data on load more failure
        if (state.offset === 0) {
           state.data = [];
        }
      });
  },
});

export const { resetHistoryPositions } = historyPositionsSlice.actions;

export default historyPositionsSlice.reducer;
