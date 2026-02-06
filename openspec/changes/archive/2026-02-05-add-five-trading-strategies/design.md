Loaded cached credentials.
Hook registry initialized with 0 hook entries
这份文档描述了交易系统的开发背景与规划。以下是翻译后的内容：

## 背景 (Context)

目前的交易系统仅包含非常有限的策略（Percentage 和 Hello World）。为了增强系统的健壮性，我们将添加五种行业标准的常用技术策略。这些策略将作为扩展 `BaseStrategy` 抽象类的新类来实现。

## 目标 / 非目标 (Goals / Non-Goals)

**目标：**
- 实现 SMA Crossover (均线交叉)、Bollinger Bands (布林带)、RSI (相对强弱指数)、MACD (指数平滑异同移动平均线) 以及 Dual Thrust 策略。
- 每个策略应保持独立，并能通过构造函数参数轻松配置。
- 为信号生成和订单执行提供清晰的日志记录。

**非目标：**
- 集成第三方技术指标库（暂不考虑）。
- 高频交易优化。
- 在策略内部实现复杂的组合管理逻辑。

## 决策 (Decisions)

### 1. 手动实现指标 (Manual Indicator Implementation)
我们将在每个策略类或共享工具库中实现所需技术指标（SMA, EMA, StdDev, RSI）的简易版本。
- **理由**：保持低依赖性，并使核心逻辑透明化。
- **备选方案**：使用 `technicalindicators` npm 包。为了在现阶段保持逻辑上的零依赖，已拒绝此方案。

### 2. 历史数据缓冲 (Historical Data Buffering)
每个策略将维护一个私有的 `history` 数组，存储最近的收盘价，用于计算移动平均线和其他指标。
- **理由**：实现简单，足以满足目标策略的需求。
- **状态管理**：缓冲区大小将由策略配置所需的最小回溯周期（例如长周期 SMA）决定。

### 3. 基于 K 线触发信号 (Signal Triggering on KLines)
虽然 `BaseStrategy` 支持 `onQuote`，但这些技术策略将主要在 `onData`（由 K 线/蜡烛线收盘触发）中生成信号。
- **理由**：大多数标准技术指标设计为在收盘后的蜡烛线上进行计算，以避免在蜡烛线形成过程中产生“未来函数”或错误信号。

### 4. 类结构 (Class Structure)
每个策略将位于 `src/modules/strategy-framework/` 下的独立文件中。
- `sma-crossover-strategy.ts`
- `bollinger-bands-strategy.ts`
- `rsi-strategy.ts`
- `macd-strategy.ts`
- `dual-thrust-strategy.ts`

## 风险 / 权衡 (Risks / Trade-offs)

- **[风险]** 手动实现的指标与经过实战检验的库相比，可能存在细微的 Bug。
  - **缓解措施**：在策略测试中为每个指标计算实现单元测试。
- **[风险]** 如果缓冲区增长过大，可能会导致内存占用。
  - **缓解措施**：将历史数组显式切割至所需的最小长度（`Math.max(...periods)`）。
