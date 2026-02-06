Loaded cached credentials.
Hook registry initialized with 0 hook entries
# Dual Thrust 策略

## 目的
一种区间突破策略，根据当前价格相对于从当日开盘价计算出的区间偏移量的移动来生成信号。

## 要求

### 要求：区间突破信号生成
当当前价格突破从当日开盘价偏移出的计算区间时，Dual Thrust 策略应生成信号。

#### 场景：上行突破
- **当 (WHEN)** 当前价格大于 (开盘价 + K1 * Range) 时
- **那么 (THEN)** 策略应发出 买入 (BUY) 信号

#### 场景：下行突破
- **当 (WHEN)** 当前价格小于 (开盘价 - K2 * Range) 时
- **那么 (THEN)** 策略应发出 卖出 (SELL) 信号

### 要求：区间和阈值计算
策略应将区间 (Range) 计算为指定周期内 (Highest High - Lowest Close) 和 (Highest Close - Lowest Low) 中的最大值。

#### 场景：区间初始化
- **当 (WHEN)** 交易日开始时
- **那么 (THEN)** 策略应根据历史数据计算区间 (Range)，并相对于当日开盘价设置买入/卖出触发点
