## Why

目前系统的回测功能依赖于内存中的模拟数据或单次实时获取的数据。为了提高回测的效率、稳定性和数据覆盖面，我们需要：
1. **利用长桥官方数据**：直接使用长桥 OpenAPI 提供的历史 K 线数据，确保回测环境与实盘行情的一致性。
2. **克服频率限制**：长桥 API 有严格的频率限制（10次/秒），通过将数据持久化到本地数据库，可以支持更快速、更复杂的策略回测和参数优化。
3. **完善回测流程**：建立“获取数据 -> 存储数据 -> 回放数据”的标准回测流水线。

## What Changes

- **数据获取层**：增强 `QuoteProvider`，支持分片拉取深度历史数据，支持 `NaiveDatetime` 级的高精度分页。
- **持久化层**：在 `data-management` 模块中实现基于 SQLite 的历史 K 线存储功能，支持分批次（Chunked）保存海量数据。
- **回测引擎对接**：更新回测启动逻辑，支持从本地数据库加载数据并喂给 `DataReplayer`。
- **命令行工具**：提供功能强大的 `src/sync-data.ts` 脚本，支持多股票同时同步、增量更新及多种时间周期选择。

## Capabilities

### New Capabilities
- `historical-data-storage`: 实现本地 K 线数据的存储、查询和管理（CRUD）。支持分批插入以优化 SQLite 性能。
- `longbridge-data-syncer`: 实现从长桥 API 增量拉取并同步历史数据到本地存储的逻辑。支持多股票循环同步和基于时间戳的深度回溯。

### Modified Capabilities
- `backtesting-engine`: 扩展数据加载逻辑，使其能够根据配置从本地存储获取 `KLine[]` 进行回放。

## Impact

- **依赖项**：引入 SQLite 相关依赖（如 `sqlite3` 或 `better-sqlite3`）。
- **模块关系**：`backtesting-engine` 现在将可选地依赖于 `data-management` 提供的本地数据。
- **存储空间**：本地磁盘将用于存储 K 线数据，需考虑存储容量和索引优化。
