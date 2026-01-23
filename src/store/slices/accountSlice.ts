// src/store/slices/accountSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/socketService';
import type { RootState } from '../store';

// Define the shape of the account data from the API
export interface Account {
  id: string;
  account_id: string;
  balance: number;
  currency: string;
  // Add other properties if needed
}

interface AccountState {
  account: Account | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AccountState = {
  account: null,
  status: 'idle',
  error: null,
};

// Async thunk to fetch account data
export const fetchAccountBalance = createAsyncThunk(
  'account/fetchAccountBalance',
  async (_, { rejectWithValue }) => {
    try {
      const query = "fintrabit.accounts";
      const response = await apiClient.send<Account[]>("query", { query });

      if (response.status === 'success' && response.data && response.data.length > 0) {
        return response.data[0]; // Assuming there is only one account per user
      } else {
        return rejectWithValue(response.message || 'Failed to fetch account balance');
      }
    } catch (error) {
      const errorMessage = (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    resetAccount: (state) => {
      state.account = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountBalance.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAccountBalance.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'succeeded';
        state.account = action.payload;
      })
      .addCase(fetchAccountBalance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetAccount } = accountSlice.actions;
export const selectAccount = (state: RootState) => state.account.account;
export default accountSlice.reducer;