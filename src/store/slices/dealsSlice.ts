// src/store/slices/dealsSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";
import { hideLoader, showLoader } from "./loadingSlice";

export interface Deal {
  account_id: string;
  charges: Array<{ charge: number; name: string; type: string }>;
  closed_pnl: number;
  id: string;
  instrument_id: string;
  instruments: Array<{
    contract_size?: number;
    contractsize?: number;
    tick_size?: number;
    ticksize?: number;
    name?: string;
    static_data?: unknown;
  }>;
  order_id: string;
  orders: string[];
  position_id: string;
  positions: string[];
  price: number;
  qty: number;
  side: "buy" | "sell";
  status: string;
  tid: string;
  time: number;
  type: string;
}

interface DealsState {
  deals: Deal[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DealsState = {
  deals: [],
  status: "idle",
  error: null,
};

/**
 * fetchDeals expects a unix-timestamp (seconds).
 * On success: returns Deal[]
 * On failure: returns rejectWithValue(string)
 */
export const fetchDeals = createAsyncThunk<
  Deal[],
  number,
  { rejectValue: string }
>("deals/fetchDeals", async (timestamp, { dispatch, rejectWithValue }) => {
  if (!apiClient) {
    return rejectWithValue("API Client not initialized.");
  }

  const dealsQuery = {
    query: `fintrabit.trades[time>${timestamp}]._desc(time){account_id,charges,closed_pnl,id,instrument_id,order_id,position_id,price,qty,side,status,tid,time,type,orders.tid,positions.tid,instruments.name,instruments.static_data}`,
  };

  try {
    dispatch(showLoader());
    // apiClient.send may be typed in your codebase; using `any` here for safety then validating
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await apiClient.send<any>("query", dealsQuery);

    if (!response || typeof response !== "object") {
      return rejectWithValue(
        "No response or invalid response from API client."
      );
    }

    if (response.status === "success" && Array.isArray(response.data)) {
      return response.data as Deal[];
    }

    const msg =
      typeof response.message === "string"
        ? response.message
        : "Failed to fetch deals.";
    return rejectWithValue(msg);
  } catch (err) {
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorResponse: any = err;
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
      return [] as Deal[];
    }
    console.error("Error fetching deals:", err);
    const msg =
      typeof errorResponse.message === "string" &&
      errorResponse.message.length > 0
        ? errorResponse.message
        : "Network or unknown error during deal fetch.";

    return rejectWithValue(msg);
  } finally {
      // 💡 2. HIDE LOADER on success, fail, or crash
      dispatch(hideLoader());
    }
});

const dealsSlice = createSlice({
  name: "deals",
  initialState,
  reducers: {
    clearDeals(state) {
      state.deals = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action: PayloadAction<Deal[]>) => {
        state.status = "succeeded";
        state.deals = action.payload;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.deals = [];
      });
  },
});

export const { clearDeals } = dealsSlice.actions;
export default dealsSlice.reducer;
