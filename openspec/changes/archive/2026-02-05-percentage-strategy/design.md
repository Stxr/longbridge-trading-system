Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 背景

该策略需要在现有的 `strategy-framework` 中实现。它将继承 `BaseStrategy` 并使用实时行情（real-time quotes）来监控价格变化。初始化后收到的初始价格将作为第一个参考点。

## 目标 / 非目标

**目标：**
- 实现一个可插拔的策略类 `PercentageStrategy`。
- 跟踪参考价格以计算百分比变化。
- 通过 `TradingModeManager` 自动触发买入/卖出订单。
- 为所有信号触发提供清晰的日志。

**非目标：**
- 复杂的仓位管理（测试时使用固定数量）。
- 多重进场/离场逻辑（测试时使用简单的单次买入/卖出序列）。

## 决策

### 1. 策略状态管理
**决策**：在策略实例中存储 `referencePrice` 和 `hasPosition`。
**原理**：保持测试逻辑简单且自包含。策略通过捕获第一个行情作为 `referencePrice` 开始。

### 2. 信号触发
**决策**：在测试中使用实时行情 (`onQuote`) 而不是 K 线（K-lines），以降低延迟。
**原理**：使用最高频率的数据可以更好地快速验证 API 的响应能力。

### 3. 订单类型
**决策**：使用设置为当前市场价格（或略有偏移）的限价单（Limit orders），以确保测试中执行价格的可预测性。
**原理**：比单纯的市价单更真实地模拟交易，同时仍能实现快速成交。

## 风险 / 权衡

- [风险] 价格快速波动 → [缓解措施] 实现简单的冷却时间或状态标志 (`hasPosition`)，以防止高频发送订单。
- [风险] API 断开连接 → [缓解措施] 依赖底层的 `LongbridgeClient` 重连逻辑；策略将在收到下一个行情时恢复监控。
