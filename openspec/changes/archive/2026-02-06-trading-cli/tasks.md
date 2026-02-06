## 1. 基础环境搭建

- [x] 1.1 安装依赖：`commander`, `inquirer`, `omelette`, `chalk`, `cli-table3`
- [x] 1.2 在 `src/cli` 目录下创建入口文件 `index.ts`
- [x] 1.3 在 `package.json` 中配置 `bin: { "lbt": "..." }` 并执行 `npm link`

## 2. 策略发现与动态加载

- [x] 2.1 实现 `StrategyLoader` 类，用于扫描 `src/modules/strategy-framework` 并提取策略元数据
- [x] 2.2 实现策略实例化工厂，支持根据名称动态创建策略对象

## 3. 自动补全逻辑实现 (auto-completion)

- [x] 3.1 集成 `omelette` 基础框架
- [x] 3.2 实现针对 `lbt` 各级命令的静态补全逻辑
- [x] 3.3 实现动态补全：从数据库提取 `symbol` 列表作为补全选项

## 4. 核心命令开发

- [x] 4.1 开发 `lbt list` 命令：格式化输出可用策略及描述
- [x] 4.2 开发 `lbt sync` 命令：封装现有的数据同步逻辑
- [x] 4.3 开发 `lbt backtest` 命令：支持混合模式交互（参数/列表选择）
- [x] 4.4 开发 `lbt live` 命令：包含风控确认逻辑和账户状态展示

## 5. 体验优化与验证

- [x] 5.1 优化 CLI 的颜色输出和表格展示样式
- [x] 5.2 编写 CLI 安装与使用指南（集成到 README）
- [x] 5.3 验证所有子命令的 Tab 补全功能在 Zsh/Bash 下正常工作
