## Context

The strategy needs to be implemented within the existing `strategy-framework`. It will extend `BaseStrategy` and use real-time quotes to monitor price changes. The initial price received after initialization will serve as the first reference point.

## Goals / Non-Goals

**Goals:**
- Implement a pluggable strategy class `PercentageStrategy`.
- Track a reference price to calculate percentage changes.
- Automatically trigger buy/sell orders via the `TradingModeManager`.
- Provide clear logging for all signal triggers.

**Non-Goals:**
- Sophisticated position sizing (use fixed quantity for testing).
- Multiple entry/exit logic (simple one-shot buy/sell sequence for testing).

## Decisions

### 1. Strategy State Management
**Decision**: Store `referencePrice` and `hasPosition` in the strategy instance.
**Rationale**: Keeps the testing logic simple and self-contained. The strategy starts by capturing the first quote as the `referencePrice`.

### 2. Signal Triggering
**Decision**: Use real-time quotes (`onQuote`) instead of K-lines for lower latency in testing.
**Rationale**: Rapid validation of API responsiveness is better achieved with the highest frequency data available.

### 3. Order Type
**Decision**: Use Limit orders set at the current market price (or slightly offset) to ensure predictable execution price in testing.
**Rationale**: Simulates more realistic trading than pure market orders while still achieving fast fills.

## Risks / Trade-offs

- [Risk] Fast price oscillations → [Mitigation] Implement a simple cooldown or state flag (`hasPosition`) to prevent rapid-fire order submission.
- [Risk] API Disconnection → [Mitigation] Rely on the underlying `LongbridgeClient` reconnection logic; the strategy will resume monitoring upon receiving the next quote.
