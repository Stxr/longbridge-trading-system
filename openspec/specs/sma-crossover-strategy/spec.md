# SMA Crossover Strategy

## Purpose
A trend-following strategy that generates signals based on the crossover of two simple moving averages (SMAs) of different periods.

## Requirements

### Requirement: Trend-following signal generation
The SMA Crossover strategy SHALL generate signals based on the crossover of a short-period simple moving average (SMA) and a long-period SMA.

#### Scenario: Bullish crossover signal
- **WHEN** the short-period SMA crosses above the long-period SMA
- **THEN** the strategy SHALL emit a BUY signal

#### Scenario: Bearish crossover signal
- **WHEN** the short-period SMA crosses below the long-period SMA
- **THEN** the strategy SHALL emit a SELL signal

### Requirement: Parameter configuration
The strategy MUST allow configuration of the short-period and long-period intervals.

#### Scenario: Customizing intervals
- **WHEN** the strategy is initialized with short-period 50 and long-period 200
- **THEN** it SHALL use those specific windows for SMA calculations
