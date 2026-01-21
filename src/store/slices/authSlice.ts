import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { apiClient, disconnectSockets } from "../../services/socketService";
import { getSessionIdFromToken } from "../../utils/tokenUtils";
import { showToasty } from "./notificationSlice";
import { parseErrorMessage } from "../../utils/errorUtils";

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
      const response = await fetch("https://api-test.swtik.com/api/account/login", { 
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

// Async thunk for robust logout
export const logoutCurrentAccount = createAsyncThunk(
  "auth/logoutCurrentAccount",
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state: any = getState();
      const token = state.auth.user?.token;
      
      if (!token) {
         // Even if no token, perform client-side logout cleanup
         dispatch(authSlice.actions.logout());
         disconnectSockets();
         return null;
      }

      const sessionId = getSessionIdFromToken(token);

      if (apiClient && sessionId) {
         // Attempt server-side logout
         try {
             await apiClient.send("account/logout", {
                session_id: sessionId,
              });
              dispatch(
                showToasty({
                  title: "Logout Successful",
                  message: "Logged out successfully",
                  type: "success",
                })
              );
         } catch (apiError) {
             console.warn("API logout failed, proceeding with client logout:", apiError);
         }
      }
      
      // Perform client-side cleanup (removes current user, switches to next)
      dispatch(authSlice.actions.logout());
      
      // Get new state to see if there is an active user
      const updatedState: any = getState();
      const newUser = updatedState.auth.user;

      if (!newUser) {
          // No users left, disconnect everything
          disconnectSockets();
          return null; // Signals complete logout
      } else {
          // User switched. We need to re-initialize sockets.
          // Since we can't easily access 'store' here to pass to reinitializeSockets, 
          // we will handle this in the UI or let the caller know.
          // Or better: disconnect current sockets, and let the caller re-init?
          // Actually, if we just return `newUser`, the Sidebar can handle it.
          // BUT `disconnectSockets()` clears the clients. 
          // We SHOULD disconnect old sockets first.
          disconnectSockets();
          return newUser;
      }

    } catch (error) {
      dispatch(
        showToasty({
          title: "Logout Error",
          message: parseErrorMessage(error),
          type: "error",
        })
      );
      return rejectWithValue(parseErrorMessage(error));
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
      
      // Switch to next available account
      if (state.accounts.length > 0) {
          state.user = state.accounts[state.accounts.length - 1]; // Use last added as typical behavior, or index 0
      } else {
          state.user = null;
      }
      
      // Update localStorage
      localStorage.setItem("accounts", JSON.stringify(state.accounts));
      if (state.user) {
        localStorage.setItem("activeAccount", JSON.stringify(state.user));
        // Important: If we switch user, we might need to reload or re-init sockets. 
        // The UI/App.tsx should handle the re-init based on user change.
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
    },
    clearError: (state) => {
        state.error = null;
        state.status = "idle";
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

export const { logout, switchAccount, clearError } = authSlice.actions;
export default authSlice.reducer;
