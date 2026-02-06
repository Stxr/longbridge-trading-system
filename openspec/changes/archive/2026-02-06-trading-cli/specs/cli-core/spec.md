## ADDED Requirements

### Requirement: 基础命令结构
系统应当（SHALL）提供名为 `lbt` 的根命令，并支持 `list`, `sync`, `backtest`, `live` 四个核心子命令。

#### Scenario: 运行 lbt --help
- **WHEN** 用户在终端输入 `lbt --help`
- **THEN** 系统显示所有可用命令及简要描述

### Requirement: 版本查看
系统应当（SHALL）支持通过 `-V` 或 `--version` 查看当前版本。

#### Scenario: 运行 lbt -V
- **WHEN** 用户输入 `lbt -V`
- **THEN** 系统打印当前 package.json 中定义的版本号
