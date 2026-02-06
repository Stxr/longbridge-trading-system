Loaded cached credentials.
Hook registry initialized with 0 hook entries
# 修订文档（增强实盘交易能力及与 backtesting 的集成）

## 缘由
量化交易者和算法交易爱好者需要一个灵活、可扩展的系统，利用真实市场数据来**开发、测试、进行 backtesting 并执行 live trades** —— 并且在 backtesting 验证与 live trading 部署之间拥有无缝的工作流。目前，尚无统一的解决方案能够将用于端到端市场数据和 live trading 执行的 Longbridge API 与支持可插拔 strategy 的强大 backtesting 引擎集成在一起。该系统将通过允许用户针对历史数据进行多个 strategy 的 backtest，然后以最少的配置将验证过的 strategy 直接部署到 live markets，同时保持对 live trading 活动的全面控制和实时监督，从而实现数据驱动的交易决策。

## 变更内容
- 从零开始构建一个新的交易系统，支持**基于 strategy 的端到端 backtesting 和 live trading**，并在两者之间提供无缝的模式切换
- 与 Longbridge OpenAPI 集成，获取全生命周期的市场数据（实时行情、历史数据）以及进行 **live order 执行与管理**
- 实现一个可插拔的 strategy framework，允许用户定义在 backtesting 和 live trading 环境中一致运行的自定义交易 strategy
- 创建一个 backtesting 引擎，能够回放历史市场数据，使用可配置的 slippage/commission 模型模拟订单执行，并镜像 live trading 规则以进行准确的 strategy 验证
- 提供统一的 portfolio 追踪和 performance analytics，汇总来自 **backtested 模拟和 live trading 活动**的数据
- 为 backtesting 和 live trading 支持多个市场（港股/ETF、美股/ETF/期权、 A 股）
- 使用 TypeScript 以确保类型安全和现代开发实践，如果需要 Python 组件，则使用 UV 进行 Python 环境管理
- 增加 live trading 风控机制，以符合 Longbridge API 的限制，并防止非预期的 live order 执行

## 功能

### 新增功能
- `longbridge-integration`：与 Longbridge OpenAPI 全面集成，用于身份验证、市场数据获取（行情、历史数据）、**live order 执行/管理（创建、取消、查询、修改订单）**以及 live trading 账户状态的实时同步；实施 API 速率限制和错误处理，以确保 live trading 的稳定性
- `strategy-framework`：具有统一 base strategy 接口、生命周期钩子（on_data、on_order_filled、on_live_trade_trigger 等）以及内置示例 strategy（移动平均线交叉、均值回归等）的可插拔 strategy framework —— **为 backtesting 开发的 strategy 无需修改代码即可直接用于 live trading**
- `backtesting-engine`：回放历史市场数据、使用可配置的 slippage/commission 模型模拟订单执行、追踪随时间变化的 portfolio 状态，并镜像 live trading 规则/约束的 backtesting 引擎，以确保 backtest 结果能够代表真实世界的表现
- `data-management`：支持不同时间周期（1min、5min、日线等）的历史市场数据存储、检索和缓存系统；统一历史（backtesting）和实时（live trading）市场数据的数据模型，以确保跨环境的一致性
- `portfolio-tracking`：针对 backtesting 模拟和 live trading 的**统一实时 portfolio 状态管理** —— 追踪仓位、现金余额、已实现/未实现 P&L、交易历史，以及从 Longbridge API 同步的 live trading 账户指标（保证金、购买力）
- `performance-analytics`：全面的 performance 指标计算，包括 Sharpe ratio、maximum drawdown、胜率、总回报和风险调整后收益；支持对 **backtested 结果和 live trading 表现**进行 strategy 并排比较，并提供用于跨环境分析的统一报告
- `trading-mode-manager`：轻量级模式切换机制（backtest/live），环境之间严格隔离，以防止在 backtesting 期间发生意外的 live order 执行；包括部署前的 live trading 确认提示和 strategy 验证检查

### 修改的功能
<!-- 暂无现有功能被修改 -->

## 影响

- **新增依赖**：
  - Longbridge OpenAPI SDK (TypeScript 或 Python SDK) —— 用于完整的 live trading 和市场数据集成
  - 用于历史数据存储的数据库（简单的使用 SQLite，或为了扩展性使用 PostgreSQL）—— 存储历史市场数据和 live trading 交易/portfolio 历史
  - 测试框架（TypeScript 使用 Jest 或 Python 使用 pytest）—— 包括针对 backtesting 逻辑和 live trading API 集成的测试套件
  - 用于 performance 图表的数据可视化库（可选）—— 并排可视化 backtested 和 live trading 的 performance 指标
  - 环境配置与密钥管理工具 —— 确保 Longbridge API 凭据的安全，并区分 backtest/live 环境设置

- **项目结构**：采用模块化架构的新 TypeScript/Node.js 项目（或使用 UV 进行环境管理的 Python 项目），分离关注点（API 集成、strategy 执行、backtesting、数据管理、**live trading 风控**）；backtest 和 live trading 代码模块之间严格隔离，以最小化执行风险

- **配置管理**：API 凭据（Longbridge API token/secret）、strategy 参数、backtesting 设置、**live trading 风险限制**和市场数据源将需要特定于环境的配置文件（dev/backtest/live），并为 live trading 凭据提供加密密钥存储

- **速率限制**：必须严格遵守 Longbridge API 速率限制（Quote API：最多 500 个并发订阅，10 次调用/秒；Trade API：30 次调用/30 秒，最小间隔 0.02s）并为 live trading 实现速率限制/请求排队，以避免 API 封禁并确保订单执行的可靠性

- **开发环境**：使用 tsconfig、ESLint 和通过 npm/yarn/pnpm 进行适当包管理的 TypeScript 开发设置（或使用 UV 进行依赖管理的 Python）；包括用于 backtesting 和 live trading 的独立开发环境，live trading 的访问权限仅限于授权开发人员

- **Live Trading 风险与执行保障**：实施额外的开发和运行时保障措施 —— 包括 live 部署前的 strategy dry-run、订单大小限制、市场条件过滤以及实时 live trading 活动日志/告警 —— 以减轻非预期或错误的 live order 执行风险
