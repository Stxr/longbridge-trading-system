## 为什么 (Why)

目前系统的操作依赖于修改代码或运行零散的 `ts-node` 脚本（如 `sync-data.ts`, `test-db-backtest.ts`），缺乏统一的入口。为了提升用户体验和操作效率，我们需要一个专业的命令行工具（CLI），实现：
1. **统一入口**：集成同步、回测、实盘等所有核心功能。
2. **交互性**：通过自动补全（Tab Completion）降低记忆负担，快速选择股票代码和策略名称。
3. **专业化**：模仿 `geminicli` 等工具的现代交互体验。

## 变更内容 (What Changes)

- **CLI 框架**：引入 `commander` 或 `oclif` 搭建基础架构，并将工具命名为 `lbt`。
- **自动补全**：集成自动补全机制（如 `omelette`），支持对策略名、股票代码的动态补全。
- **功能集成**：
  - `lbt list`: 显示所有可用策略。
  - `lbt backtest`: 交互式或参数化启动回测。
  - `lbt live`: 启动指定策略的实盘交易。
  - `lbt sync`: 集成现有的数据同步功能。
- **打包配置**：配置 `package.json` 的 `bin` 字段，支持全局安装。

## 功能点 (Capabilities)

### 新增功能 (New Capabilities)
- `cli-core`: 实现 `lbt` 基础命令解析与配置加载。
- `auto-completion`: 实现 Shell 级别的 Tab 自动补全逻辑。
- `strategy-discovery`: 动态扫描 `src/modules/strategy-framework` 目录并列出策略。
- `interactive-runner`: 提供交互式的策略启动界面（支持 Inquirer.js）。

### 修改功能 (Modified Capabilities)
- `trading-mode-manager`: 增强启动接口，以更好地适配 CLI 调用的生命周期管理。

## 影响 (Impact)

- **依赖项**：新增 `commander`, `omelette` (或同类补全库), `inquirer` 等。
- **项目结构**：新增 `src/cli/` 目录存放命令实现。
- **安装流程**：用户可以通过 `npm link` 将 `lbt` 注册到系统路径。
