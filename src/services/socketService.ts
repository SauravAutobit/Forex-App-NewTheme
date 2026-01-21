import type { Store } from "@reduxjs/toolkit";
import { WebSocketClient } from "./WebSocketClient";
import {
  setApiStatus,
  setStreamStatus,
  setEventStatus,
} from "../store/slices/webSocketSlice";
import {
  WEBSOCKET_API_URL,
  WEBSOCKET_EVENT_URL,
  WEBSOCKET_STREAM_URL,
} from "../utils//constants/app.constants";
import {
  fetchPositions,
  updatePositionQuote,
} from "../store/slices/positionsSlice";
import { fetchDeals } from "../store/slices/dealsSlice";
import type { RootState, AppDispatch } from "../store/store";
import { updateQuoteData } from "../store/slices/quotesSlice";
import { fetchHistoryOrders } from "../store/slices/historyOrdersSlice";
import { fetchHistoryPositions } from "../store/slices/historyPositionsSlice";
import {
  showToasty,
  hideToasty,
  type ToastyData,
} from "../store/slices/notificationSlice";
import { fetchAccountBalance } from "../store/slices/accountSlice";
import { fetchOpenOrders } from "../store/slices/openOrdersSlice";

type StreamDataPayload = {
  bid?: number[];
  ask?: number[];
  // New OHLC format from backend (can be number or array)
  c?: number | number[]; // close
  h?: number | number[]; // high
  l?: number | number[]; // low
  o?: number | number[]; // open
  // Old format (backward compatibility)
  close?: number[];
  high?: number[];
  low?: number[];
  open?: number[];
  // LTP fields
  ltp?: number[];
  ltpq?: number[];
  ltpt?: number[];
  // Bid/Ask quantities
  bidq?: number[];
  askq?: number[];
};

function isStreamQuoteMessage(msg: unknown): msg is {
  component: "quotes";
  instrument: { id: string };
  data: StreamDataPayload;
} {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "component" in msg &&
    (msg as { component: string }).component === "quotes" &&
    "instrument" in msg &&
    typeof (msg as { instrument: unknown }).instrument === "object" &&
    "id" in (msg as { instrument: { id: string } }).instrument &&
    "data" in msg &&
    typeof (msg as { data: unknown }).data === "object"
  );
}


export const refreshAllHistoryData = (dispatch: AppDispatch, timestamp?: number) => {
  // If timestamp not provided compute start-of-today
  const ts =
    typeof timestamp === "number"
      ? timestamp
      : Math.floor(
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            0,
            0,
            0,
            0
          ).getTime() / 1000
        );

  console.log("🔄 Triggering refresh for all history data with timestamp:", ts);

  // Use pagination objects (reset to first page) for history fetches
  dispatch(fetchHistoryPositions({ offset: 0, limit: 30 }));
  dispatch(fetchDeals({ offset: 0, limit: 30 }));
  dispatch(fetchHistoryOrders({ offset: 0, limit: 30 }));

  // Other non-history thunks
  dispatch(fetchAccountBalance());
  dispatch(fetchPositions());
  dispatch(fetchOpenOrders())
};

const API_BASE_URL = WEBSOCKET_API_URL; 
const STREAM_BASE_URL = WEBSOCKET_STREAM_URL; //import.meta.env.VITE_STREAM_URL;
const EVENT_BASE_URL = WEBSOCKET_EVENT_URL;

let apiClient: WebSocketClient;
let streamClient: WebSocketClient;
let eventClient: WebSocketClient;


// const getAuthToken = (store: Store<RootState>): string | null => {
//     const state = store.getState() as RootState; 
//     return state.auth.currentAccount?.token ?? null;
// };

