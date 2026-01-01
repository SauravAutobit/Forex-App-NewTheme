// src/store/slices/notificationSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the data needed for the Toasty component
export interface ToastyData {
  type?: 'trade' | 'undo'; // Default to 'trade' if undefined for backward compatibility
  // Trade specific
  instrumentName?: string; 
  side?: string; 
  quantity?: number; 
  status?: string; 
  price?: number; 
  // Undo specific
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  undoPayload?: any; 
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
      state.data = { ...action.payload, type: action.payload.type || 'trade' };
      state.isVisible = true;
    },
    hideToasty: (state) => {
      // Only hide, preserve data for exit animation
      state.isVisible = false;
    },
  },
});

export const { showToasty, hideToasty } = notificationSlice.actions;

export default notificationSlice.reducer;