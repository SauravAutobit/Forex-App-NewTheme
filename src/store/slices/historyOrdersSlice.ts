// src/store/slices/historyOrdersSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";
import { hideLoader, showLoader } from "./loadingSlice";

export interface HistoryOrder {
  account_id: string;
  end_execution_time: number;
  filled_qty: number;
  id: string;
  instrument_id: string;
  instruments: {
    contract_size?: number;
    contractsize?: number;
    tick_size?: number;
    ticksize?: number;
    trading_name?: string;
    static_data?: Record<string, string | number>;
  }[];
  metadata: { legs?: { stoploss: number; target: number } };
  order_type: string;
  placed_qty: number;
  placed_time: number;
  position_id: string;
  price: number;
  side: "buy" | "sell";
  start_execution_time: number;
  status: "filled" | "cancelled" | "open" | string;
  tid: string;
  validity: string;
  validity_type: string;
}

interface HistoryOrdersState {
  data: HistoryOrder[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  offset: number;
  hasMore: boolean;
}

const initialState: HistoryOrdersState = {
  data: [],
  status: "idle",
  error: null,
  offset: 0,
  hasMore: true,
};

export const fetchHistoryOrders = createAsyncThunk<
  { data: HistoryOrder[]; isLoadMore: boolean },
  { offset: number; limit: number },
  { rejectValue: string }
>(
  "historyOrders/fetchHistoryOrders",
  async ({ offset, limit }, { dispatch, rejectWithValue }) => {
    try {
      if (offset === 0) dispatch(showLoader());
      type ApiResp =
        | { status: "success"; data: HistoryOrder[] }
        | { status: "error"; message: string };
      const response = await apiClient.send<ApiResp>("query", {
        query: `fintrabit.orders[(status="filled" or status="canceled") and placed_time>${1}]._desc(placed_time)[${offset}:${offset + limit}]{instruments.trading_name,account_id,end_execution_time,filled_qty,id,instrument_id,metadata,order_type,placed_qty,placed_time,position_id,price,side,start_execution_time,status,tid,instruments.static_data}`,
      });

      if (
        response &&
        response.status === "success" &&
        Array.isArray(response.data)
      ) {
        return { data: response.data, isLoadMore: offset > 0 };
      }
      return rejectWithValue(
        response?.message || "Failed to fetch history orders."
      );
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorResponse: any = error;
      const NO_DATA_SUBSTRING = "expect table data in projection but got";

      const isExpectedEmptyError =
        (errorResponse?.status === "failed" ||
          errorResponse?.status === "error") &&
        typeof errorResponse.message === "string" &&
        errorResponse.message.includes(NO_DATA_SUBSTRING) &&
        typeof errorResponse.data === "object" &&
        errorResponse.data !== null &&
        Object.keys(errorResponse.data).length === 0;

      if (isExpectedEmptyError) {
        return { data: [] as HistoryOrder[], isLoadMore: offset > 0 };
      }

      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    } finally {
      if (offset === 0) dispatch(hideLoader());
    }
  }
);

const historyOrdersSlice = createSlice({
  name: "historyOrders",
  initialState,
  reducers: {
    resetHistoryOrders: (state) => {
      state.data = [];
      state.offset = 0;
      state.hasMore = true;
      state.status = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoryOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchHistoryOrders.fulfilled,
        (state, action: PayloadAction<{ data: HistoryOrder[]; isLoadMore: boolean }>) => {
          state.status = "succeeded";
          const { data, isLoadMore } = action.payload;

          if (isLoadMore) {
            state.data = [...state.data, ...data];
          } else {
            state.data = data;
          }

          state.offset += data.length;
          state.hasMore = data.length === 30; // Assuming limit is 30
        }
      )
      .addCase(fetchHistoryOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        if (state.offset === 0) {
          state.data = [];
        }
      });
  },
});

export const { resetHistoryOrders } = historyOrdersSlice.actions;

export default historyOrdersSlice.reducer;