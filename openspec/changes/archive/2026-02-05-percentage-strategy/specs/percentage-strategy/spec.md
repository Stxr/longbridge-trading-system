## ADDED Requirements

### Requirement: Signal Generation Based on 5% Price Change
The system SHALL monitor real-time quotes and generate a buy signal when the price drops by 5% from a reference point, and a sell signal when the price rises by 5% from a reference point.

#### Scenario: Price drops by 5%
- **WHEN** the current price is $95.00 and the reference entry price was $100.00
- **THEN** the system generates a BUY signal

#### Scenario: Price rises by 5%
- **WHEN** the current price is $105.00 and the reference entry price was $100.00
- **THEN** the system generates a SELL signal

### Requirement: Live Order Triggering
The system SHALL automatically submit a limit or market order to the Longbridge Trade API upon receiving a strategy signal.

#### Scenario: Submitting a buy order on signal
- **WHEN** a BUY signal is generated
- **THEN** the system calls the `submitOrder` method with the configured quantity and market symbol

### Requirement: Signal and Execution Logging
The system SHALL log every generated signal and the resulting order status for audit and verification purposes.

#### Scenario: Logging a sell signal
- **WHEN** a SELL signal is triggered
- **THEN** the system writes a log entry containing the timestamp, symbol, trigger price, and signal type