// const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiQUNDLWE0NDFhNmVjYzAxZDRkNTZhNDY4MmJkMjJmOTI2MjA1IiwiYWNjaWQiOiIxNmM3NzFmNi01MjJmLTQ1MjQtODBhNC1lNjQ2NGM3MzQzM2EiLCJyb2xlIjoiYWNjb3VudCIsImlwIjoiMTAzLjE1Ny41Mi4yMjY6NTk0MzgifQ.SA4DOb2wh99Si9hZrEpr6IkOQVwGsNJ2O-oRjKKCRDs";
// const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiQUNDLWU1ZDdjNWExMDFhZTRhODc5NDAyZjgzNTkxNzUzMjMyIiwiYWNjaWQiOiJjMGFiMDQwNC1lYTIzLTQ2MDUtYTU4ZC1kNWViNjdhYWM1YWYiLCJyb2xlIjoiYWNjb3VudCIsImlwIjoiMTAzLjE3MC4xNTMuMjA0OjY0MTY5In0.lPViZzHdj-rV2-JPsv_5EDvyQtNAHaBuFS75NANDMvg";
// const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiQUNDLWZhMDAyZGEyMzE4ZDQ1MTdhYTg4ODk4Y2MwMTg1NGJlIiwiYWNjaWQiOiIxOTdlNjI2OS04OTBhLTQ5NzUtOTA1ZC1jNjQzNjY3YzIyOTciLCJyb2xlIjoiYWNjb3VudCIsImlwIjoiMTAzLjE3MC4xNTMuMjA0OjY0MDA4In0.-k5TU_plgJ2o0F5Ata25A6J-feaYSt2-S9-0VZOjMRc"
// wss://api.fintrabit.com/ws test token
// const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiQUNDLWE3N2Y2MTY3NThjNDRhNTA5ZTI3NGU0MjQwODExMWYzIiwiYWNjaWQiOiJTRVAyNS0xM2M5NjYwZC0zZmI2LTRhOWYtYjI4NS0xMzBlMmQ2MmQwNjAifQ.ercKgPUNpAcUy8tsG_aiDElnNCYk-z3HMxh8ccW8wLY";

//swastiik token
// const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiQUNDLTlmMThjMjNkOTU4ODRmMzE4OTZhMGIwNmVjYmE3NDY2IiwiYWNjaWQiOiJTRVAyNS0xYzdlODRlNS1hNmNmLTQxMzEtYTFkYS1hZDE5Zjc5MmVhMjAifQ.xPUMPaSLH8JQ25IhevETYOnh3zPrh76waUsHe2burYU"
export const initializeSockets = (store: Store) => {
  // const token = getAuthToken(store);
  const state = store.getState() as RootState;
  const token = state.auth.user?.token;

  if (!token) {
    console.error(
      "❌ No auth token found. WebSocket connections will not be initialized."
    );
    return;
  }

  // --- API Client Initialization ---
  if (!API_BASE_URL) {
    console.error(
      "❌ VITE_API_WS_URL is not defined. API WebSocket connection will fail."
    );
  } else if (!apiClient) {
    const apiUrlWithToken = `${API_BASE_URL}?t=${token}`;
    apiClient = new WebSocketClient(apiUrlWithToken, store, setApiStatus);
    console.log("API WebSocket Client Initialized.");
  }

  // --- Stream Client Initialization ---
  if (!STREAM_BASE_URL) {
    console.error(
      "❌ VITE_STREAM_URL is not defined. Stream WebSocket connection will fail."
    );
  } else if (!streamClient) {
    const streamUrlWithToken = `${STREAM_BASE_URL}`;
    streamClient = new WebSocketClient(
      streamUrlWithToken,
      store,
      setStreamStatus
    );

    // NEW: Central message handler using the universal type guard
    streamClient.setMessageHandler((msg: unknown) => {
      // Log all incoming stream messages for debugging
      // if (typeof msg === "object" && msg !== null && "component" in msg) {
      //   console.log(`[Stream] Received: component=${(msg as any).component}, id=${(msg as any).instrument?.id}`);
      // } else {
      //   console.log("[Stream] Received unknown message format:", msg);
      // }

      if (isStreamQuoteMessage(msg)) {
        // It's a quote message, now check which slice should handle it
        const rootState = store.getState() as RootState;
        const isPositionInstrument = rootState.positions.positions.some(
          (pos) => pos.instrument_id === msg.instrument.id
        );

        // Dispatch update for quotes slice (it now handles both watchlist and live cache)
        store.dispatch(
          updateQuoteData({
            instrumentId: msg.instrument.id,
            data: msg.data,
          })
        );
        
        // Check if it's a position instrument and update accordingly
        if (isPositionInstrument) {
          store.dispatch(
            updatePositionQuote({
              instrumentId: msg.instrument.id,
              data: msg.data,
            })
          );
        }
      }
    });

    streamClient.onConnected(() => {
      const rootState = store.getState() as RootState;

      // Re-subscribe for quotes
      const quotes = rootState.quotes.quotes;
      if (quotes.length > 0) {
        console.log(
          `🔄 Re-subscribing to quotes for ${quotes.length} instruments from last session...`
        );
        quotes.forEach((quote) => {
          const message = {
            action: "subscribe",
            payload: [{ id: quote.id, data: ["quotes"] }],
          };
          streamClient.sendStreamMessage(message);
        });
      }

      // Re-subscribe for positions
      const positions = rootState.positions.positions;
      if (positions.length > 0) {
        const uniqueInstrumentIds = Array.from(
          new Set(positions.map((pos) => pos.instrument_id))
        );
        console.log(
          `🔄 Re-subscribing to quotes for ${uniqueInstrumentIds.length} positions...`
        );
        const message = {
          action: "subscribe",
          payload: uniqueInstrumentIds.map((id) => ({ id, data: ["quotes"] })),
        };
        streamClient.sendStreamMessage(message);
      }
    });
    console.log("Stream WebSocket Client Initialized.");
  }
  // --- Event Client Initialization ---
  if (!EVENT_BASE_URL) {
    console.error(
      "❌ WEBSOCKET_EVENT_URL is not defined. Event WebSocket connection will fail."
    );
  } else if (!eventClient) {
    const eventUrlWithToken = `${EVENT_BASE_URL}?t=${token}`;
    eventClient = new WebSocketClient(eventUrlWithToken, store, setEventStatus); 

    const appDispatch = store.dispatch as AppDispatch;

    eventClient.setMessageHandler((msg: unknown) => {
      console.log("🚨 Received EVENT message:", msg);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventData = msg as any;
      
      // Handle all order events
      if (eventData.event === "order" && eventData.order) {
        const payload: ToastyData = {
          instrumentName: eventData.instrument?.name?.toUpperCase() || "UNKNOWN",
          side: eventData.trade?.side || eventData.order?.side || "buy",
          quantity: eventData.trade?.qty || eventData.order?.qty || 0,
          status: eventData.order.status, 
          price: eventData.trade?.price || eventData.order?.price || 0,
        };

        store.dispatch(showToasty(payload));

        setTimeout(() => {
          store.dispatch(hideToasty());
        }, 3000);
      }

      refreshAllHistoryData(appDispatch);
    });

    eventClient.onConnected(() => {
      console.log("🎉 Event WebSocket connected. Ready to receive events.");
    });
    console.log("Event WebSocket Client Initialized.");
  }
};

