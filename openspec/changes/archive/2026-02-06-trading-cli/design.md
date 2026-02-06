## Context

目前系统的操作入口分散且依赖手动配置代码。为了提供一个“长桥证券交易员（Longbridge Trader）”风格的专业体验，需要构建 `lbt` 命令行工具。

## Goals / Non-Goals

**Goals:**
- **混合模式交互**：支持直接通过命令行参数执行（CI/CD 友好），也支持在缺失参数时自动进入 `inquirer` 交互模式（新手友好）。
- **Shell 补全**：支持 Zsh/Bash 的 Tab 自动补全，覆盖命令名、策略名及已同步的股票代码。
- **策略发现**：自动扫描策略目录，实现“编写即发现”。
- **统一生命周期**：统一回测与实盘的启动、运行与资源回收流程。

**Non-Goals:**
- 不涉及 Web GUI 界面。
- 不提供复杂的图表展示（仅限终端文本输出）。

## Decisions

### 1. 核心技术栈
- **框架**：`commander.js` (成熟、灵活、支持子命令)。
- **交互**：`inquirer.js` (用于参数缺失时的询问)。
- **补全**：`omelette` (轻量级且强大的 Shell 补全库)。
- **颜色/展示**：`chalk` + `cli-table3`。

### 2. 自动补全实现 (omelette)
- **静态补全**：命令名（list, backtest, live, sync）。
- **动态补全**：
  - 策略名：扫描 `src/modules/strategy-framework/*.ts` 文件并提取类名。
  - 股票代码：查询 SQLite 数据库 `klines` 表中的 `distinct symbol`。

### 3. 策略动态加载逻辑
- 约定优于配置：所有策略必须位于 `strategy-framework/` 目录下。
- 引入 `StrategyRegistry` 类：通过 `fs.readdir` 结合 `require/import` 动态实例化策略类。

### 4. 命令结构设计
- `lbt list`: 显示策略列表及简要描述。
- `lbt sync <symbols> [days] [period]`: 增量同步数据。
- `lbt backtest [strategy] [symbol]`: 
  - 若未指定 strategy，则弹出列表供选择。
  - 自动加载本地数据并运行。
- `lbt live [strategy] [symbol]`: 
  - 运行前进行二次确认（包含账户信息展示）。

## Risks / Trade-offs

- **[Risk] 补全性能** → **Mitigation**: 动态补全股票代码时，如果数据库海量，查询可能变慢。通过对 `symbol` 字段加索引并限制补全返回前 N 个来优化。
- **[Risk] 全局安装冲突** → **Mitigation**: 在 `package.json` 中配置唯一的 `bin: { "lbt": "./dist/cli/index.js" }`。
- **[Risk] 类型安全** → **Mitigation**: 使用 `ts-node` 或预编译 JS 运行，确保 CLI 层能够正确解析策略类的构造参数类型。
