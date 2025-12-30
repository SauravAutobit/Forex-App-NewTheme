// src/store/slices/notificationSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the data needed for the Toasty component
export interface ToastyData {
  instrumentName: string; // e.g., "audnzd"
  side: string; // e.g., "buy"
  quantity: number; // e.g., 10
  status: string; // e.g., "filled"
  price: number; // e.g., 1.13442
}

interface NotificationState {
  isVisible: boolean;
  data: ToastyData | null;
}

const initialState: NotificationState = {
  isVisible: false,
  data: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showToasty: (state, action: PayloadAction<ToastyData>) => {
      // Set new data and show
      state.data = action.payload;
      state.isVisible = true;
    },
    hideToasty: (state) => {
      // Hide and clear data after animation
      state.isVisible = false;
      state.data = null;
    },
  },
});

export const { showToasty, hideToasty } = notificationSlice.actions;

export default notificationSlice.reducer;