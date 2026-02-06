Loaded cached credentials.
Hook registry initialized with 0 hook entries
我将把这段 Markdown 文档翻译成中文，并保留原有的格式、结构和技术术语。

## 新增需求

### 需求：趋势跟随信号生成
SMA Crossover 策略应基于短周期简单移动平均线 (SMA) 和长周期 SMA 的交叉生成信号。

#### 场景：看涨交叉信号
- **WHEN** 短周期 SMA 向上穿越长周期 SMA
- **THEN** 策略应发出 BUY 信号

#### 场景：看跌交叉信号
- **WHEN** 短周期 SMA 向下穿越长周期 SMA
- **THEN** 策略应发出 SELL 信号

### 需求：参数配置
策略必须允许配置 short-period 和 long-period 间隔。

#### 场景：自定义间隔
- **WHEN** 策略以 short-period 50 和 long-period 200 初始化
- **THEN** 它应使用这些特定的窗口进行 SMA 计算
