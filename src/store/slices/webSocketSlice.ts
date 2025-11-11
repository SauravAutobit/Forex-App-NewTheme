import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WebSocketStatus } from "../../services/WebSocketClient";

interface WebSocketState {
  apiStatus: WebSocketStatus;
  streamStatus: WebSocketStatus;
  eventStatus: WebSocketStatus;
}

const initialState: WebSocketState = {
  apiStatus: "disconnected",
  streamStatus: "disconnected",
  eventStatus: "disconnected",
};

const webSocketSlice = createSlice({
  name: "websockets",
  initialState,
  reducers: {
    setApiStatus(state, action: PayloadAction<WebSocketStatus>) {
      state.apiStatus = action.payload;
    },
    setStreamStatus(state, action: PayloadAction<WebSocketStatus>) {
      state.streamStatus = action.payload;
    },
    setEventStatus(state, action: PayloadAction<WebSocketStatus>) {
      state.eventStatus = action.payload;
    },
    // We will add reducers for stream data later, e.g.:
    // streamDataReceived(state, action: PayloadAction<any>) {
    //   // update some other part of your state with the new data
    // }
  },
});

export const { setApiStatus, setStreamStatus, setEventStatus  } = webSocketSlice.actions;
export default webSocketSlice.reducer;
