Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 1. 基础设施与追踪

- [x] 1.1 创建 `src/modules/strategy-framework/high-low-reversion-strategy.ts`
- [x] 1.2 实现 `PriceExtremeTracker` 辅助类以管理高点/低点/周期状态
- [x] 1.3 实现基于资产交易所规则的周期重置逻辑（日、周、月）

## 2. 信号生成逻辑

- [x] 2.1 实现波幅计算逻辑 (`high - low`)
- [x] 2.2 实现使用波幅百分比公式的阈值突破检测
- [x] 2.3 实现“价格行为”确认（短期反转检测）

## 3. 信号验证与多资产支持

- [x] 3.1 实现防止重复（每个反转事件仅一个信号）
- [x] 3.2 使用 `Map<string, AssetMonitor>` 实现多资产监控
- [x] 3.3 为所有状态更改和信号添加结构化 JSON/标准化日志

## 4. 验证

- [x] 4.1 创建包含各种周期类型模拟数据的 `src/test-high-low-reversion.ts`
- [x] 4.2 并行验证多个资产的信号生成准确性
- [x] 4.3 验证周期结束锁定和重置行为
