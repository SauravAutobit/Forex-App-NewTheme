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
};



// const unsubscribeFromInstrument = (instrumentId: string) => {
//   if (streamClient) {
//     const message = {
//       action: "unsubscribe",
//       payload: [{
//         id: instrumentId,
//         data: ["quotes"]
//       }]
//     };
//     streamClient.sendStreamMessage(message);
//     console.log(`Unsubscribed from ${instrumentId}`);
//   }
// };



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
     // ✅ REWRITTEN REDUCER
    updateQuoteData: (state, action: PayloadAction<{ instrumentId: string; data: StreamDataPayload }>) => {
      const { instrumentId, data } = action.payload;
      // Using .map() creates a new array, which guarantees a re-render.
      state.quotes = state.quotes.map(quote => {
        // If this isn't the quote we're looking for, return it as is
        if (quote.id !== instrumentId) {
          return quote;
        }

        // Otherwise, return a new object with the updated data
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

