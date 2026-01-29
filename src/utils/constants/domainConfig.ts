export interface DomainInfo {
  api: string;
  event: string;
  stream: string;
  feed: string;
}

export const DOMAIN_CONFIG: Record<string, DomainInfo> = {
  test: {
    api: "api-test.swtik.com",
    event: "event-test.swtik.com",
    stream: "stream-test.swtik.com",
    feed: "feed-test.swtik.com",
  },
  demo: {
    api: "api-demo.swtik.com",
    event: "event-demo.swtik.com",
    stream: "stream-demo.swtik.com",
    feed: "feed-demo.swtik.com",
  },
  
};

export const getDomainKey = (username?: string | null) => {
  if (username) {
    return localStorage.getItem(`${username}_selectedDomainKey`) || localStorage.getItem("selectedDomainKey");
  }
  return localStorage.getItem("selectedDomainKey");
};

export const setDomainKey = (key: string, username?: string | null) => {
  localStorage.setItem("selectedDomainKey", key); // Set global as fallback/last used
  if (username) {
    localStorage.setItem(`${username}_selectedDomainKey`, key);
  }
};

export const clearDomainKey = (username?: string | null) => {
  localStorage.removeItem("selectedDomainKey");
  if (username) {
    localStorage.removeItem(`${username}_selectedDomainKey`);
  }
};

export const getDomainConfig = (username?: string | null): DomainInfo | null => {
  const key = getDomainKey(username);
  if (!key) return null;

  // If key is in hardcoded config, use that
  if (DOMAIN_CONFIG[key]) {
    return DOMAIN_CONFIG[key];
  }

  // Otherwise, construct it dynamically based on the pattern
  // Pattern: api-{key}.swtik.com, event-{key}.swtik.com, etc.
  return {
    api: `api-${key}.swtik.com`,
    event: `event-${key}.swtik.com`,
    stream: `stream-${key}.swtik.com`,
    feed: `feed-${key}.swtik.com`,
  };
};

