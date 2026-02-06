Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 目的 (Why)

为了提升交易系统的实用性，我们需要更丰富的标准交易策略库。这将有助于在不同的市场环境（趋势、震荡、高波动）下实现更好的市场覆盖，并为用户提供更多可参考的构建示例。

## 变更内容 (What Changes)

- 在 `src/modules/strategy-framework/` 中实现 5 个新的策略类。
- 确保每个策略都遵循 `BaseStrategy` 接口。
- 为每个新策略添加基础单元测试。
- （可选）更新 `src/index.ts` 或创建新的测试文件来演示这些新策略。

## 功能 (Capabilities)

### 新功能 (New Capabilities)

- `sma-crossover-strategy`: 基于短期和长期简单移动平均线（SMA）交叉的趋势跟踪逻辑。
- `bollinger-bands-strategy`: 使用移动平均线周围的标准差带实现的均值回归逻辑。
- `rsi-strategy`: 识别超买（>70）和超卖（<30）水平的动量逻辑。
- `macd-strategy`: 使用指数移动平均线（EMA）的收敛与发散实现的趋势动量逻辑。
- `dual-thrust-strategy`: 基于前一交易日的最高价、最低价和收盘价的区间突破逻辑。

### 修改的功能 (Modified Capabilities)

- (无)

## 影响 (Impact)

- `src/modules/strategy-framework/`: 将新增五个策略文件。
- `src/test-strategies.ts`: 新增用于验证的测试文件。
