Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 新增需求

### 需求：收敛-发散 (Convergence-divergence) 信号生成
MACD 策略应根据 MACD line 和 signal line 的交叉生成信号。

#### 场景：Bullish MACD crossover
- **当 (WHEN)** MACD line 向上穿越 signal line
- **那么 (THEN)** 策略应发出 BUY 信号

#### 场景：Bearish MACD crossover
- **当 (WHEN)** MACD line 向下穿越 signal line
- **那么 (THEN)** 策略应发出 SELL 信号

### 需求：指标组件计算
策略应计算 MACD line（12 周期和 26 周期 EMA 之间的差值）和 signal line（MACD line 的 9 周期 EMA）。

#### 场景：实时组件更新
- **当 (WHEN)** 接收到新的价格数据
- **那么 (THEN)** 策略应按顺序更新 EMA，MACD line 和 signal line
