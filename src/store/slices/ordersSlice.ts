import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";
import { setOrderStatus } from "./orderStatusSlice";
import { fetchPositions, type Position } from "./positionsSlice"; // Import the positions thunk

// A new interface that includes position_id for closing orders
export interface ClosePositionPayload {
  instrument_id: string;
  qty: number;
  price: number;
  order_type: "market" | "limit" | "stop";
  side: "buy" | "sell";
  stoploss: number;
  target: number;
  position_id: string; // ✅ This is the key addition
}

export interface PlaceOrderPayload {
  instrument_id: string;
  qty: number;
  price: number;
  order_type: "market" | "limit" | "stop";
  side: "buy" | "sell";
  stoploss: number;
  target: number;
}

export interface OrderResponse {
  data: string;
  message: string;
  status: "success" | "failure";
}

interface OrdersState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastPlacedOrderId: string | null;
}

const initialState: OrdersState = {
  status: "idle",
  error: null,
  lastPlacedOrderId: null,
};

export const placeNewOrder = createAsyncThunk(
  "orders/placeNewOrder",
  async (orderPayload: PlaceOrderPayload, { rejectWithValue, dispatch }) => {
    dispatch(
      setOrderStatus({ status: "loading", message: "Placing order..." })
    );
    try {
      console.log("orderPayload", orderPayload);
      const response = await apiClient.send<OrderResponse>(
        "account/order/place",
        orderPayload
      );

      if (response.status === "success") {
        dispatch(
          setOrderStatus({
            status: "succeeded",
            message: "Order placed successfully!",
          })
        );
        return response.data;
      }

      const errorMessage = response.message || "Failed to place order.";
      dispatch(setOrderStatus({ status: "failed", message: errorMessage }));
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      dispatch(setOrderStatus({ status: "failed", message: errorMessage }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Define the async thunk to close a position
export const closePosition = createAsyncThunk<
  string, // The type of the payload on success
  ClosePositionPayload,
  { rejectValue: string }
>(
  "orders/closePosition",
  async (
    orderPayload: ClosePositionPayload,
    { rejectWithValue, dispatch }
  ): Promise<string | ReturnType<typeof rejectWithValue>> => {
    dispatch(
      setOrderStatus({ status: "loading", message: "Closing position..." })
    );
    try {
      const response = await apiClient.send<{
        data: string;
        message: string;
        status: "success" | "failure";
      }>("account/order/place", orderPayload);

      if (response.status === "success") {
        dispatch(
          setOrderStatus({
            status: "succeeded",
            message: "Position closed successfully!",
          })
        );
        // Refresh the positions list after a successful closure
        dispatch(fetchPositions());
        return response.data as unknown as string;
      }

      const errorMessage = response.message || "Failed to close position.";
      dispatch(setOrderStatus({ status: "failed", message: errorMessage }));
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      dispatch(setOrderStatus({ status: "failed", message: errorMessage }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const bulkClosePositions = createAsyncThunk<
  string, 
  Position[], 
  { rejectValue: string }
>(
  "orders/bulkClosePositions",
  async (positions: Position[], { rejectWithValue, dispatch }) => {
    dispatch(
      setOrderStatus({
        status: "loading",
        message: `Closing ${positions.length} positions...`,
      })
    );

    if (positions.length === 0) {
      // Keep status successful if there's nothing to do
      dispatch(
        setOrderStatus({
          status: "succeeded",
          message: "No positions to close.",
        })
      );
      return "No positions to close.";
    }

    const closePromises = positions.map(async (pos) => {
      const closingSide = pos.side === "buy" ? "sell" : "buy";
      const closePayload: ClosePositionPayload = {
        instrument_id: pos.instrument_id,
        qty: pos.qty,
        price: 0, 
        order_type: "market",
        side: closingSide,
        stoploss: 0,
        target: 0,
        position_id: pos.id,
      };

      // Console log the individual payload before sending
      console.log(
        `Dispatching close for Position ID: ${pos.id}, Instrument: ${pos.instrument_id}`
      );
      console.log("Payload:", closePayload);

      const response = await apiClient.send<OrderResponse>(
        "account/order/place",
        closePayload
      );

      if (response.status !== "success") {
        // Throw an error to mark this promise as rejected
        throw new Error(
          response.message ||
            `Failed to close ${pos.instrument_id} (ID: ${pos.id})`
        );
      }
      return response.data; 
    });

    // Use Promise.allSettled to ensure all orders are attempted regardless of individual failures
    const results = await Promise.allSettled(closePromises);

    const fulfilledCount = results.filter(
      (r) => r.status === "fulfilled"
    ).length;
    const rejectedCount = results.filter((r) => r.status === "rejected").length;

    if (rejectedCount === 0) {
      // All positions closed successfully
      dispatch(
        setOrderStatus({
          status: "succeeded",
          message: `${fulfilledCount} positions closed successfully!`,
        })
      );
    } else if (fulfilledCount > 0) {
      // Partial success
      const failedMessages = results
        .filter((r) => r.status === "rejected")
        .map((r) => (r as PromiseRejectedResult).reason.message)
        .join(", ");

      const message = `${fulfilledCount} closed, ${rejectedCount} failed. Errors: ${failedMessages.substring(
        0,
        100
      )}...`;
      dispatch(setOrderStatus({ status: "failed", message }));
      return rejectWithValue(message);
    } else {
      // All failed
      const failedMessages = results
        .map((r) => (r as PromiseRejectedResult).reason.message)
        .join(", ");

      const message = `All ${rejectedCount} positions failed to close. Errors: ${failedMessages.substring(
        0,
        100
      )}...`;
      dispatch(setOrderStatus({ status: "failed", message }));
      return rejectWithValue(message);
    }

    // Refresh all positions only after all close attempts have completed
    dispatch(fetchPositions());
    return `Bulk operation completed: ${fulfilledCount} succeeded, ${rejectedCount} failed.`;
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.status = "idle";
      state.error = null;
      state.lastPlacedOrderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeNewOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(placeNewOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          state.lastPlacedOrderId = action.payload;
        }
      })
      .addCase(placeNewOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // ✅ Add extra reducers for the new thunk
      .addCase(closePosition.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(closePosition.fulfilled, (state, action) => {
        console.log("action CLOSED", action);
        state.status = "succeeded";
        state.lastPlacedOrderId = action.payload;
      })
      .addCase(closePosition.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // ✅ Add extra reducers for the new thunk
      .addCase(bulkClosePositions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(bulkClosePositions.fulfilled, (state) => {
        state.status = "succeeded";
        // lastPlacedOrderId is not relevant for bulk operations, so we leave it as is or set to null
      })
      .addCase(bulkClosePositions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetOrderState } = ordersSlice.actions;

export default ordersSlice.reducer;
