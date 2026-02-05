## ADDED Requirements

### Requirement: Historical Data Replay
The backtesting engine SHALL replay historical market data sequentially to simulate the passage of time.

#### Scenario: Replaying one month of 1-minute data
- **WHEN** the engine starts a backtest for January 2024
- **THEN** it iterates through each 1-minute bar and triggers strategy events in chronological order

### Requirement: Order Execution Simulation
The engine SHALL simulate order execution based on historical price action, including support for market and limit orders.

#### Scenario: Limit order fill at specified price
- **WHEN** a strategy submits a limit buy order at $150.00
- **THEN** the engine fills the order when the historical low price of a bar is less than or equal to $150.00

### Requirement: Slippage and Commission Modeling
The system SHALL support configurable slippage and commission models to accurately reflect trading costs.

#### Scenario: Apply fixed commission and percentage slippage
- **WHEN** a trade is executed in backtesting
- **THEN** the engine deducts the specified commission and adjusts the fill price based on the slippage model

### Requirement: Portfolio State Simulation
The engine SHALL track simulated account balance, positions, and margin usage throughout the backtest.

#### Scenario: Tracking equity curve
- **WHEN** trades are executed and market prices change
- **THEN** the engine updates the total account equity and records it for performance analysis
