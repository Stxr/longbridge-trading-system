# strategy-discovery Specification

## Purpose
TBD - created by archiving change trading-cli. Update Purpose after archive.
## Requirements
### Requirement: 策略自动发现
系统应当（SHALL）自动扫描 `src/modules/strategy-framework` 目录，识别并加载所有继承自 `BaseStrategy` 的类。

#### Scenario: 列出策略
- **WHEN** 运行 `lbt list`
- **THEN** 系统显示当前目录中找到的所有策略类名

