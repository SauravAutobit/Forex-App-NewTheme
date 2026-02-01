import { getDomainConfig } from "./domainConfig";

const getActiveUser = () => {
  try {
    const storedActiveAccount = localStorage.getItem("activeAccount");
    return storedActiveAccount ? JSON.parse(storedActiveAccount) : null;
  } catch (e) {
    return null;
  }
};

export const getWebSocketApiUrl = () => {
  const user = getActiveUser();
  const config = getDomainConfig(user?.username);
  return config ? `wss://${config.api}/ws` : "";
};

export const getWebSocketStreamUrl = () => {
  const user = getActiveUser();
  const config = getDomainConfig(user?.username);
  return config ? `wss://${config.stream}/stream` : "";
};

export const getWebSocketEventUrl = () => {
  const user = getActiveUser();
  const config = getDomainConfig(user?.username);
  return config ? `wss://${config.event}/event` : "";
};

export const getApiDomain = () => {
  const user = getActiveUser();
  const config = getDomainConfig(user?.username);
  return config?.api || "";
};

export const getFeedDomain = () => {
  const user = getActiveUser();
  const config = getDomainConfig(user?.username);
  return config?.feed || "";
};