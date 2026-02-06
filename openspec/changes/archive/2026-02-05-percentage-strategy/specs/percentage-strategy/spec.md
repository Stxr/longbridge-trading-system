Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 新增需求

### 需求：基于 5% 价格变化的信号生成
系统 SHALL 监控实时行情，并在价格较参考点下跌 5% 时生成一个 BUY 信号，并在价格较参考点上涨 5% 时生成一个 SELL 信号。

#### 场景：价格下跌 5%
- **WHEN** 当前价格为 $95.00 且参考入场价格为 $100.00
- **THEN** 系统生成一个 BUY 信号

#### 场景：价格上涨 5%
- **WHEN** 当前价格为 $105.00 且参考入场价格为 $100.00
- **THEN** 系统生成一个 SELL 信号

### 需求：实时订单触发
系统 SHALL 在接收到策略信号时，自动向 Longbridge Trade API 提交一个 limit 或 market order。

#### 场景：根据信号提交买入订单
- **WHEN** 生成一个 BUY 信号
- **THEN** 系统使用配置的 quantity 和 market symbol 调用 `submitOrder` 方法

### 需求：信号与执行日志记录
系统 SHALL 记录每一个生成的信号和产生的 order status，以便于审计和验证。

#### 场景：记录卖出信号
- **WHEN** 触发一个 SELL 信号
- **THEN** 系统写入一条包含 timestamp、symbol、trigger price 和 signal type 的日志条目
