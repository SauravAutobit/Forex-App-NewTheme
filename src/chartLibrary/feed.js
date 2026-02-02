const startFeed = (initialData, onUpdate) => {
  // Get the last candle from initial data

  let lastCandle = initialData[initialData.length - 1];
  let currentPrice = lastCandle.close;
  let targetPrice = currentPrice;
  let lastTime = lastCandle.time;

  // Configuration
  const updateInterval = 20; // 50 updates per second for smoothness
  const volatility = 0.5;

  // Interpolation loop
  setInterval(() => {
    // Occasionally pick a new target price (simulating market move)
    if (Math.random() < 0.05) {
      // 5% chance per tick to change target
      const change = (Math.random() - 0.5) * volatility * 5;
      targetPrice = currentPrice + change;
    }

    // Smoothly move currentPrice towards targetPrice
    // Simple linear interpolation (LERP) or just move by a step
    const diff = targetPrice - currentPrice;
    if (Math.abs(diff) > 0.01) {
      currentPrice += diff * 0.1; // Move 10% towards target per tick
    } else {
      currentPrice = targetPrice;
    }

    // Update the candle
    // For simplicity, we just update the close of the current candle
    // In a real app, you'd handle high/low and new bars

    const updatedCandle = {
      ...lastCandle,
      close: currentPrice,
      high: Math.max(lastCandle.high, currentPrice),
      low: Math.min(lastCandle.low, currentPrice),
    };

    // Check if we need a new bar (e.g. every minute)
    // simulating simple time progression for demo
    // For "Olymp" style, often it's just the current active candle animating

    onUpdate(updatedCandle);
    lastCandle = updatedCandle;
  }, updateInterval);
};