// NEW: A single function to subscribe to multiple instruments
export const subscribeToInstruments = (instrumentIds: string[]) => {
  if (streamClient) {
    const message = {
      action: "subscribe",
      payload: instrumentIds.map((id) => ({
        id,
        data: ["quotes"],
      })),
    };
    streamClient.sendStreamMessage(message);
    console.log(
      `Subscribed to quotes for ${instrumentIds.length} instruments.`
    );
  } else {
    console.warn("Stream client not ready, cannot subscribe to instruments.");
  }
};


/**
 * Unsubscribe from a list of instrument IDs
 */
export const unsubscribeFromInstruments = (instrumentIds: string[]) => {
  if (streamClient) {
    const message = {
      action: "unsubscribe",
      payload: instrumentIds.map((id) => ({
        id,
        data: ["quotes"],
      })),
    };
    streamClient.sendStreamMessage(message);
    console.log(`❌ Unsubscribed from quotes for ${instrumentIds.length} instruments.`);
  } else {
    console.warn("Stream client not ready, cannot unsubscribe.");
  }
};

/**
 * Reinitialize sockets with new token (e.g., after login or account switch)
 */
export const reinitializeSockets = (store: Store) => {
  console.log("🔄 Reinitializing WebSocket connections...");
  
  // Close existing connections
  if (apiClient) {
    apiClient.close();
  }
  if (streamClient) {
    streamClient.close();
  }
  
  // Reset clients
  apiClient = null as any;
  streamClient = null as any;
  
  // Reinitialize with new token
  initializeSockets(store);
};

export const disconnectSockets = () => {
    console.log("🔌 Disconnecting all sockets...");
    if (apiClient) apiClient.close();
    if (streamClient) streamClient.close();
    if (eventClient) eventClient.close();
    
    apiClient = null as any;
    streamClient = null as any;
    eventClient = null as any;
};

export { apiClient, streamClient, eventClient };

