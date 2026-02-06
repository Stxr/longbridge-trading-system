Loaded cached credentials.
Hook registry initialized with 0 hook entries
I will translate the `specs/sma-crossover-strategy/spec.md` file into Chinese, maintaining its original structure and technical terminology.

I will now overwrite the `specs/sma-crossover-strategy/spec.md` file with the Chinese translation, ensuring all formatting and technical terms remain intact.

# SMA Crossover 策略

## 目的
一种趋势跟踪策略，根据两个不同周期的简单移动平均线 (SMA) 的交叉生成信号。

## 需求

### 需求：趋势跟踪信号生成
SMA Crossover 策略应根据短期简单移动平均线 (SMA) 和长期 SMA 的交叉生成信号。

#### 场景：Bullish 交叉信号
- **当** 短期 SMA 向上穿过长期 SMA 时
- **那么** 策略应发出 BUY 信号

#### 场景：Bearish 交叉信号
- **当** 短期 SMA 向下穿过长期 SMA 时
- **那么** 策略应发出 SELL 信号

### 需求：参数配置
策略必须允许配置短期和长期周期。

#### 场景：自定义周期
- **当** 策略初始化为短期周期 50 和长期周期 200 时
- **那么** 它应使用这些特定的窗口进行 SMA 计算
