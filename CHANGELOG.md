# Changelog

All notable changes to this project will be documented in this file.

## [2026-02-06]

### Added
- **Longbridge Historical Data Sync**: New tool to fetch and persist historical K-line data from Longbridge OpenAPI.
  - Support for deep history pagination with sub-day (second-level) precision.
  - Multi-symbol synchronization support via comma-separated input.
  - Incremental updates (Upsert) to maintain local database without full re-downloads.
  - Support for various periods: 1m, 5m, 15m, 30m, 60m, 1d, 1w, 1mon, 1y.
- **Enhanced Backtesting Engine**:
  - `BacktestFactory`: Easy initialization of backtests using local SQLite data.
  - Accurate **Win Rate** calculation by pairing buy and sell orders.
  - Dynamic **Sharpe Ratio** calculation with automatic annualization based on data frequency (minutes to years).
- **New Utility Scripts**:
  - `src/sync-data.ts`: CLI tool for data synchronization.
  - `src/check-db.ts`: Quickly inspect local database statistics.
  - `src/test-db-backtest.ts`: Example script for database-driven backtesting.
- **Documentation**:
  - Comprehensive guide in `README.md` for sync and backtesting tools.
  - OpenSpec artifacts archived for historical data integration.

### Fixed
- **Symbol Matching**: Resolved an issue where symbols with and without market suffixes (e.g., "700" vs "700.HK") caused matching failures in the engine and simulator.
- **Database Performance**: Implemented chunked saving for large datasets to avoid SQLite's compound SELECT limits.
- **Timezone Support**: Added `dayjs` timezone and UTC plugins for consistent timestamp handling.

## [2026-02-05]

### Added
- **New Trading Strategies**:
  - `PercentageStrategy`: Basic price-drop buying and price-rise selling.
  - `BollingerBandsStrategy`, `RSIMomentumStrategy`, `MACDStrategy`, `DualThrustStrategy`, `SMACrossoverStrategy`.
- **Core Framework**:
  - Initial implementation of the Backtesting Engine and Trading Mode Manager.
  - Longbridge integration for real-time quotes and trading.
  - Base `PortfolioTracker` and `PerformanceAnalyzer`.
