Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 新增需求 (ADDED Requirements)

### 需求：周期性高低价校准 (Requirement: Periodic High-Low Price Calibration)
该策略 SHALL 根据目标交易资产的上市交易所规则以及用户定义的周期类型（每日、每周、每月）确定周期开始/结束时间，并 SHALL 计算和重置该周期的最高和最低价格。

#### 场景：周期初始化 (Scenario: Period Initialization)
- **WHEN** 当前周期（每日、每周或每月）根据交易所规则正式开始时
- **THEN** 该策略 SHALL 将最高和最低价格初始化为资产的第一个成交价，并开始实时追踪

#### 场景：盘中/周期内价格更新 (Scenario: Intraday/Intra-period Price Update)
- **WHEN** 在活跃交易期间，实时成交价超过当前周期最高价或低于当前周期最低价时
- **THEN** 该策略 SHALL 立即更新周期的极端值，并记录带有时间戳的更新日志

#### 场景：周期结束锁定 (Scenario: Period End Lock)
- **WHEN** 当前周期根据交易所规则正式结束时
- **THEN** 该策略 SHALL 锁定最终的高/低值，停止该周期的实时更新，并存储这些值用于历史分析

### 需求：均值回归信号生成 (Requirement: Mean Reversion Signal Generation)
该策略 SHALL 根据资产相对于周期高低区间（high-low range）的实时价格以及预定义的回归阈值，生成买入和卖出信号。

#### 场景：买入信号触发（价格回归至周期低点）(Scenario: Buy Signal Trigger (Price Reverts to Period Low))
- **WHEN** 在交易时段内，实时价格下跌至高低区间定义的百分比 [X]%（接近低点）并表现出短期上涨动作时
- **THEN** 该策略 SHALL 生成买入信号并触发订单执行模块

#### 场景：卖出信号触发（价格回归至周期高点）(Scenario: Sell Signal Trigger (Price Reverts to Period High))
- **WHEN** 在交易时段内，实时价格上涨至高低区间定义的百分比 [Y]%（接近高点）并表现出短期下跌动作时
- **THEN** 该策略 SHALL 生成卖出信号并触发订单执行模块

#### 场景：无信号（价格处于中间区间）(Scenario: No Signal (Price in Mid-Range))
- **WHEN** 实时价格保持在买入和卖出回归阈值之间时
- **THEN** 该策略 SHALL NOT 生成任何交易信号，并保持中立监测状态

### 需求：信号验证与重复预防 (Requirement: Signal Validation & Duplication Prevention)
该策略 SHALL 包含一个验证层，用于过滤无效或重复的信号，确保每次价格回归事件仅允许产生一个有效信号。

#### 场景：重复信号过滤 (Scenario: Duplicate Signal Filter)
- **WHEN** 已为某次回归事件生成信号，且价格维持在阈值范围内而未出现新的突破时
- **THEN** 该策略 SHALL 拒绝随后的重复信号并记录该尝试

#### 场景：无效信号过滤（异常价格飙升）(Scenario: Invalid Signal Filter (Abnormal Price Spike))
- **WHEN** 阈值是由异常且短暂的价格飙升触发，且没有持续的成交量确认时
- **THEN** 该策略 SHALL 将该信号识别为无效，抑制输出，并记录过滤原因

### 需求：多资产支持与独立监测 (Requirement: Multi-Asset Support & Independent Monitoring)
该策略 SHALL 支持同时对多个资产进行实时监测，每个资产具有独立的周期类型、高低价计算和信号状态。

#### 场景：多资产并行监测 (Scenario: Multi-Asset Parallel Monitoring)
- **WHEN** 策略配置了多个目标资产，且这些资产处于重叠或不同的交易时段时
- **THEN** 该策略 SHALL 为每个资产初始化独立的监测实例，并使用唯一的资产标识符记录数据

### 需求：实时状态日志与指标追踪 (Requirement: Real-Time State Logging & Metrics Tracking)
该策略 SHALL 以标准化的结构化格式记录所有核心状态变更和操作指标，以便进行事后分析和调试。

#### 场景：核心状态日志记录 (Scenario: Core State Logging)
- **WHEN** 发生任何核心事件（如高低价更新、信号触发或周期切换）时
- **THEN** 该策略 SHALL 记录一条结构化日志条目，其中包含事件类型、资产 ID、时间戳、实时价格和周期极端值
