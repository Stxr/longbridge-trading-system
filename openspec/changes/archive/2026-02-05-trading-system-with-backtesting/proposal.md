# Revised Document (Added Emphasis on Live Trading Capability & Integration with Backtesting)
## Why
Quantitative traders and algorithmic trading enthusiasts need a flexible, extensible system to **develop, test, backtest, and execute live trades** using real market data—with a seamless workflow between backtesting validation and live trading deployment. Currently, there's no unified solution that integrates the Longbridge API for end-to-end market data and live trading execution with a robust backtesting engine that supports pluggable strategies. This system will enable data-driven trading decisions by allowing users to backtest multiple strategies against historical data, then directly deploy validated strategies to live markets with minimal configuration, while maintaining full control and real-time oversight of live trading activity.

## What Changes
- Build a new trading system from scratch supporting **end-to-end strategy-based backtesting and live trading** with a seamless mode switch between the two
- Integrate with Longbridge OpenAPI for full lifecycle market data (real-time quotes, historical data) and **live order execution & management**
- Implement a pluggable strategy framework allowing users to define custom trading strategies that work consistently across backtesting and live trading environments
- Create a backtesting engine that can replay historical market data, simulate order execution with configurable slippage/commission models, and mirror live trading rules for accurate strategy validation
- Provide unified portfolio tracking and performance analytics that aggregate data from **both backtested simulations and live trading activity**
- Support multiple markets (Hong Kong stocks/ETFs, US stocks/ETFs/options, China A-shares) for both backtesting and live trading
- Use TypeScript for type safety and modern development practices, with UV for Python environment management if Python components are needed
- Add live trading risk control mechanisms to align with Longbridge API constraints and prevent unintended live order execution

## Capabilities
### New Capabilities
- `longbridge-integration`: Full integration with Longbridge OpenAPI for authentication, market data retrieval (quotes, historical data), **live order execution/management (create, cancel, query, amend orders)**, and real-time sync of live trading account state; enforces API rate limits and error handling for live trading stability
- `strategy-framework`: Pluggable strategy framework with a unified base strategy interface, lifecycle hooks (on_data, on_order_filled, on_live_trade_trigger, etc.), and built-in example strategies (moving average crossover, mean reversion, etc.)—**strategies developed for backtesting are directly reusable for live trading** without code modification
- `backtesting-engine`: Backtesting engine that replays historical market data, simulates order execution with configurable slippage/commission models, tracks portfolio state over time, and mirrors live trading rules/constraints to ensure backtest results are representative of real-world performance
- `data-management`: Historical market data storage, retrieval, and caching system with support for different timeframes (1min, 5min, daily, etc.); unifies data models for historical (backtesting) and real-time (live trading) market data to ensure consistency across environments
- `portfolio-tracking`: **Unified real-time portfolio state management** for both backtesting simulations and live trading—tracks positions, cash balance, realized/unrealized P&L, transaction history, and live trading account metrics (margin, buying power) synced from Longbridge API
- `performance-analytics`: Comprehensive performance metrics calculation including Sharpe ratio, maximum drawdown, win rate, total return, and risk-adjusted returns; supports side-by-side strategy comparison for **both backtested results and live trading performance**, with unified reporting for cross-environment analysis
- `trading-mode-manager`: Lightweight mode switch mechanism (backtest/live) with strict isolation between environments to prevent accidental live order execution during backtesting; includes live trading confirmation prompts and strategy validation checks before deployment

### Modified Capabilities
<!-- No existing capabilities are being modified -->

## Impact
- **New Dependencies**:
  - Longbridge OpenAPI SDK (TypeScript or Python SDK) – for full live trading and market data integration
  - Database for historical data storage (SQLite for simplicity or PostgreSQL for scalability) – stores historical market data and live trading transaction/portfolio history
  - Testing framework (Jest for TypeScript or pytest for Python) – includes test suites for backtesting logic and live trading API integration
  - Data visualization libraries for performance charts (optional) – visualizes backtested and live trading performance metrics side-by-side
  - Env configuration & secret management tools – secures Longbridge API credentials and differentiates backtest/live environment settings

- **Project Structure**: New TypeScript/Node.js project (or Python project with UV environment management) with modular architecture separating concerns (API integration, strategy execution, backtesting, data management, **live trading risk control**); strict isolation between backtest and live trading code modules to minimize execution risks

- **Configuration Management**: API credentials (Longbridge API token/secret), strategy parameters, backtesting settings, **live trading risk limits**, and market data sources will require environment-specific configuration files (dev/backtest/live) with encrypted secret storage for live trading credentials

- **Rate Limiting**: Must strictly respect Longbridge API rate limits (Quote API: max 500 concurrent subscriptions, 10 calls/second; Trade API: 30 calls/30 seconds, min 0.02s interval) and implement rate limiting/request queuing for live trading to avoid API bans and ensure order execution reliability

- **Development Environment**: TypeScript development setup with tsconfig, ESLint, and proper package management via npm/yarn/pnpm (or Python with UV for dependency management); includes separate development environments for backtesting and live trading, with live trading access restricted to authorized developers only

- **Live Trading Risk & Execution Safeguards**: Implements additional development and runtime safeguards – including strategy dry-run before live deployment, order size limits, market condition filters, and real-time live trading activity logging/alerting – to mitigate the risk of unintended or erroneous live order execution