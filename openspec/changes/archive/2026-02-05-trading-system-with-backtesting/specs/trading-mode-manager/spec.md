Loaded cached credentials.
Hook registry initialized with 0 hook entries
## 新增需求

### 需求：Environment Isolation
系统应在 backtesting 和 live trading 环境之间保持严格隔离，以防止意外执行实盘操作。

#### 场景：Running a backtest
- **当** 系统处于 "backtest" 模式时
- **那么** 策略在物理上不可能调用实盘 Longbridge Trade API

### 需求：Explicit Mode Switching
系统应要求通过显式配置或命令行标志来启用 live trading 模式。

#### 场景：Switching to live mode
- **当** 用户使用 `--mode live` 启动系统时
- **那么** 系统在初始化 live trading 环境前提示进行最终确认

### 需求：Live Trading Safeguards
系统应实施安全保障措施，例如 order size limits 和强制性 dry-runs，然后才允许全自动实盘执行。

#### 场景：Enforcing max order size
- **当** 一个 live 策略尝试下达超过预设最大规模的订单时
- **那么** 系统拒绝该订单并向用户发出警报

### 需求：Strategy Validation before Deployment
系统应在允许策略以 live 模式运行前对其进行验证检查（例如，验证 parameters）。

#### 场景：Deploying an unvalidated strategy
- **当** 用户尝试在缺少必要 parameters 的情况下以 live 模式运行策略时
- **那么** 系统阻止执行并指明缺失的配置
