## ADDED Requirements

### Requirement: Interactive K-line chart
The UI SHALL display an interactive K-line chart using `lightweight-charts`.

#### Scenario: Zooming and Panning
- **WHEN** user drags the chart or uses the scroll wheel
- **THEN** chart zooms or pans smoothly without performance lag

### Requirement: Backtest visualization markers
The UI SHALL display buy and sell markers on the K-line chart based on backtest results.

#### Scenario: Display trade markers
- **WHEN** backtest completes and results are loaded
- **THEN** chart renders green arrows for buy signals and red arrows for sell signals at the corresponding price and time

### Requirement: Backtest configuration form
The UI SHALL provide a form to configure strategy parameters and date ranges for backtesting.

#### Scenario: Submit backtest form
- **WHEN** user selects a strategy and fills in the parameters, then clicks "Run Backtest"
- **THEN** UI sends the configuration to the backend API and shows a loading state
