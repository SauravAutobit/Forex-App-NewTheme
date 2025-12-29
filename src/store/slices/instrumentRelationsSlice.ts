import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";
import { hideLoader, showLoader } from "./loadingSlice";

export interface InstrumentRelation {
  id: string;
  instrument_id: string;
  category_id: string;
  history_interval: number;
}

interface RelationsState {
  data: InstrumentRelation[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: RelationsState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchInstrumentRelations = createAsyncThunk(
  "instrumentRelations/fetchAll",
  async (_, { dispatch, rejectWithValue }) => {
    try {
           dispatch(showLoader());
      const response = await apiClient.send("fetch", {
        query: "fintrabit.instrument_dinamic_categories_relation",
      });

      // console.log("dinamic id history",response)
      if (response.status === "success") {
        return response.data as InstrumentRelation[];
      }
      return rejectWithValue(response.message || "Failed to fetch relations.");
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("An unknown error occurred");
    }
      finally {
      dispatch(hideLoader());
    }
  }
);

const instrumentRelationsSlice = createSlice({
  name: "instrumentRelations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstrumentRelations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInstrumentRelations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchInstrumentRelations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default instrumentRelationsSlice.reducer;