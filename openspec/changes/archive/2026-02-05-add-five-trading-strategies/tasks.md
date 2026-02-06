Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 1. SMA 均线交叉策略 (SMA Crossover Strategy)

- [x] 1.1 创建 `src/modules/strategy-framework/sma-crossover-strategy.ts`
- [x] 1.2 实现 SMA 计算逻辑和交叉信号生成

## 2. 布林带策略 (Bollinger Bands Strategy)

- [x] 2.1 创建 `src/modules/strategy-framework/bollinger-bands-strategy.ts`
- [x] 2.2 实现标准差 (Standard Deviation) 和布林带 (Bollinger Band) 计算逻辑

## 3. RSI 策略 (RSI Strategy)

- [x] 3.1 创建 `src/modules/strategy-framework/rsi-strategy.ts`
- [x] 3.2 实现相对强弱指数 (Relative Strength Index) 计算以及超买/超卖信号

## 4. MACD 策略 (MACD Strategy)

- [x] 4.1 创建 `src/modules/strategy-framework/macd-strategy.ts`
- [x] 4.2 实现指数移动平均 (Exponential Moving Average) 和 MACD 交叉逻辑

## 5. Dual Thrust 策略 (Dual Thrust Strategy)

- [x] 5.1 创建 `src/modules/strategy-framework/dual-thrust-strategy.ts`
- [x] 5.2 实现区间计算和开盘突破 (Day-open breakout) 逻辑

## 6. 验证 (Verification)

- [x] 6.1 创建 `src/test-strategies-new.ts` 以验证所有新策略的功能
- [x] 6.2 对每个策略执行回测 (Backtests)，以确保信号生成正确
