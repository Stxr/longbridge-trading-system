## ADDED Requirements

### Requirement: Environment Isolation
The system SHALL maintain strict isolation between backtesting and live trading environments to prevent accidental live execution.

#### Scenario: Running a backtest
- **WHEN** the system is in "backtest" mode
- **THEN** it is physically impossible for the strategy to call the live Longbridge Trade API

### Requirement: Explicit Mode Switching
The system SHALL require an explicit configuration or command-line flag to enable live trading mode.

#### Scenario: Switching to live mode
- **WHEN** the user starts the system with `--mode live`
- **THEN** the system prompts for a final confirmation before initializing the live trading environment

### Requirement: Live Trading Safeguards
The system SHALL implement safeguards such as order size limits and mandatory dry-runs before allowing full live execution.

#### Scenario: Enforcing max order size
- **WHEN** a live strategy attempts to place an order exceeding a pre-configured maximum size
- **THEN** the system rejects the order and alerts the user

### Requirement: Strategy Validation before Deployment
The system SHALL perform a validation check on the strategy (e.g., verifying parameters) before allowing it to run in live mode.

#### Scenario: Deploying an unvalidated strategy
- **WHEN** a user attempts to run a strategy in live mode without required parameters
- **THEN** the system prevents execution and specifies the missing configuration
