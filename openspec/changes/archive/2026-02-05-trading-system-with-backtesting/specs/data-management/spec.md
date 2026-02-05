## ADDED Requirements

### Requirement: Historical Data Storage
The system SHALL store historical market data in a persistent database (e.g., SQLite or PostgreSQL) for efficient retrieval.

#### Scenario: Save downloaded K-lines
- **WHEN** historical data is fetched from Longbridge API
- **THEN** the system saves it to the local database to avoid redundant API calls

### Requirement: Unified Data Model
The system SHALL use a unified data model for market data across backtesting (historical) and live trading (real-time).

#### Scenario: Consistently formatted price updates
- **WHEN** a strategy receives a price update
- **THEN** the data object structure is identical whether it originated from the database or the real-time WebSocket

### Requirement: Multi-timeframe Support
The system SHALL support managing and retrieving data for multiple timeframes (e.g., 1min, 5min, 15min, 1h, daily).

#### Scenario: Requesting 5-minute bars
- **WHEN** a strategy requires 5-minute interval data
- **THEN** the data manager retrieves or aggregates the required data points for the strategy

### Requirement: Data Caching
The system SHALL implement a caching layer to speed up data access for frequently used symbols and timeframes.

#### Scenario: Second access to AAPL 1-minute data
- **WHEN** a backtest is rerun for the same symbol and period
- **THEN** the system retrieves the data from the local cache instead of the primary database
