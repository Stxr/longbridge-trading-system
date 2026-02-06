Loaded cached credentials.
Hook registry initialized with 0 hook entries
我将把这段 Markdown 文档翻译为中文，同时保留所有格式、代码块及技术术语。

---

## 背景 (Context)

系统需要一种复杂的均值回归策略，该策略基于特定周期（日、周、月）的价格极值运行。这需要稳健的高低点追踪、独立处理多种资产，以及复杂的信号过滤机制，以避免“虚假突破”或重复信号。

## 目标 / 非目标 (Goals / Non-Goals)

**目标：**
- 实现一个可配置的 `HighLowReversionStrategy`。
- 支持多种周期类型：日 (Daily)、周 (Weekly)、月 (Monthly)。
- 并行处理多种资产。
- 实现“价格行为 (Price Action)”确认逻辑（例如，短期趋势反转）以验证阈值突破。
- 提供结构化、高细节的日志。

**非目标：**
- 实时成交量分布分析（超出基础验证范围）。
- 复杂的多时间框架相关性分析。
- 自动参数优化（前向行走测试）。

## 决策 (Decisions)

### 1. `PriceExtremeTracker` 辅助类
为了管理每个资产和周期的状态，我们将实现一个辅助类。
- **理由**：保持主策略类简洁，并允许对高低点重置和更新逻辑进行简便的单元测试。
- **属性**：`currentHigh`, `currentLow`, `periodStart`, `periodEnd`, `isLocked`。

### 2. 价格区间百分比计算
策略将使用公式：`threshold_price = low + percentage * (high - low)`。
- **理由**：与固定的绝对距离相比，这是一种在不同价格尺度上定义“接近高/低点”的更稳健的方法。

### 3. 信号确认（行为确认）
为了满足“短期向上/向下行为”的要求：
- **决策**：仅当价格突破阈值且最后 3 个 tick（或较小窗口内的 KLines）显示出与突破方向相反的定向移动时，才会触发信号（例如：对于买入信号，价格触及低点阈值后向上跳动）。

### 4. 多资产实例管理
策略将维护一个 `Map<string, AssetMonitor>`，其中每个 `AssetMonitor` 包含其自身的 `PriceExtremeTracker` 和配置。
- **理由**：确保规格要求的各资产之间完整的数据隔离。

### 5. 标准化日志格式
日志将以 JSON 字符串或带有清晰前缀的结构化字符串输出。
- **格式**：`[HL-Reversion][ASSET_ID][EVENT_TYPE] { "price": X, "high": Y, "low": Z, ... }`

## 风险 / 权衡 (Risks / Trade-offs)

- **[风险]** 不同交易所之间周期开始/结束的时间差异。
  - **缓解措施**：使用来自 `KLine` 或 `Quote` 的 `market` 属性来确定正确的时区和交易时间。
- **[风险]** 如果系统启动较晚，可能会错过“周期开始”点。
  - **缓解措施**：在初始化时，策略应尝试获取当前周期的历史 KLines，以填充初始的高低点数值。
