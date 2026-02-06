Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 原因

提供一种利用当日价格极值反转的策略。通过追踪当日最高价和最低价，系统可以识别出可能预示趋势转变或获利进/出场点的重大回撤或回升。

## 变更内容

- 在 `src/modules/strategy-framework/` 中实现 `HighLowReversionStrategy` 类。
- 支持追踪当日内的最高和最低价格。
- 为以下内容添加可配置参数：
    - 卖出阈值（从最高点下跌的百分比）。
    - 买入阈值（从最低点上涨的百分比）。
    - 卖出数量/比例。
    - 买入数量/比例。
- 添加专门的测试脚本以验证信号准确性。

## 功能

### 新增功能

- `high-low-reversion-strategy`：监控每日价格极值并根据偏离这些极值的百分比执行交易的逻辑。

### 修改的功能

- (无)

## 影响范围

- `src/modules/strategy-framework/high-low-reversion-strategy.ts`：新的策略实现。
- `src/test-high-low-reversion.ts`：新的验证测试。
