Loaded cached credentials.
Hook registry initialized with 0 hook entries
我将把提供的 Markdown 文档翻译成中文，同时保留所有格式、代码块和技术术语。

---

## 上下文 (Context)

目标是构建一个统一的交易系统，该系统集成了用于实盘交易和行情数据的 Longbridge OpenAPI 以及自定义的回测引擎。系统需要支持在回测和实盘交易之间无缝切换，同时保持严格的隔离以防止意外的实盘执行。当前环境对于这个特定项目来说是一张白纸，允许我们从一开始就建立一个健壮的架构。

## 目标 / 非目标 (Goals / Non-Goals)

**目标：**
- 提供一个跨回测和实盘交易工作的统一策略接口。
- 集成 Longbridge OpenAPI 以获取实时数据和执行订单。
- 实现一个模拟引擎，用于带有滑点和佣金模型的精确回测。
- 确保严格的环境隔离（回测 vs 实盘）。
- 支持历史行情数据和交易日志的持久化存储。

**非目标：**
- 构建复杂的 GUI（初期重点是 CLI 和 API）。
- 在初始阶段支持 Longbridge 以外的经纪商。
- 高频交易（延迟受限于 API 和网络限制）。

## 决策 (Decisions)

### 1. 语言和运行时：TypeScript (Node.js)
**理由：** TypeScript 提供了出色的类型安全，这对于金融应用至关重要。Node.js 生态系统拥有成熟的 WebSockets 库（实时行情所需）和数据库交互库。
**考虑过的备选方案：** Python（在数据科学库方面更好，但 TypeScript 在复杂系统集成方面提供了更好的结构安全性）。

### 2. 数据库：用于本地存储的 SQLite
**理由：** SQLite 轻量、无服务器，非常适合本地存储历史 K 线和交易日志。它简化了个人交易者的设置。
**考虑过的备选方案：** PostgreSQL（对于单用户系统来说开销较高），LevelDB（高效但对于复杂查询不够灵活）。

### 3. 模块化架构
**理由：** 将关注点分离到 `longbridge-integration`、`strategy-framework`、`backtesting-engine`、`data-management` 和 `portfolio-tracking` 模块中，便于测试和维护。
**考虑过的备选方案：** 单体架构（难以维护和隔离回测与实盘逻辑）。

### 4. 策略生命周期钩子 (Strategy Lifecycle Hooks)
**理由：** 使用标准的钩子如 `on_init`、`on_data` 和 `on_order_update` 确保策略是事件驱动的，并且在不同环境下保持一致。
**考虑过的备选方案：** 基于轮询的策略逻辑（效率低下且延迟较高）。

### 5. 通过模式管理器进行环境隔离
**理由：** 专门的 `TradingModeManager` 将充当看门人，确保只有在系统显式以“实盘”模式启动并经过用户确认时，`TradeAPI` 接口才可用。
**考虑过的备选方案：** 仅使用环境变量（容易发生意外配置错误）。

## 风险 / 权衡 (Risks / Trade-offs)

- [风险] API 频率限制 → [缓解] 在 `longbridge-integration` 模块中实现请求队列和速率限制器。
- [风险] 意外实盘执行 → [缓解] 显式的模式标志和确认提示；回测与实盘采用物理上不同的提供者实现。
- [风险] 数据不一致 → [缓解] 对历史和实时行情数据使用统一的数据模型（Zod schema）。
- [风险] 网络延迟 → [缓解] 使用 WebSocket 订阅实时数据；异步订单处理。
