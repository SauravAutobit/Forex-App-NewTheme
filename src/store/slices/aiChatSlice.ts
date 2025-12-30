
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";
import type { RootState } from "../store";
import type { ResponsePayload } from "../../services/WebSocketClient";

export interface ChatMessage {
  type: "user" | "ai" | "ai_loading";
  text: string;
  time: number; // 👈 Add time for sorting history
}

interface AIChatState {
  status: "idle" | "loading" | "succeeded" | "failed" | "stopped" | "history_loading"; // 👈 Add history_loading
  messages: ChatMessage[];
  error: string | null;
}

const initialState: AIChatState = {
  // Add a welcome message only if history is empty
  messages: [{ type: "ai", text: "Hello! 👋 How can I help you today?", time: Date.now() }],
  status: "idle",
  error: null,
};

let controller: AbortController | null = null;

type AIData = {
  answer: string;
};

// Response data structure for the history API
interface HistoryItem {
  role: "user" | "assistant";
  content: string;
  time: number;
}
// The response will have a 'data' array containing HistoryItem[]
type HistoryResponsePayload = { data: HistoryItem[] };


function hasAnswer(resp: unknown): resp is { data: { answer: string } } {
  if (typeof resp !== "object" || resp === null) return false;
  const r = resp as Record<string, unknown>;
  if (!("data" in r)) return false;
  const d = r.data;
  if (typeof d !== "object" || d === null) return false;
  const dataObj = d as Record<string, unknown>;
  return "answer" in dataObj && typeof dataObj.answer === "string";
}

// 🆕 NEW THUNK FOR HISTORY - FIXED TO USE apiClient.send
export const fetchChatHistory = createAsyncThunk<
  ChatMessage[], // Return type is an array of ChatMessage
  void,
  { rejectValue: string }
>("aiChat/fetchHistory", async (_, { rejectWithValue }) => {
  try {
    // 1. Use apiClient.send and match the target/payload structure from the JSON provided
    const queryPayload = {
      query: "fintrabit.chat_history._desc(time)[0:30]"
    };

    const response = await apiClient.send<HistoryResponsePayload>(
      "query", // 👈 Use 'query' as the target string
      queryPayload, // 👈 Use the payload structure with the 'query' key
30 // Timeout, assuming 30s is fine
    );

    // 2. Check for success and that the response data is an array
    if (response.status === "success" && Array.isArray(response.data)) {
      // Convert API response format to ChatMessage format
      const historyMessages: ChatMessage[] = response.data.map((item) => ({
        type: item.role === "user" ? "user" : "ai",
        text: item.content,
        time: item.time,
      }));
     
      // Sort ascending by time (oldest first) before returning
      historyMessages.sort((a, b) => a.time - b.time);

      return historyMessages;
    }

    return rejectWithValue(
      response.message ?? "Failed to fetch chat history."
    );
  } catch (err) {
    const errorResponse = err as ResponsePayload<unknown>;
    const errorMessage =
      errorResponse?.message ?? (err as Error)?.message ?? "An unknown error occurred";
    return rejectWithValue(errorMessage);
  }
});

// ... (sendPromptToAI, stopAIChat, and aiChatSlice definition remains the same)

export const sendPromptToAI = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "aiChat/sendPrompt",
  async (prompt: string, { rejectWithValue, dispatch }) => {
    try {
      // 1. User message shows immediately
      // 👈 Use a current timestamp
      dispatch(addMessage({ type: "user", text: prompt, time: Date.now() }));

      // 2. Create the AbortController for the new request
      controller = new AbortController();
      const { signal: abortSignal } = controller;

      // 3. Pass the signal to the updated apiClient.send method
      const response = await apiClient.send<AIData>(
        "account/ai/prompt",
        { prompt },
        30,
        abortSignal
      );

      if (abortSignal.aborted) {
        return rejectWithValue("Request was stopped by the user.");
      }

      // 4. Check for success and answer
      if (response.status === "success" && hasAnswer(response)) {
        return response.data.answer;
      }

      return rejectWithValue(
        response.message ?? "Failed to get a response from the AI."
      );
    } catch (err) {
      const errorResponse = err as ResponsePayload<unknown>;

      if (errorResponse?.status === "aborted") {
        return rejectWithValue("Request was stopped by the user.");
      }

      const errorMessage =
        errorResponse?.message ??
        (err as Error)?.message ??
        "An unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

export const stopAIChat = createAsyncThunk<void, void, { state: RootState }>(
  "aiChat/stopChat",
  (_, { dispatch, getState }) => {
    const { aiChat } = getState();
    if (aiChat.status === "loading" && controller) {
      controller.abort();
      dispatch(markChatAsStopped());
    }
  }
);

const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    markChatAsStopped: (state) => {
      state.status = "stopped";
      state.error = null;
    },
    commitFinalMessage: (state, action: PayloadAction<string>) => {
      // 1. Remove the temporary 'ai_loading' message
      state.messages = state.messages.filter(
        (msg) => msg.type !== "ai_loading"
      );
      // 2. Add the final 'ai' message with a timestamp
      state.messages.push({ type: "ai", text: action.payload, time: Date.now() });
      // 3. Set the status to succeeded
      state.status = "succeeded";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // History Fetch Cases
      .addCase(fetchChatHistory.pending, (state) => {
        state.status = "history_loading";
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        // 1. Keep the initial welcome message
        const initialMessage = state.messages.find(m => m.text.includes("Hello!") && m.type === "ai");
       
        // 2. Clear old messages and load history, then re-add the welcome message if it was present
        state.messages = [];
        state.messages.push(...action.payload);
       
        if (initialMessage && action.payload.length === 0) {
            state.messages.unshift(initialMessage);
        }
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message ?? "Failed to load chat history.";
        // Optionally add an error message to chat
        state.messages.push({ type: "ai", text: `⚠️ Failed to load history: ${state.error}`, time: Date.now() });
      })
      // Send Prompt Cases (remain the same)
      .addCase(sendPromptToAI.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        sendPromptToAI.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.status = "loading";
          // 👈 Add a current timestamp to the ai_loading message
          state.messages.push({ type: "ai_loading", text: action.payload, time: Date.now() });
        }
      )
      .addCase(sendPromptToAI.rejected, (state, action) => {
        const errorText =
          action.payload ?? action.error?.message ?? "Unknown error";

        state.messages = state.messages.filter(
          (msg) => msg.type !== "ai_loading"
        );

        if (errorText.includes("Request was stopped by the user.")) {
          if (state.status !== "stopped") {
            state.status = "succeeded";
            state.error = null;
            state.messages.push({
              type: "ai",
              text: `🚫 Request stopped.`,
              time: Date.now(), // 👈 Use a timestamp
            });
          }
        } else {
          state.status = "failed";
          state.error = errorText;
          state.messages.push({ type: "ai", text: `⚠️ Error: ${errorText}`, time: Date.now() }); // 👈 Use a timestamp
        }
      });
  },
});

export const { addMessage, markChatAsStopped, commitFinalMessage } =
  aiChatSlice.actions;
export default aiChatSlice.reducer;