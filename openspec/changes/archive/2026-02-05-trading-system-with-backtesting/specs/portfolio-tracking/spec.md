## ADDED Requirements

### Requirement: Unified Position Tracking
The system SHALL track positions for all symbols across both backtesting and live trading environments.

#### Scenario: Opening a new position
- **WHEN** a buy order is filled
- **THEN** the portfolio tracker adds the symbol to the active positions list with the correct quantity and average cost

### Requirement: Real-time P&L Calculation
The system SHALL calculate realized and unrealized Profit and Loss (P&L) in real-time based on current market prices.

#### Scenario: Calculating unrealized P&L
- **WHEN** the market price of a held stock changes
- **THEN** the system updates the unrealized P&L based on the difference between the current price and the average cost

### Requirement: Cash Balance Management
The system SHALL track available cash balance and buying power, accounting for trades, commissions, and margin requirements.

#### Scenario: Deducting cash after purchase
- **WHEN** a buy order is executed
- **THEN** the system reduces the available cash by the total trade value plus commissions

### Requirement: Transaction History Logging
The system SHALL maintain a detailed log of all transactions, including fills, cancellations, and amendments.

#### Scenario: Reviewing trade logs
- **WHEN** a backtest or live session completes
- **THEN** the system provides a persistent record of every trade event for audit and analysis
