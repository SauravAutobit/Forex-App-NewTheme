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
}

const initialState: HistoryPositionsState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchHistoryPositions = createAsyncThunk<
  HistoryPosition[],
  number,
  { rejectValue: string }
>(
  "historyPositions/fetchHistoryPositions",
  async (_timestamp, { dispatch, rejectWithValue }) => {
    dispatch(showLoader());
    const query = `fintrabit.positions[status="closed" and created_at>${1}][0:30]{account_id,closed_pnl,created_at,id,instrument_id,price,qty,side,status,tid,updated_at,used_balance,"trading_name":instruments.trading_name[0],instruments.static_data,trades,torders[status="filled"],instruments.static_data}`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.send<any>("query", { query });
      if (
        response &&
        response.status === "success" &&
        Array.isArray(response.data)
      ) {
        return response.data as HistoryPosition[];
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
        return [] as HistoryPosition[];
      }

      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    } finally {
      // 💡 2. HIDE LOADER on success, fail, or crash
      dispatch(hideLoader());
    }
  }
);

const historyPositionsSlice = createSlice({
  name: "historyPositions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoryPositions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchHistoryPositions.fulfilled,
        (state, action: PayloadAction<HistoryPosition[]>) => {
          state.status = "succeeded";
          state.data = action.payload;
        }
      )
      .addCase(fetchHistoryPositions.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || action.error.message || null;
        state.data = [];
      });
  },
});

export default historyPositionsSlice.reducer;
