// src/store/slices/openOrdersSlice.ts

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";
import type { RootState } from "../store";
import { hideLoader, showLoader } from "./loadingSlice";

// --- NEW TYPES FOR RAW API RESPONSE ---

// The data structure for an individual order object received directly from the API query
export interface RawOrderData {
  account_id: string;
  end_execution_time: number;
  filled_qty: number;
  id: string;
  instrument_id: string;
  // The instruments array structure from the raw response
  instruments: Array<{
    trading_name?: string;
    static_data?: {
      contract_size?: number;
      contractsize?: number;
      tick_size?: number;
      ticksize?: number;
    };
  }>;
  metadata: {
    legs: {
      stoploss: number;
      target: number;
    };
  };
  order_type: "market" | "limit" | "stop";
  placed_qty: number;
  placed_time: number;
  position_id: string;
  price: number;
  side: "buy" | "sell";
  status: "pending" | "partial_filled" | "placed" | string;
  tid: string;
  validity: string;
  validity_type: string;
}

// The complete API response structure for a successful query
export interface ApiQueryResponse {
  map(arg0: (order: RawOrderData) => OpenOrder): OpenOrder[];
  status: "success" | "failed";
  data?: RawOrderData[]; // The data property holds the array of raw orders
  message?: string;
}

// --- NEW TYPE FOR CANCEL ORDER API RESPONSE ---
interface CancelOrderApiResponse {
  data: string; // The ID of the canceled order, e.g., "SEP25-c190c039..."
  message: string;
  status: "success" | "failed";
}
// --- END NEW TYPES ---

// --- Types for Instrument Static Data (from your API response) ---
export interface InstrumentStaticData {
  contract_size?: number;
  contractsize?: number;
  tick_size?: number;
  ticksize?: number;
  trading_name: string;
}

// --- Types for Open Order Data (based on your API response) ---
export interface OpenOrder {
  account_id: string;
  end_execution_time: number;
  filled_qty: number;
  id: string;
  instrument_id: string;
  // Note: The instruments field in OpenOrder is simplified/modified after mapping,
  // but we can keep it for consistency with the original structure if needed.
  instruments: InstrumentStaticData[];
  metadata: {
    legs: {
      stoploss: number;
      target: number;
    };
  };
  order_type: "market" | "limit" | "stop";
  placed_qty: number;
  placed_time: number;
  position_id: string;
  price: number;
  side: "buy" | "sell";
  status: "pending" | "partial_filled" | "placed" | string;
  tid: string;
  validity: string;
  validity_type: string;
  // Utility field for display (for easier access)
  trading_name: string;
  contract_size: number;
}

interface OpenOrdersState {
  data: any;
  orders: OpenOrder[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: OpenOrdersState = {
  orders: [],
  status: "idle",
  error: null,
  data: undefined
};

// --- Thunk for fetching pending orders data ---
export const fetchOpenOrders = createAsyncThunk(
  "openOrders/fetchOpenOrders",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader());
      // The exact API query provided by the user
      const query =
        'fintrabit.orders[status="pending" or status="partial_filled"]. _desc(placed_time){instruments.trading_name,account_id,end_execution_time,filled_qty,id,instrument_id,metadata,order_type,placed_qty,placed_time,position_id,price,side,start_execution_time,status,tid,instruments.static_data}';

      // 1. Replaced apiClient.send<any>("query", ...) with apiClient.send<ApiQueryResponse>("query", ...)
      const response = await apiClient.send<ApiQueryResponse>("query", {
        query,
      });

      if (response.status === "success" && response.data) {
        // 2. Replaced .map((order: any) => ...) with .map((order: RawOrderData) => ...)
        const ordersWithUtilityFields: OpenOrder[] = response.data.map(
          (order: RawOrderData) => {
            const instrumentData = order.instruments?.[0]; // Use optional chaining

            const contractSize =
              instrumentData?.static_data?.contractsize ||
              instrumentData?.static_data?.contract_size ||
              (instrumentData as any)?.contractsize ||
              (instrumentData as any)?.contract_size ||
              1;
            return {
              ...order, // Set instruments to an empty array to satisfy the type.
              instruments: [], // Extract utility fields
              trading_name: instrumentData?.trading_name || "N/A",
              contract_size: contractSize,
            } as OpenOrder; // Explicitly cast to final type
          }
        );
        return ordersWithUtilityFields;
      } else {
        return rejectWithValue(
          response.message || "Failed to fetch open orders"
        );
      }
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    } finally {
      // 💡 2. HIDE LOADER on success, fail, or crash
      dispatch(hideLoader());
    }
  }
);

/**
 * Thunk for canceling an order.
 * @param orderId The ID of the order to cancel.
 */
export const cancelOrder = createAsyncThunk<
  string, // Return type is the canceled order ID
  string, // Argument type is the order ID
  { state: RootState } // Define the thunk context
>("openOrders/cancelOrder", async (orderId, { rejectWithValue, dispatch }) => {
  try {
    // === INTEGRATED API CALL ===
    const response = await apiClient.send<CancelOrderApiResponse>(
      "account/order/cancel",
      {
        id: orderId, // Use 'id' as per your request JSON
      }
    );
    // === END API CALL ===

    if (response.status === "success") {
      console.log(`Order ${orderId} successfully canceled.`);

      // Optimistically dispatch action to remove the order from state
      // (The server may also send a stream update, but removing it locally feels faster)
      dispatch(openOrdersSlice.actions.removeOrder(orderId));

      // Return the order ID to the fulfilled action handler
      return orderId;
    } else {
      // API call failed, but returned a status
      return rejectWithValue(
        response.message || `Failed to cancel order ${orderId}`
      );
    }
  } catch (error) {
    const errorMessage =
      (error as { message?: string }).message ||
      `An unknown error occurred while canceling order ${orderId}.`;
    return rejectWithValue(errorMessage);
  }
});

export const openOrdersSlice = createSlice({
  name: "openOrders",
  initialState,
  reducers: {
    // Reducer to handle order updates from a WebSocket stream can be added here later
    // ✅ Reducer to remove a canceled order from the state
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(
        (order) => order.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchOpenOrders.fulfilled,
        (state, action: PayloadAction<OpenOrder[]>) => {
          state.status = "succeeded";
          state.orders = action.payload;
        }
      )
      .addCase(fetchOpenOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Optionally handle the cancelOrder thunk's lifecycle
      .addCase(cancelOrder.rejected, (_state, action) => {
        // Log or display an error if the cancellation API call fails
        console.error("Order cancellation failed:", action.payload);
      });
  },
});

export const selectOpenOrders = (state: RootState) => state.openOrders.orders;
export const selectOpenOrdersStatus = (state: RootState) =>
  state.openOrders.status;

export default openOrdersSlice.reducer;
