Loaded cached credentials.
Hook registry initialized with 0 hook entries
I will translate the provided requirements into Chinese, preserving all Markdown formatting and technical terms.

## 新增需求

### 需求：Longbridge OpenAPI 身份验证
系统应使用 App Key、App Secret 和 Access Token 通过 Longbridge OpenAPI 进行身份验证。

#### 场景：身份验证成功
- **当** 系统使用有效的 Longbridge 凭据初始化时
- **那么** 它将为 Quote（行情）和 Trade（交易）API 建立持久连接

### 需求：实时市场数据订阅
系统应支持订阅支持的市场（香港、美国、上海、深圳）的实时报价、深度数据和成交明细。

#### 场景：订阅港股报价
- **当** 系统请求订阅“700.HK”（腾讯控股）时
- **那么** 它将通过 WebSocket 连接接收实时价格更新

### 需求：历史数据获取
系统应根据指定的代码、周期和时间范围检索历史 K 线数据。

#### 场景：获取日 K 线用于回测
- **当** 系统请求“AAPL.US”过去一年的日 K 线时
- **那么** 它将接收到一个结构化的 OHLCV 数据点列表

### 需求：实盘订单执行
系统应允许通过 Longbridge Trade API 创建、撤销和修改订单。

#### 场景：提交限价买入订单
- **当** 策略触发“NVDA.US”在 $120.00 买入 100 股的信号时
- **那么** 系统将提交一个限价买入订单，并接收订单 ID 和初始状态

### 需求：实时账户状态同步
系统应通过 Longbridge Trade API 实时同步账户余额、持仓和订单状态。

#### 场景：成交后更新持仓
- **当** 订单在交易所成交时
- **那么** 系统将收到成交通知并立即更新本地持仓状态

### 需求：API 频率限制与安全
系统应严格执行 Longbridge API 的频率限制（例如：交易 API 每 30 秒 30 次调用），并优雅地处理 API 错误。

#### 场景：达到频率限制
- **当** 策略尝试发送超过每 30 秒 30 次限制的订单时
- **那么** 系统将对请求进行排队并延迟执行，以保持在限制范围内
