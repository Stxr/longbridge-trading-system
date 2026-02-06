Loaded cached credentials.
Hook registry initialized with 0 hook entries
### 新增需求

### 需求：基于动量的信号生成
RSI 策略应当根据相对强弱指数 (Relative Strength Index) 的超买和超卖阈值生成信号。

#### 场景：超卖条件
- **当 (WHEN)** RSI 值跌破超卖阈值（默认为 30）时
- **那么 (THEN)** 策略应当发出买入 (BUY) 信号

#### 场景：超买条件
- **当 (WHEN)** RSI 值升破超买阈值（默认为 70）时
- **那么 (THEN)** 策略应当发出卖出 (SELL) 信号

### 需求：阈值配置
策略必须允许用户配置超买和超卖阈值水平。

#### 场景：自定义阈值
- **当 (WHEN)** 策略配置了 20 的超卖阈值和 80 的超买阈值时
- **那么 (THEN)** 它应当仅在突破这些特定水平时发出信号
