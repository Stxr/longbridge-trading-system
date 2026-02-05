## ADDED Requirements

### Requirement: Unified Strategy Interface
The system SHALL provide a base strategy interface that allows users to implement custom trading logic.

#### Scenario: Implement a simple MA crossover strategy
- **WHEN** a user defines a class inheriting from the base strategy
- **THEN** they can override lifecycle methods to implement entry and exit rules

### Requirement: Strategy Lifecycle Hooks
The system SHALL execute strategy lifecycle hooks (e.g., `on_init`, `on_data`, `on_order_update`, `on_stop`) during execution.

#### Scenario: Processing new market data
- **WHEN** new market data (e.g., a new K-line) is received
- **THEN** the system calls the `on_data` hook of the active strategy

### Requirement: Cross-Environment Strategy Reusability
Strategies developed for backtesting SHALL be directly executable in live trading without code modifications.

#### Scenario: Deploying a backtested strategy to live
- **WHEN** a user switches the trading mode from "backtest" to "live" using the same strategy class
- **THEN** the strategy interacts with the Longbridge Trade API instead of the simulation engine

### Requirement: Strategy Parameter Configuration
The system SHALL support configuring strategy parameters (e.g., moving average periods) via a configuration file or initialization parameters.

#### Scenario: Optimize strategy parameters
- **WHEN** a user initializes a strategy with different parameter values
- **THEN** the strategy uses those values during its execution lifecycle
