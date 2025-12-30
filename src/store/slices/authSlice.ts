import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

// Define the shape of the user/account object
export interface User {
  username: string;
  token: string;
  // Add other user details if returned by API
  role?: string;
  sessionId?: string;
}

export interface AuthState {
  user: User | null; // The currently active user
  accounts: User[];  // List of all logged-in accounts
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Load initial state from localStorage
const storedAccounts = localStorage.getItem("accounts");
const storedActiveAccount = localStorage.getItem("activeAccount");

const initialState: AuthState = {
  user: storedActiveAccount ? JSON.parse(storedActiveAccount) : null,
  accounts: storedAccounts ? JSON.parse(storedAccounts) : [],
  status: "idle",
  error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API URL. Assuming standard endpoint for now.
      // Using the IP found in constants or a placeholder.
      // const API_URL = "http://192.46.213.87:5001/login"; 
      
      const response = await fetch("http://192.46.213.87:5858/api/account/login", { // Trying port 8000 commonly used with python/fastapi/django
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.status === "success") {
        return {
          username: credentials.username,
          token: data.data.token,
          // Extract role/session if needed
        };
      } else {
        return rejectWithValue(data.message || "Login failed");
      }
    } catch (error) {
      return rejectWithValue("Network error. Please check your connection.");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Remove current user from accounts list
      if (state.user) {
        state.accounts = state.accounts.filter(a => a.username !== state.user?.username);
      }
      state.user = state.accounts.length > 0 ? state.accounts[0] : null;
      
      // Update localStorage
      localStorage.setItem("accounts", JSON.stringify(state.accounts));
      if (state.user) {
        localStorage.setItem("activeAccount", JSON.stringify(state.user));
      } else {
        localStorage.removeItem("activeAccount");
      }
    },
    switchAccount: (state, action: PayloadAction<string>) => {
      // Switch to account with username
      const account = state.accounts.find((a) => a.username === action.payload);
      if (account) {
        state.user = account;
        localStorage.setItem("activeAccount", JSON.stringify(account));
      }
    },
    // Action to handle successful login from the modal for an additional account
    addAccount: (state, action: PayloadAction<User>) => {
        const newUser = action.payload;
        const existingIndex = state.accounts.findIndex(a => a.username === newUser.username);
        if (existingIndex >= 0) {
            state.accounts[existingIndex] = newUser;
        } else {
            state.accounts.push(newUser);
        }
        localStorage.setItem("accounts", JSON.stringify(state.accounts));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newUser = action.payload;
        
        // Add or update in accounts list
        const existingIndex = state.accounts.findIndex(a => a.username === newUser.username);
        if (existingIndex >= 0) {
            state.accounts[existingIndex] = newUser;
        } else {
            state.accounts.push(newUser);
        }

        // Set as active user
        state.user = newUser;

        // Persist
        localStorage.setItem("accounts", JSON.stringify(state.accounts));
        localStorage.setItem("activeAccount", JSON.stringify(newUser));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout, switchAccount } = authSlice.actions;
export default authSlice.reducer;
