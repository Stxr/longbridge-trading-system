## ADDED Requirements

### Requirement: Convergence-divergence signal generation
The MACD strategy SHALL generate signals based on the crossover of the MACD line and the signal line.

#### Scenario: Bullish MACD crossover
- **WHEN** the MACD line crosses above the signal line
- **THEN** the strategy SHALL emit a BUY signal

#### Scenario: Bearish MACD crossover
- **WHEN** the MACD line crosses below the signal line
- **THEN** the strategy SHALL emit a SELL signal

### Requirement: Indicator component calculation
The strategy SHALL calculate the MACD line (difference between 12-period and 26-period EMAs) and the signal line (9-period EMA of the MACD line).

#### Scenario: Real-time component update
- **WHEN** new price data is received
- **THEN** the strategy SHALL update the EMAs, the MACD line, and the signal line sequentially
