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
  offset: number;
  hasMore: boolean;
}

const initialState: DealsState = {
  deals: [],
  status: "idle",
  error: null,
  offset: 0,
  hasMore: true,
};

/**
 * fetchDeals expects { offset, limit }.
 * On success: returns { data: Deal[], isLoadMore: boolean }
 * On failure: returns rejectWithValue(string)
 */
export const fetchDeals = createAsyncThunk<
  { data: Deal[]; isLoadMore: boolean },
  { offset: number; limit: number },
  { rejectValue: string }
>("deals/fetchDeals", async ({ offset, limit }, { dispatch, rejectWithValue }) => {
  if (!apiClient) {
    return rejectWithValue("API Client not initialized.");
  }

  const dealsQuery = {
    query: `fintrabit.trades[time>${1}]._desc(time)[${offset}:${offset + limit}]{account_id,charges,closed_pnl,id,instrument_id,order_id,position_id,price,qty,side,status,tid,time,type,orders.tid,positions.tid,instruments.trading_name,instruments.static_data}`,
  };

  try {
    if (offset === 0) dispatch(showLoader());
    // apiClient.send may be typed in your codebase; using `any` here for safety then validating
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await apiClient.send<any>("query", dealsQuery);

    if (!response || typeof response !== "object") {
      return rejectWithValue(
        "No response or invalid response from API client."
      );
    }

    if (response.status === "success" && Array.isArray(response.data)) {
      return { data: response.data as Deal[], isLoadMore: offset > 0 };
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
      return { data: [] as Deal[], isLoadMore: offset > 0 };
    }
    console.error("Error fetching deals:", err);
    const msg =
      typeof errorResponse.message === "string" &&
      errorResponse.message.length > 0
        ? errorResponse.message
        : "Network or unknown error during deal fetch.";

    return rejectWithValue(msg);
  } finally {
      if (offset === 0) dispatch(hideLoader());
  }
});

const dealsSlice = createSlice({
  name: "deals",
  initialState,
  reducers: {
    resetDeals(state) {
      state.deals = [];
      state.status = "idle";
      state.error = null;
      state.offset = 0;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action: PayloadAction<{ data: Deal[]; isLoadMore: boolean }>) => {
        state.status = "succeeded";
        const { data, isLoadMore } = action.payload;

        if (isLoadMore) {
          state.deals = [...state.deals, ...data];
        } else {
          state.deals = data;
        }
        
        state.offset += data.length;
        state.hasMore = data.length === 30; // Assuming limit is 30
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        if (state.offset === 0) {
          state.deals = [];
        }
      });
  },
});

export const { resetDeals } = dealsSlice.actions;
export default dealsSlice.reducer;
