## ADDED Requirements

### Requirement: 本地 K 线数据持久化
系统应当（SHALL）支持将 K 线数据存储在本地 SQLite 数据库中。

#### Scenario: 成功存储 K 线数据
- **WHEN** 提供一组 K 线数据（symbol, period, timestamp, OHLCV）
- **THEN** 系统将其保存到数据库，并确保 (symbol, period, timestamp) 的唯一性

### Requirement: 按时间区间查询 K 线
系统应当（SHALL）支持高效查询指定代码和时间范围内的 K 线数据。

#### Scenario: 查询特定日期的分钟线
- **WHEN** 请求 "700.HK" 在 2024-01-01 09:30 至 16:00 的 1 分钟线
- **THEN** 系统从本地数据库返回该时间段内所有存在的 K 线数组

### Requirement: 大批量数据分批保存
系统必须（MUST）在保存海量数据时采用分批插入（Chunking）机制，以规避 SQLite 的复合查询限制。

#### Scenario: 同步超过 500 条数据
- **WHEN** 尝试保存 1000 条 K 线数据
- **THEN** 系统将其拆分为每批 200 条进行插入，确保同步过程不中断