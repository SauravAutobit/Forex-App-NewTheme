import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { apiClient, disconnectSockets } from "../../services/socketService";
import { getSessionIdFromToken } from "../../utils/tokenUtils";
import { showToasty } from "./notificationSlice";
import { parseErrorMessage } from "../../utils/errorUtils";
import { clearDomainKey } from "../../utils/constants/domainConfig";

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
  hasSeenHistoryTutorial: boolean;
  loginCount: number | null;
}

// Load initial state from localStorage
const storedAccounts = localStorage.getItem("accounts");
const storedActiveAccount = localStorage.getItem("activeAccount");
const storedHasSeenTutorial = localStorage.getItem("hasSeenHistoryTutorial") === "true";

const initialState: AuthState = {
  user: storedActiveAccount ? JSON.parse(storedActiveAccount) : null,
  accounts: storedAccounts ? JSON.parse(storedAccounts) : [],
  status: storedActiveAccount ? "succeeded" : "idle",
  error: null,
  hasSeenHistoryTutorial: storedHasSeenTutorial,
  loginCount: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { username: string; password: string; domainKey?: string | null },
    { rejectWithValue },
  ) => {
    try {
      const { domainKey } = credentials;
      if (!domainKey) {
        return rejectWithValue("Please select a server/domain.");
      }

      // Construct baseUrl based on domainKey following the user's pattern
      // Pattern: api-{domainKey}.swtik.com
      const baseUrl = `https://api-${domainKey}.swtik.com`;

      const response = await fetch(`${baseUrl}/api/account/login`, {
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

// Async thunk to fetch login count (session count)
export const fetchLoginCount = createAsyncThunk(
  "auth/fetchLoginCount",
  async (accountId: string, { rejectWithValue }) => {
    try {
      const query = `fintrabit.accounts.sessions[account_id="${accountId}"]._count`;
      const response = await apiClient.send<number>("query", { query });

      if (response.status === "success") {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Failed to fetch login count");
      }
    } catch (error) {
      return rejectWithValue("Error fetching session count");
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
        clearDomainKey(state.user.username);
        state.accounts = state.accounts.filter(a => a.username !== state.user?.username);
      }
      
      state.status = "idle";
      
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
        // THE UI handles the reload if needed or Sidebar handles redirect.
      } else {
        localStorage.removeItem("activeAccount");
        localStorage.removeItem("hasSeenHistoryTutorial");
        state.hasSeenHistoryTutorial = false;
      }
    },
    setHasSeenHistoryTutorial: (state, action: PayloadAction<boolean>) => {
      state.hasSeenHistoryTutorial = action.payload;
      localStorage.setItem("hasSeenHistoryTutorial", String(action.payload));
    },
    switchAccount: (state, action: PayloadAction<string>) => {
      // Switch to account with username
      const account = state.accounts.find((a) => a.username === action.payload);
      if (account) {
        state.user = account;
        localStorage.setItem("activeAccount", JSON.stringify(account));
        // Trigger reload to pick up new user's domain config from app.constants
        window.location.reload();
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

        // SHOW SUCCESS TOASTY
        // We can't dispatch here easily without a middleware, but extraReducers 
        // are meant to be pure state updates. 
        // However, we can handle this in the Login component after dispatch(loginUser).
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchLoginCount.fulfilled, (state, action) => {
        state.loginCount = action.payload ?? null;
      });
  },
});

export const { logout, switchAccount, clearError, setHasSeenHistoryTutorial } = authSlice.actions;
export default authSlice.reducer;
