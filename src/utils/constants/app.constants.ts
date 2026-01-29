import { getDomainConfig } from "./domainConfig";

const storedActiveAccount = localStorage.getItem("activeAccount");
const activeUser = storedActiveAccount ? JSON.parse(storedActiveAccount) : null;

const config = getDomainConfig(activeUser?.username);

export const WEBSOCKET_API_URL = config ? `wss://${config.api}/ws` : "";
export const WEBSOCKET_STREAM_URL = config ? `wss://${config.stream}/stream` : "";
export const WEBSOCKET_EVENT_URL = config ? `wss://${config.event}/event` : "";

console.log("DOMAIN CONFIG:", { 
  user: activeUser?.username, 
  api: config?.api, 
  stream: config?.stream 
});

export const API_DOMAIN = config?.api || "";
export const FEED_DOMAIN = config?.feed || "";