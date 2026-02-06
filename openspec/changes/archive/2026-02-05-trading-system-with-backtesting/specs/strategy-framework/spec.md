Loaded cached credentials.
Hook registry initialized with 0 hook entries
I will translate the provided requirements into Chinese, ensuring that all Markdown formatting and technical terms remain intact.

### 需求：统一策略接口 (Unified Strategy Interface)
系统应提供一个基础策略接口，允许用户实现自定义交易逻辑。

#### 场景：实现一个简单的均线交叉 (MA crossover) 策略
- **当** 用户定义一个继承自基础策略的类时
- **那么** 他们可以重写生命周期方法来实现入场和出场规则

### 需求：策略生命周期钩子 (Strategy Lifecycle Hooks)
系统应在执行期间执行策略生命周期钩子（例如：`on_init`、`on_data`、`on_order_update`、`on_stop`）。

#### 场景：处理新行情数据
- **当** 接收到新的行情数据（例如：一条新的 K 线）时
- **那么** 系统调用当前活跃策略的 `on_data` 钩子

### 需求：跨环境策略复用性 (Cross-Environment Strategy Reusability)
为回测开发的策略应在无需修改代码的情况下，直接在实盘交易中执行。

#### 场景：将回测过的策略部署到实盘
- **当** 用户使用相同的策略类，将交易模式从 "backtest"（回测）切换到 "live"（实盘）时
- **那么** 策略将与 Longbridge Trade API 交互，而不是模拟引擎

### 需求：策略参数配置 (Strategy Parameter Configuration)
系统应支持通过配置文件或初始化参数来配置策略参数（例如：移动平均线周期）。

#### 场景：优化策略参数
- **当** 用户使用不同的参数值初始化策略时
- **那么** 策略在其执行生命周期中使用这些值
