// src/store/slices/quotesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Instrument } from './instrumentsSlice';
import { subscribeToInstruments } from '../../services/socketService'; 

export interface QuoteData {
  id: string; // The instrument ID
  name: string;
  feeding_name: string;
  trading_name: string;
  bid: number;
  ask: number;
  low: number;
  high: number;
  close: number;
  open: number;
  timestamp: number;
  ltp: number; // ✅ Add Last Traded Price
  contract_size?: number;
  contractsize?: number;
  static_data: Record<string, string | number>;

}


// ✅ NEW: Type for the incoming stream data payload for better type safety
type StreamDataPayload = {
  ask?: number[];
  askq?: number[];
  bid?: number[];
  bidq?: number[];
  // New OHLC format
  c?: number | number[]; // close
  h?: number | number[]; // high
  l?: number | number[]; // low
  o?: number | number[]; // open
  // Old format (backward compatibility)
  close?: number[];
  high?: number[];
  low?: number[];
  open?: number[];
  ltp?: number[];
  ltpq?: number[];
  ltpt?: number[];
};

interface QuotesState {
  quotes: QuoteData[];
  liveQuotes: Record<string, QuoteData>; // ✅ Store live data for any instrument
}

const QUOTES_STORAGE_KEY = 'subscribedQuotes';

const loadQuotesFromStorage = (): QuoteData[] => {
  try {
    const storedQuotes = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (storedQuotes) {
      return JSON.parse(storedQuotes);
    }
  } catch (e) {
    console.error("Failed to parse quotes from localStorage", e);
  }
  return [];
};

const initialState: QuotesState = {
  quotes: loadQuotesFromStorage(),
  liveQuotes: {},
};

export const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
  addInstrumentToQuotes: (state, action: PayloadAction<Instrument>) => {
      const newInstrument = action.payload;
      const isAlreadyAdded = state.quotes.some(q => q.id === newInstrument.id);
      if (!isAlreadyAdded) {
        const newQuote: QuoteData = {
          id: newInstrument.id,
          name: newInstrument.name,
          feeding_name: newInstrument.feeding_name,
          trading_name: newInstrument.trading_name,
          bid: 0, ask: 0, low: 0, high: 0, close: 0, open: 0, timestamp: 0, ltp: 0,
          contract_size: (newInstrument.static_data.contractsize || newInstrument.static_data.contract_size) as number || 100000, 
          static_data: newInstrument.static_data,
        };
        state.quotes.push(newQuote);
        subscribeToInstruments([newInstrument.id]); 
        localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(state.quotes));
      }
    },
    // ✅ REWRITTEN REDUCER to update both watchlist and live cache
    updateQuoteData: (state, action: PayloadAction<{ instrumentId: string; data: StreamDataPayload }>) => {
      const { instrumentId, data } = action.payload;

      // Helper to safely get value (whether it's number, array, or undefined)
      const getValue = (val: number | number[] | undefined): number | undefined => {
        if (typeof val === 'number') return val;
        if (Array.isArray(val) && val.length > 0) return val[0];
        return undefined;
      };

      // Debug logging
      const c = getValue(data.c);
      const h = getValue(data.h);
      const l = getValue(data.l);
      const o = getValue(data.o);
      
      // console.log('[QuotesSlice] Received data for', instrumentId, ':', data);
      // console.log('[QuotesSlice] OHLC safe values - c:', c, 'h:', h, 'l:', l, 'o:', o);

      // 1. Update watchlist if it exists there
      state.quotes = state.quotes.map(quote => {
        if (quote.id !== instrumentId) return quote;
        return {
          ...quote,
          bid: getValue(data.bid) ?? quote.bid,
          ask: getValue(data.ask) ?? quote.ask,
          low: l ?? getValue(data.low) ?? quote.low,
          high: h ?? getValue(data.high) ?? quote.high,
          close: c ?? getValue(data.close) ?? quote.close,
          open: o ?? getValue(data.open) ?? quote.open,
          ltp: getValue(data.ltp) ?? quote.ltp,
          timestamp: getValue(data.ltpt) ?? quote.timestamp,
        };
      });

      // 2. Update live cache for general UI consumption (like category view)
      const existingLive = state.liveQuotes[instrumentId];
      if (!state.liveQuotes[instrumentId]) {
        // console.log(`[QuotesSlice] Initializing liveQuote for ${instrumentId}`);
      }
      state.liveQuotes[instrumentId] = {
        ...(existingLive || {
             id: instrumentId,
             name: "", feeding_name: "", trading_name: "",
             bid: 0, ask: 0, low: 0, high: 0, close: 0, open: 0, timestamp: 0, ltp: 0,
             contract_size: 100000, static_data: {}
        }),
        bid: getValue(data.bid) ?? (existingLive?.bid || 0),
        ask: getValue(data.ask) ?? (existingLive?.ask || 0),
        low: l ?? getValue(data.low) ?? (existingLive?.low || 0),
        high: h ?? getValue(data.high) ?? (existingLive?.high || 0),
        close: c ?? getValue(data.close) ?? (existingLive?.close || 0),
        open: o ?? getValue(data.open) ?? (existingLive?.open || 0),
        ltp: getValue(data.ltp) ?? (existingLive?.ltp || 0),
        timestamp: getValue(data.ltpt) ?? (existingLive?.timestamp || 0),
      };

      // console.log('[QuotesSlice] Updated liveQuote for', instrumentId, ':', state.liveQuotes[instrumentId]);
    },  

    removeInstrumentsFromQuotes: (state, action: PayloadAction<string[]>) => {
      const idsToRemove = new Set(action.payload);

      // ℹ️ SERVER CALL COMMENTED OUT AS REQUESTED
      // action.payload.forEach(id => unsubscribeFromInstrument(id));

      // Filter out the quotes that are marked for deletion
      state.quotes = state.quotes.filter(quote => !idsToRemove.has(quote.id));
      
      // Update session storage to persist the changes
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(state.quotes));
    },
    reorderQuotes: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const { activeId, overId } = action.payload;
      const oldIndex = state.quotes.findIndex((q) => q.id === activeId);
      const newIndex = state.quotes.findIndex((q) => q.id === overId);
//object save and sme coditoon overrideoverride.

      if (oldIndex !== -1 && newIndex !== -1) {
        const [movedItem] = state.quotes.splice(oldIndex, 1);
        state.quotes.splice(newIndex, 0, movedItem);
        // Persist the new order to localStorage
        localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(state.quotes));
      }
    },
  },
});


export const { addInstrumentToQuotes, updateQuoteData, reorderQuotes, removeInstrumentsFromQuotes } = quotesSlice.actions;


export const selectQuotes = (state: RootState) => state.quotes.quotes;
export default quotesSlice.reducer;

