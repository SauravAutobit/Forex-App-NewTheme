// src/services/WebSocketClient.ts

// FIX: Use 'import type' for the Store type.
import type { Store } from '@reduxjs/toolkit';

// This import is now used correctly.
// import { setApiStatus, setStreamStatus } from '../store/slices/webSocketSlice';

export type WebSocketStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

// FIX: Define a generic response payload to avoid using 'any'
export interface ResponsePayload<T = unknown> {
// / eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: T;
  data?: T;
  message: string;
    status: 'success' | 'failed' | 'aborted'; // ✅ Added 'aborted' status
}

interface PendingRequest<T> {
  // FIX: Make the resolve function type-safe
  resolve: (value: ResponsePayload<T>) => void;
  reject: (reason?: ResponsePayload<T>) => void;
  // FIX: Use ReturnType<typeof setTimeout> which works in all environments (browser/node)
  timer: ReturnType<typeof setTimeout>;
      onAbort?: () => void;

}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  // FIX: Make the Map type-safe with <unknown> to handle various response types.
  private pendingRequests = new Map<string, PendingRequest<unknown>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 3000;
  private status: WebSocketStatus = 'disconnected';
  private store: Store;
  private statusUpdater: (status: WebSocketStatus) => { type: string; payload: WebSocketStatus };
  private pingIntervalId: ReturnType<typeof setInterval> | null = null; 
    private messageHandler: ((msg: unknown) => void) | null = null;
  // ✅ ADD THIS NEW PROPERTY
  private onConnectCallbacks: (() => void)[] = [];
  private shouldReconnect = true; // ✅ Control flag for auto-reconnection

  constructor(
    url: string,
    store: Store,
    statusUpdater: (status: WebSocketStatus) => { type: string; payload: WebSocketStatus }
  ) {
    this.url = url;
    this.store = store;
    this.statusUpdater = statusUpdater;
    this.connect();
  }

  // ... (setStatus, connect methods are the same as before)
  private setStatus(newStatus: WebSocketStatus) {
    if (this.status === newStatus) return;
    this.status = newStatus;
    // console.log(`[WebSocket] Status for ${this.url}: ${newStatus.toUpperCase()}`);
    console.log(`[WebSocket] Status for ${this.url.split('?')[0]} is now: ${newStatus.toUpperCase()}`);

    this.store.dispatch(this.statusUpdater(newStatus));
  }
  
  public connect() {
    this.shouldReconnect = true; // ✅ Allow reconnection attempts
    this.setStatus('connecting');
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.warn("[WebSocket] Already connected or connecting.");
      return;
    }
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.setStatus('connected');
      this.reconnectAttempts = 0;
      this.startPinging(); 
       // Run any pending callbacks now that we are connected
      console.log(`[WebSocket] Connection to ${this.url.split('?')[0]} established. Executing queued tasks.`);
      this.onConnectCallbacks.forEach(cb => cb());
      this.onConnectCallbacks = []; // Clear the queue after running
    };
    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
    
        if (msg.rid && this.pendingRequests.has(msg.rid)) {
          
        // ✅ Log the raw response from the server
    console.log("📨 Received WebSocket message:", msg);
          const pending = this.pendingRequests.get(msg.rid)!;
          clearTimeout(pending.timer);
          if (msg.payload?.status === 'failed') {
            pending.reject(msg.payload);
          } else {
            pending.resolve(msg.payload);
          }
          this.pendingRequests.delete(msg.rid);
        }  else {
          // This is the new, crucial part.
          // If there's no RID, it's an unsolicited message (e.g., a stream update).
          // We pass it to the registered handler.
          if (this.messageHandler) {
            this.messageHandler(msg);
          } else {
          console.log("📩 Unsolicited message received:", msg);
        }
      } } catch (err) {
        console.error("⚠️ Invalid WS message received:", event.data, err);
      }
    };
    this.ws.onclose = () => {
      this.setStatus('disconnected');
       this.stopPinging(); 
      this.pendingRequests.forEach((pending, rid) => {
        clearTimeout(pending.timer);
        pending.reject({
          status: 'failed', message: "WebSocket closed before response was received.",
          payload: undefined
        });
        this.pendingRequests.delete(rid);
      });
      
      // ✅ Check shouldReconnect before attempting to reconnect
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.setStatus('reconnecting');
        setTimeout(() => this.connect(), this.reconnectInterval);
      } else if (!this.shouldReconnect) {
        console.log(`[WebSocket] Connection closed explicitly for ${this.url}. No reconnect attempt.`);
      } else {
        console.error(`[WebSocket] Max reconnect attempts reached for ${this.url}.`);
      }
    };
    this.ws.onerror = (err) => {
      console.error(`⚠️ WebSocket error for ${this.url}:`, err);
      // this.ws?.close(); // Let onclose handle it, or close if not closed
    };
  }

  // ... (send, sendStreamMessage, setMessageHandler, startPinging, stopPinging methods remain the same) 
  
  /**
   * Sends a message and returns a Promise that resolves with the response.
   * @param target The API endpoint/target.
   * @param payload The data to send.
   * @param timeout Timeout in seconds.
   * @param signal The AbortSignal for cancellation. ✅ NEW PARAMETER
   */
  public send<T>(target: string, payload: object, timeout = 30, signal?: AbortSignal): Promise<ResponsePayload<T>> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject({ message: "WebSocket is not connected.", status: "failed" });
      }
      const rid = crypto.randomUUID();
       const message = { rid, target, payload };

     // ✅ Cancellation Cleanup Function
      const cleanup = () => {
        clearTimeout(timer);
        this.pendingRequests.delete(rid);
        signal?.removeEventListener('abort', onAbort); // Remove listener on completion/rejection
      };

      // ✅ Abort Handler
      const onAbort = () => {
        cleanup();
        reject({ message: "Request aborted.", status: "aborted" }); // Reject with an 'aborted' status
      };

      // If a signal is provided, set up the listener
      if (signal) {
        if (signal.aborted) {
          return reject({ message: "Request aborted.", status: "aborted" });
        }
        signal.addEventListener('abort', onAbort);
      }
     
      console.log("📤 Sending WebSocket message:", message);

        // Set the timeout timer
      const timer = setTimeout(() => {
        cleanup(); // Use the cleanup function
        reject({ message: `Request timed out after ${timeout} seconds.`, status: "failed" });
      }, timeout * 1000);
     
      // Store the request
      this.pendingRequests.set(rid, { resolve, reject, timer, onAbort } as PendingRequest<unknown>);
      this.ws.send(JSON.stringify(message));
    });
  }

 public sendStreamMessage(message: object): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("❌ Stream WebSocket is not connected. Cannot send message:", message);
      return;
    }
    console.log("📤 Sending Stream Message:", message);
    this.ws.send(JSON.stringify(message));
  }

  public setMessageHandler(handler: (msg: unknown) => void) {
    this.messageHandler = handler;
  }

    private startPinging() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
    }
    this.pingIntervalId = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const message = {
          rid: crypto.randomUUID(),
          target: "ping",
          payload: {}
        };
        console.log("🏓 Pinging the server:", message);
        this.ws.send(JSON.stringify(message));
      }
    }, 20000); 
  }

  private stopPinging() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  /**
   * Close the WebSocket connection
   */
  public close(): void {
    this.shouldReconnect = false; // ✅ Disable auto-reconnection
    if (this.ws) {
      this.stopPinging();
      this.ws.close();
      this.ws = null;
    }
  }

   // ✅ ADD THIS ENTIRE NEW METHOD
  /**
   * Queues a callback to be executed once the WebSocket connection is established.
   * If the connection is already open, the callback is executed immediately.
   * @param callback The function to execute upon connection.
   */
  public onConnected(callback: () => void): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // If we're already connected, run it straight away.
      callback();
    } else {
      // Otherwise, add it to the queue to run when onopen fires.
      this.onConnectCallbacks.push(callback);
    }
  }
}


