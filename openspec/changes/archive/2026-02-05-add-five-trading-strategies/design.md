## Context

The trading system currently has a very limited set of strategies (Percentage and Hello World). To make the system more robust, we are adding five industry-standard technical strategies. These will be implemented as new classes extending the `BaseStrategy` abstract class.

## Goals / Non-Goals

**Goals:**
- Implement SMA Crossover, Bollinger Bands, RSI, MACD, and Dual Thrust strategies.
- Each strategy should be self-contained and easy to configure via constructor parameters.
- Provide clear logging for signal generation and order execution.

**Non-Goals:**
- Integration of 3rd-party technical indicator libraries (for now).
- High-frequency trading optimizations.
- Implementation of complex portfolio management logic within the strategies.

## Decisions

### 1. Manual Indicator Implementation
We will implement simple versions of the required technical indicators (SMA, EMA, StdDev, RSI) within each strategy class or a shared utility.
- **Rationale**: Keeps dependencies low and makes the core logic transparent.
- **Alternatives**: Using `technicalindicators` npm package. Rejected to maintain a zero-dependency (for logic) approach for this phase.

### 2. Historical Data Buffering
Each strategy will maintain a private `history` array of recent close prices to calculate moving averages and other indicators.
- **Rationale**: Simple to implement and sufficient for the target strategies.
- **State Management**: The buffer size will be determined by the maximum lookback period required by the strategy configuration (e.g., the long-period SMA).

### 3. Signal Triggering on KLines
While `BaseStrategy` supports `onQuote`, these technical strategies will primarily generate signals in `onData` (triggered by KLine/candle closes).
- **Rationale**: Most standard technical indicators are designed to be calculated on closed candles to avoid "repainting" or false signals during a candle's formation.

### 4. Class Structure
Each strategy will live in its own file under `src/modules/strategy-framework/`.
- `sma-crossover-strategy.ts`
- `bollinger-bands-strategy.ts`
- `rsi-strategy.ts`
- `macd-strategy.ts`
- `dual-thrust-strategy.ts`

## Risks / Trade-offs

- **[Risk]** Manual indicator implementation might have subtle bugs compared to battle-tested libraries.
  - **Mitigation**: Implement unit tests for each indicator calculation within the strategy tests.
- **[Risk]** Memory usage if buffers grow too large.
  - **Mitigation**: Explicitly slice history arrays to the minimum required length (`Math.max(...periods)`).
