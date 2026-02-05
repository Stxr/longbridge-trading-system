## ADDED Requirements

### Requirement: Momentum-based signal generation
The RSI strategy SHALL generate signals based on overbought and oversold thresholds of the Relative Strength Index.

#### Scenario: Oversold condition
- **WHEN** the RSI value falls below the oversold threshold (default 30)
- **THEN** the strategy SHALL emit a BUY signal

#### Scenario: Overbought condition
- **WHEN** the RSI value rises above the overbought threshold (default 70)
- **THEN** the strategy SHALL emit a SELL signal

### Requirement: Threshold configuration
The strategy MUST allow users to configure the overbought and oversold threshold levels.

#### Scenario: Custom thresholds
- **WHEN** the strategy is configured with an oversold threshold of 20 and overbought of 80
- **THEN** it SHALL only emit signals when those specific levels are breached
