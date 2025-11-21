import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import chartReducer from "./slices/chartSlice";
import categoriesReducer from "./slices/categoriesSlice";
import webSocketReducer from "./slices/webSocketSlice";
import loadingReducer from "./slices/loadingSlice";
import themeReducer, { toggleTheme } from "./slices/themeSlice";

const rootReducer = {
  websockets: webSocketReducer,
  chart: chartReducer,
  categories: categoriesReducer,
  loading: loadingReducer,
  theme: themeReducer,
};

// Derive RootState from the reducer map BEFORE creating the listener middleware
export type RootState = {
  [K in keyof typeof rootReducer]: ReturnType<(typeof rootReducer)[K]>;
};

// Create the listener middleware typed with RootState (omit second generic)
// — this avoids the "unknown does not satisfy Dispatch<Action>" error.
const listenerMiddleware = createListenerMiddleware<RootState>();

// Listen for toggleTheme and persist the updated theme to localStorage.
// Use `_action` to avoid "declared but never used" warning.
listenerMiddleware.startListening({
  actionCreator: toggleTheme,
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState(); // typed as RootState now
    const mode = state.theme?.mode;
    if (typeof mode === "string") {
      try {
        localStorage.setItem("theme", mode);
      } catch {
        /* ignore storage errors */
      }
    }
  },
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

// Export concrete types derived from the store
export type AppDispatch = typeof store.dispatch;
