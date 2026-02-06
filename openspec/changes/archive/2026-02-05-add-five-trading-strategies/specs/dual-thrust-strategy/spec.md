Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 新增需求

### 需求：区间突破信号生成
Dual Thrust 策略应在当前价格突破相对于当日开盘价的计算区间偏移量时生成信号。

#### 场景：上行突破
- **当** 当前价格大于 (Opening Price + K1 * Range)
- **则** 策略应发出 BUY 信号

#### 场景：下行突破
- **当** 当前价格小于 (Opening Price - K2 * Range)
- **则** 策略应发出 SELL 信号

### 需求：区间和阈值计算
策略应将 Range 计算为指定周期内 (Highest High - Lowest Close) 和 (Highest Close - Lowest Low) 的最大值。

#### 场景：区间初始化
- **当** 交易日开始时
- **则** 策略应根据历史数据计算 Range，并设置相对于当日开盘价的买入/卖出触发点
