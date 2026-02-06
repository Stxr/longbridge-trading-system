# interactive-runner Specification

## Purpose
TBD - created by archiving change trading-cli. Update Purpose after archive.
## Requirements
### Requirement: 交互式参数填充
当命令行缺失必要参数时，系统应当（SHALL）引导用户通过交互式界面（Inquirer）进行选择。

#### Scenario: 交互式启动回测
- **WHEN** 运行 `lbt backtest` 且不带参数
- **THEN** 系统先询问“选择策略”，再询问“选择股票代码”，最后执行

