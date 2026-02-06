# 更新日志 (Changelog)

本项目的所有重大变更都将记录在此文件中。

## [2026-02-06]

### 新增 (Added)
- **长桥历史数据同步工具**：支持从长桥 OpenAPI 深度抓取并持久化历史 K 线数据。
  - 支持 **秒级高精度分页** 递归回溯，可拉取海量分钟线而不中断。
  - 支持 **多股票批量同步**（通过逗号分隔代码）。
  - 支持 **增量更新 (Upsert)**，自动合并新旧数据，无需删除数据库。
  - 全面支持多种周期：1m, 5m, 15m, 30m, 60m, 1d, 1w, 1mon, 1y。
- **增强型回测引擎**：
  - `BacktestFactory`：支持一键从本地 SQLite 数据库加载数据启动回测。
  - 引入真实的 **胜率 (Win Rate)** 计算逻辑（基于买卖订单对）。
  - 引入动态年化的 **夏普比率 (Sharpe Ratio)** 计算，自动识别分钟/日/周频率。
- **实用脚本工具**：
  - `src/sync-data.ts`：功能强大的命令行同步工具。
  - `src/check-db.ts`：快速查看本地数据库各品种的数据统计。
  - `src/test-db-backtest.ts`：基于数据库回测的示例模板。
- **文档完善**：
  - 更新 `README.md`，增加详尽的同步与回测操作指南。
  - 归档 `backtest-with-longbridge-historical-data` 变更的 OpenSpec 规格。

### 修复 (Fixed)
- **代码匹配 (Symbol Matching)**：修复了系统各层级对带后缀代码（如 "700.HK"）与纯数字代码（如 "700"）识别不一致导致的无法成交问题。
- **数据库性能**：实现大批量数据保存时的分批插入（Chunking），规避了 SQLite 的复合查询项限制。
- **时区处理**：配置 `dayjs` 的时区与 UTC 插件，确保历史时间戳解析的一致性。

## [2026-02-05]

### 新增 (Added)
- **内置交易策略库**：
  - `PercentageStrategy`：基础跌买涨卖百分比策略。
  - 增加 `BollingerBands`, `RSIMomentum`, `MACD`, `DualThrust`, `SMACrossover` 等策略原型。
- **核心框架实现**：
  - 回测引擎基础架构、数据回放器（Data Replayer）与订单模拟器（Order Simulator）。
  - 对接长桥证券 SDK，实现实时行情订阅与交易接口封装。
  - 基础投资组合追踪（PortfolioTracker）与性能分析器（PerformanceAnalyzer）。