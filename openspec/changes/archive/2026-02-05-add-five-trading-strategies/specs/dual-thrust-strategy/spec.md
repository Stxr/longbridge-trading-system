## ADDED Requirements

### Requirement: Range breakout signal generation
The Dual Thrust strategy SHALL generate signals when the current price breaks through a calculated range offset from the day's opening price.

#### Scenario: Upside breakout
- **WHEN** the current price is greater than the (Opening Price + K1 * Range)
- **THEN** the strategy SHALL emit a BUY signal

#### Scenario: Downside breakout
- **WHEN** the current price is less than the (Opening Price - K2 * Range)
- **THEN** the strategy SHALL emit a SELL signal

### Requirement: Range and threshold calculation
The strategy SHALL calculate the Range as the maximum of (Highest High - Lowest Close) and (Highest Close - Lowest Low) over a specified period.

#### Scenario: Range initialization
- **WHEN** the trading day starts
- **THEN** the strategy SHALL calculate the Range based on historical data and set the buy/sell triggers relative to the current day's open
