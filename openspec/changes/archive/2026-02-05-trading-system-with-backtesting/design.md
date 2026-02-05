## Context

The goal is to build a unified trading system that integrates the Longbridge OpenAPI for live trading and market data with a custom backtesting engine. The system needs to support a seamless transition between backtesting and live trading while maintaining strict isolation to prevent accidental live execution. The current environment is a blank slate for this specific project, allowing us to establish a robust architecture from the start.

## Goals / Non-Goals

**Goals:**
- Provide a unified strategy interface that works across backtesting and live trading.
- Integrate Longbridge OpenAPI for real-time data and order execution.
- Implement a simulation engine for accurate backtesting with slippage and commission models.
- Ensure strict environment isolation (Backtest vs. Live).
- Support persistent storage for historical market data and transaction logs.

**Non-Goals:**
- Building a complex GUI (the initial focus is CLI and API).
- Supporting brokers other than Longbridge in the initial phase.
- High-frequency trading (latency is subject to API and network constraints).

## Decisions

### 1. Language and Runtime: TypeScript (Node.js)
**Rationale:** TypeScript provides excellent type safety, which is critical for financial applications. The Node.js ecosystem has mature libraries for WebSockets (needed for real-time quotes) and database interaction.
**Alternatives Considered:** Python (better for data science libraries but TypeScript offers better structural safety for complex system integration).

### 2. Database: SQLite for Local Storage
**Rationale:** SQLite is lightweight, serverless, and perfect for local data storage of historical K-lines and trade logs. It simplifies the setup for individual traders.
**Alternatives Considered:** PostgreSQL (higher overhead for a single-user system), LevelDB (efficient but less flexible for complex queries).

### 3. Modular Architecture
**Rationale:** Separating concerns into `longbridge-integration`, `strategy-framework`, `backtesting-engine`, `data-management`, and `portfolio-tracking` allows for easier testing and maintenance.
**Alternatives Considered:** Monolithic approach (harder to maintain and isolate backtest vs. live logic).

### 4. Strategy Lifecycle Hooks
**Rationale:** Using standard hooks like `on_init`, `on_data`, and `on_order_update` ensures that strategies are event-driven and consistent across environments.
**Alternatives Considered:** Polling-based strategy logic (inefficient and higher latency).

### 5. Environment Isolation via Mode Manager
**Rationale:** A dedicated `TradingModeManager` will act as a gatekeeper, ensuring that the `TradeAPI` interface is only accessible when the system is explicitly started in "live" mode with user confirmation.
**Alternatives Considered:** Environment variables alone (prone to accidental configuration errors).

## Risks / Trade-offs

- [Risk] API Rate Limiting → [Mitigation] Implement a request queue and rate limiter in the `longbridge-integration` module.
- [Risk] Accidental Live Execution → [Mitigation] Explicit mode flags and confirmation prompts; physically different provider implementations for backtest vs. live.
- [Risk] Data Inconsistency → [Mitigation] Use a unified data model (Zod schema) for both historical and real-time market data.
- [Risk] Network Latency → [Mitigation] WebSocket subscriptions for real-time data; asynchronous order processing.
