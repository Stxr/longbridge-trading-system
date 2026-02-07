## ADDED Requirements

### Requirement: Backtest execution API
The system SHALL provide an endpoint to trigger backtests for a specific strategy and date range.

#### Scenario: Trigger backtest
- **WHEN** user sends a POST request to `/api/backtest` with strategy name and parameters
- **THEN** system starts the backtest engine and returns a task ID

### Requirement: Real-time data streaming
The system SHALL support real-time data streaming via WebSocket for live trading monitoring.

#### Scenario: Connect to WebSocket
- **WHEN** user connects to `/ws/trading`
- **THEN** system streams live updates for account balance, positions, and order status

### Requirement: Strategy listing API
The system SHALL provide an endpoint to list all available strategies and their default parameters.

#### Scenario: List strategies
- **WHEN** user sends a GET request to `/api/strategies`
- **THEN** system returns a JSON list of available strategy names and their metadata
