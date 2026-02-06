## ADDED Requirements

### Requirement: Shell 补全集成
系统应当（SHALL）集成 `omelette` 库，支持生成针对 Bash/Zsh 的补全脚本。

#### Scenario: 初始化补全
- **WHEN** 用户运行 `lbt --completion`
- **THEN** 系统输出可注入 Shell 配置文件的补全逻辑

### Requirement: 动态参数补全
系统应当（SHALL）能够根据当前数据库状态动态补全股票代码。

#### Scenario: 补全 symbol 参数
- **WHEN** 用户在 `lbt backtest [TAB]` 时
- **THEN** 系统从 SQLite 数据库加载已有的 symbol 列表作为备选项
