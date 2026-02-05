# Bollinger Bands Strategy

## Purpose
A mean reversion strategy that uses volatility-based bands (standard deviations) to identify overbought and oversold conditions.

## Requirements

### Requirement: Volatility-based mean reversion signal generation
The Bollinger Bands strategy SHALL generate signals when the price breaks outside of the calculated standard deviation bands.

#### Scenario: Price breaks below lower band
- **WHEN** the current market price is less than or equal to the lower Bollinger Band
- **THEN** the strategy SHALL emit a BUY signal

#### Scenario: Price breaks above upper band
- **WHEN** the current market price is greater than or equal to the upper Bollinger Band
- **THEN** the strategy SHALL emit a SELL signal

### Requirement: Band calculation
The strategy SHALL calculate the middle band as a simple moving average, and upper/lower bands as N standard deviations away from the middle band.

#### Scenario: Default band calculation
- **WHEN** market data is received
- **THEN** the strategy SHALL compute the 20-period SMA and bands at 2 standard deviations by default
