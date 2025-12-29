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
      contract_size: number;
  static_data: Record<string, string | number>;

}


// ✅ NEW: Type for the incoming stream data payload for better type safety
type StreamDataPayload = {
  ask?: number[];
  askq?: number[];
  bid?: number[];
  bidq?: number[];
  close?: number[];
  high?: number[];
  low?: number[];
  ltp?: number[];
  ltpq?: number[];
  ltpt?: number[];
  open?: number[];
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
                    contract_size: (newInstrument.static_data.contract_size as number) || 100000, 
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

      // 1. Update watchlist if it exists there
      state.quotes = state.quotes.map(quote => {
        if (quote.id !== instrumentId) return quote;
        return {
          ...quote,
          bid: data.bid?.[0] ?? quote.bid,
          ask: data.ask?.[0] ?? quote.ask,
          low: data.low?.[0] ?? quote.low,
          high: data.high?.[0] ?? quote.high,
          close: data.close?.[0] ?? quote.close,
          open: data.open?.[0] ?? quote.open,
          ltp: data.ltp?.[0] ?? quote.ltp,
          timestamp: data.ltpt?.[0] ?? quote.timestamp,
        };
      });

      // 2. Update live cache for general UI consumption (like category view)
      const existingLive = state.liveQuotes[instrumentId];
      state.liveQuotes[instrumentId] = {
        ...(existingLive || {
             id: instrumentId,
             name: "", feeding_name: "", trading_name: "",
             bid: 0, ask: 0, low: 0, high: 0, close: 0, open: 0, timestamp: 0, ltp: 0,
             contract_size: 100000, static_data: {}
        }),
        bid: data.bid?.[0] ?? (existingLive?.bid || 0),
        ask: data.ask?.[0] ?? (existingLive?.ask || 0),
        low: data.low?.[0] ?? (existingLive?.low || 0),
        high: data.high?.[0] ?? (existingLive?.high || 0),
        close: data.close?.[0] ?? (existingLive?.close || 0),
        open: data.open?.[0] ?? (existingLive?.open || 0),
        ltp: data.ltp?.[0] ?? (existingLive?.ltp || 0),
        timestamp: data.ltpt?.[0] ?? (existingLive?.timestamp || 0),
      };
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

