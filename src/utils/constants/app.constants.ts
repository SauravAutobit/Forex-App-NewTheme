
import { getDomainConfig } from "./domainConfig";

const config = getDomainConfig();

export const WEBSOCKET_API_URL = config ? `wss://${config.api}/ws` : "";
export const WEBSOCKET_STREAM_URL = config ? `wss://${config.stream}/stream` : "";
export const WEBSOCKET_EVENT_URL = config ? `wss://${config.event}/event` : "";
// console.log("CONFIG", config); cdssxxcc 

export const API_DOMAIN = config?.api || "";
export const FEED_DOMAIN = config?.feed || "";

// export const WEBSOCKET_API_URL ="wss://api-swastiik.fintrabit.com/ws"

// export const WEBSOCKET_STREAM_URL = "wss://stream-swastiik.fintrabit.com/stream"

// export const WEBSOCKET_EVENT_URL =  "wss://event-swastiik.fintrabit.com/event"; 


// -- API --
// "wss://api.fintrabit.com/api?t=xyz"
// "ws://192.46.213.87:5858/ws"

// -- STREAM --
// "wss://stream.fintrabit.com/stream?t=xyz"
// "ws://192.46.213.87:6868/stream"

// -- EVENT --
// "wss://event.fintrabit.com/event";
//  "ws://192.46.213.87:9898/event"; 