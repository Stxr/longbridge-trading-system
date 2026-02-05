## ADDED Requirements

### Requirement: Authentication with Longbridge OpenAPI
The system SHALL authenticate with Longbridge OpenAPI using an App Key, App Secret, and Access Token.

#### Scenario: Successful authentication
- **WHEN** the system initializes with valid Longbridge credentials
- **THEN** it establishes a persistent connection for both Quote and Trade APIs

### Requirement: Real-time Market Data Subscription
The system SHALL support subscribing to real-time quotes, depth, and trades for supported markets (HK, US, SH, SZ).

#### Scenario: Subscribe to HK stock quotes
- **WHEN** the system requests a subscription for "700.HK" (Tencent)
- **THEN** it receives real-time price updates through a WebSocket connection

### Requirement: Historical Data Retrieval
The system SHALL retrieve historical K-line data for specified symbols, intervals, and time ranges.

#### Scenario: Fetch daily K-lines for backtesting
- **WHEN** the system requests daily K-lines for "AAPL.US" for the past year
- **THEN** it receives a structured list of OHLCV data points

### Requirement: Live Order Execution
The system SHALL allow creating, canceling, and amending orders via the Longbridge Trade API.

#### Scenario: Submit a limit buy order
- **WHEN** a strategy triggers a buy signal for 100 shares of "NVDA.US" at $120.00
- **THEN** the system submits a limit buy order and receives an order ID and initial status

### Requirement: Real-time Account State Synchronization
The system SHALL synchronize account balance, positions, and order status in real-time from the Longbridge Trade API.

#### Scenario: Update position after order fill
- **WHEN** an order is filled on the exchange
- **THEN** the system receives a trade notification and updates the local position state immediately

### Requirement: API Rate Limiting and Safety
The system SHALL strictly enforce Longbridge API rate limits (e.g., 30 calls/30 seconds for Trade API) and handle API errors gracefully.

#### Scenario: Rate limit reached
- **WHEN** the strategy attempts to send orders exceeding the 30 calls/30 seconds limit
- **THEN** the system queues the requests and delays execution to remain within limits
