Loaded cached credentials.
Hook registry initialized with 0 hook entries
I will translate the requirements into Chinese while preserving the markdown structure, technical terms, and keywords like SHALL, WHEN, and THEN.

## 新增 Requirements

### Requirement: Unified Position Tracking
系统 SHALL 追踪回测 (backtesting) 和实盘交易 (live trading) 环境中所有 symbols 的 positions。

#### Scenario: Opening a new position
- **WHEN** 一个 buy order 被 filled
- **THEN** portfolio tracker 将 symbol 添加到 active positions 列表，并记录正确的 quantity 和 average cost

### Requirement: Real-time P&L Calculation
系统 SHALL 根据当前市场价格实时计算已实现和未实现 P&L (Profit and Loss)。

#### Scenario: Calculating unrealized P&L
- **WHEN** 持有股票的 market price 发生变化
- **THEN** 系统根据 current price 与 average cost 的差值更新 unrealized P&L

### Requirement: Cash Balance Management
系统 SHALL 追踪可用 cash balance 和 buying power，并计入 trades、commissions 和 margin requirements。

#### Scenario: Deducting cash after purchase
- **WHEN** 一个 buy order 被 executed
- **THEN** 系统从可用 cash 中扣除总 trade value 加上 commissions

### Requirement: Transaction History Logging
系统 SHALL 维护所有 transactions 的详细日志，包括 fills、cancellations 和 amendments。

#### Scenario: Reviewing trade logs
- **WHEN** 一个 backtest 或 live session 完成
- **THEN** 系统提供每个 trade event 的持久记录，用于审计和分析
