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

export const getDomainKey = () => localStorage.getItem("selectedDomainKey");

export const getDomainConfig = () => {
  const key = getDomainKey();
  if (!key) return null;
  return DOMAIN_CONFIG[key] || null;
};
