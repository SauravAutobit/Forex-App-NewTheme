const generateData = () => {
  const data = [];
  let time = Math.floor(Date.now() / 1000) - 24 * 60 * 60 * 100; // Start 100 days ago
  let open = 100;
  let high, low, close;

  for (let i = 0; i < 1000; i++) {
    // Random walk
    const volatility = 2;
    const change = (Math.random() - 0.5) * volatility;

    close = open + change;
    high = Math.max(open, close) + Math.random() * volatility * 0.5;
    low = Math.min(open, close) - Math.random() * volatility * 0.5;

    data.push({
      time: time + i * 60 * 60, // Hourly data
      open: open,
      high: high,
      low: low,
      close: close,
    });

    open = close;
  }
  return data;
};
