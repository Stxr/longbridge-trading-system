## ADDED Requirements

### Requirement: Performance Metric Calculation
The system SHALL calculate standard performance metrics, including Total Return, Annualized Return, Sharpe Ratio, and Maximum Drawdown.

#### Scenario: Generate metrics after backtest
- **WHEN** a backtest finishes
- **THEN** the system outputs a summary of the strategy's risk-adjusted performance

### Requirement: Equity Curve Generation
The system SHALL generate an equity curve representing the account value over time.

#### Scenario: Visualizing performance
- **WHEN** requested by the user
- **THEN** the system produces a series of data points representing the daily or per-trade account equity

### Requirement: Strategy Comparison
The system SHALL support comparing the performance of multiple strategies or different parameters for the same strategy.

#### Scenario: Compare two MA crossover variations
- **WHEN** two backtests are completed
- **THEN** the system provides a side-by-side comparison of their key performance indicators

### Requirement: Unified Reporting
The system SHALL provide unified reports that can aggregate and compare performance from both backtesting and live trading sessions.

#### Scenario: Compare backtest vs live performance
- **WHEN** a strategy has been both backtested and run in live trading
- **THEN** the system generates a report showing the performance correlation between the two environments
