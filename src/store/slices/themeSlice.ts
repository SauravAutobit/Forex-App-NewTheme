import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    // Read from localStorage on initial load
    mode: localStorage.getItem('theme') || 'dark',
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      // We'll handle saving to localStorage in a middleware
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;