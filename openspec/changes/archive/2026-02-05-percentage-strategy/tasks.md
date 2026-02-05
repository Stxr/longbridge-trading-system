## 1. Strategy Implementation

- [x] 1.1 Create `PercentageStrategy.ts` in `src/modules/strategy-framework/`
- [x] 1.2 Implement initialization logic to capture reference price
- [x] 1.3 Implement 5% drop/rise detection logic in `onQuote`
- [x] 1.4 Implement order triggering via `context.submitOrder`

## 2. Integration and Testing

- [x] 2.1 Update `src/index.ts` (or create a test runner) to use the new strategy
- [x] 2.2 Verify strategy behavior in backtest mode with mock data
- [x] 2.3 Verify strategy initialization in live mode (dry-run without orders if needed)
