Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 1. 策略实现

- [x] 1.1 在 `src/modules/strategy-framework/` 中创建 `PercentageStrategy.ts`
- [x] 1.2 实现捕获参考价格的初始化逻辑
- [x] 1.3 在 `onQuote` 中实现 5% 下跌/上涨检测逻辑
- [x] 1.4 通过 `context.submitOrder` 实现订单触发

## 2. 集成与测试

- [x] 2.1 更新 `src/index.ts` (或创建测试运行器) 以使用新策略
- [x] 2.2 使用模拟数据在回测模式下验证策略行为
- [x] 2.3 在实盘模式下验证策略初始化 (如果需要，可进行不带订单的干跑/dry-run)
