## Why

This change implements a lightweight percentage-based trading strategy to rapidly validate the functionality and reliability of live trading APIs (order creation, cancellation, execution) and end-to-end strategy execution workflows. The simple 5% price trigger rule eliminates complex logic overhead, allowing for quick testing of core trading pipeline integration—including market data ingestion, strategy signal generation, order routing to the exchange, and real-time trade status sync—without unnecessary complexity. This fast validation is critical to confirm API connectivity and strategy execution validity early, before developing more sophisticated trading logic.

## What Changes

- Implement a minimal percentage-strategy with core logic: generate a buy signal when the target asset's price drops by 5% and a sell signal when the price rises by 5% (price based on real-time market quotes).
- Integrate the strategy with existing live trading API layers to trigger actual order submission for rapid end-to-end testing of buy/sell API functionality.
- Add basic signal logging and trade execution status tracking to verify strategy trigger accuracy and API response reliability.
- Keep the strategy logic lightweight with no additional complex filters or risk management rules (optimized for fast testing).

## Capabilities

### New Capabilities

- `percentage-strategy`: Implementation of a simple strategy that buys on a 5% price drop and sells on a 5% price rise, designed for rapid validation of live trading APIs and strategy execution effectiveness; includes real-time signal generation, live order triggering, and basic execution status logging.

### Modified Capabilities
<!-- No requirement changes to existing capabilities -->

## Impact

- **Existing Modules**: Leverages existing live trading API integration (order create/query/execute) and real-time market data retrieval modules—no new external dependencies added.
- **Architecture**: Lightweight code addition to the strategy framework layer (pluggable, no modification to core system architecture).
- **Storage**: Writes minimal execution logs (signal trigger, order status) for testing verification—no additional database storage overhead.
- **Constraints**: Follows existing API rate limiting and order execution rules to avoid violating exchange/API provider constraints during testing.
