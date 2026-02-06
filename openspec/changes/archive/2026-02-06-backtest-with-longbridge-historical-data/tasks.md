## 1. 基础设施准备

- [x] 1.1 安装 SQLite 及其驱动依赖（如 `better-sqlite3`）
- [x] 1.2 在 `src/modules/data-management` 下创建数据库管理类 `Database`
- [x] 1.3 设计并执行 `klines` 表的建表语句（DDL）

## 2. 数据持久化实现 (historical-data-storage)

- [x] 2.1 实现 `KLineRepository` 用于 K 线数据的插入和批量保存
- [x] 2.2 实现按 `symbol`, `period`, `startTime`, `endTime` 查询本地数据的接口
- [x] 2.3 编写单元测试验证数据库的读写和唯一约束

## 3. 长桥数据同步器 (longbridge-data-syncer)

- [x] 3.1 在 `QuoteProvider` 中增强 `getHistoryCandlesticks` 以支持更灵活的参数
- [x] 3.2 实现 `DataSyncer` 类，负责计算时间差并调用 API 补全缺失数据
- [x] 3.3 在 `DataSyncer` 中集成频率限制逻辑，确保每秒不超过 10 次请求
- [x] 3.4 编写一个独立的同步脚本 `src/sync-data.ts`，方便通过命令行触发同步

## 4. 回测引擎对接 (backtesting-engine)

- [x] 4.1 修改 `DataReplayer` 或相关工厂类，支持从数据库初始化 K 线数据
- [x] 4.2 更新回测入口脚本，允许用户选择“从长桥实时获取”或“从本地数据库加载”数据源
- [x] 4.3 验证使用本地数据库后的回测启动速度提升

## 5. 验证与优化

- [x] 5.1 进行一次完整的“同步 -> 存储 -> 回测”流程验证
- [x] 5.2 优化数据库索引（如果查询速度仍有提升空间）
- [x] 5.3 编写简要的操作指南，说明如何下载指定股票的历史数据
