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
}

const initialState: HistoryOrdersState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchHistoryOrders = createAsyncThunk<
  HistoryOrder[],
  number,
  { rejectValue: string }
>(
  "historyOrders/fetchHistoryOrders",
  async (_timestamp, { dispatch, rejectWithValue }) => {
    try {
dispatch(showLoader())
      type ApiResp =
        | { status: "success"; data: HistoryOrder[] }
        | { status: "error"; message: string };
      const response = await apiClient.send<ApiResp>("query", {
        query: `fintrabit.orders[status="filled" and placed_time>${1}]._desc(placed_time)[0:30]{instruments.trading_name,account_id,end_execution_time,filled_qty,id,instrument_id,metadata,order_type,placed_qty,placed_time,position_id,price,side,start_execution_time,status,tid,instruments.static_data}`,
      });

      if (
        response &&
        response.status === "success" &&
        Array.isArray(response.data)
      ) {
        return response.data;
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
        return [] as HistoryOrder[];
      }

      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(hideLoader());
    }
  }
);

const historyOrdersSlice = createSlice({
  name: "historyOrders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoryOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchHistoryOrders.fulfilled,
        (state, action: PayloadAction<HistoryOrder[]>) => {
          state.status = "succeeded";
          state.data = action.payload;
        }
      )
      .addCase(fetchHistoryOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.data = [];
      });
  },
});

export default historyOrdersSlice.reducer;