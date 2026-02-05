## Why

To enhance the trading system's utility, we need a broader library of standard trading strategies. This allows for better market coverage across different conditions (trending, ranging, high volatility) and provides more examples for users to build upon.

## What Changes

- Implement 5 new strategy classes in `src/modules/strategy-framework/`.
- Ensure each strategy adheres to the `BaseStrategy` interface.
- Add basic unit tests for each new strategy.
- (Optional) Update `src/index.ts` or create new test files to demonstrate the new strategies.

## Capabilities

### New Capabilities

- `sma-crossover-strategy`: Trend-following logic based on the crossing of short-term and long-term simple moving averages.
- `bollinger-bands-strategy`: Mean reversion logic using standard deviation bands around a moving average.
- `rsi-strategy`: Momentum-based logic identifying overbought (>70) and oversold (<30) levels.
- `macd-strategy`: Trend-momentum logic using the convergence and divergence of exponential moving averages.
- `dual-thrust-strategy`: Range breakout logic based on the previous day's high, low, and close.

### Modified Capabilities
- (None)

## Impact

- `src/modules/strategy-framework/`: Five new strategy files will be added.
- `src/test-strategies.ts`: New test files for verification.
