# 历史数据同步与回测指南

本系统现在支持从长桥（Longbridge）同步高精度历史 K 线数据到本地 SQLite 数据库，并利用本地数据进行快速回测。

## 1. 同步数据

使用 `src/sync-data.ts` 脚本同步数据。

```bash
# 同步 腾讯控股 (700.HK) 最近 2000 条分钟线
npx ts-node src/sync-data.ts 700.HK 2000

# 同步 美股 特斯拉 (TSLA.US) 最近 1000 条分钟线
npx ts-node src/sync-data.ts TSLA.US 1000
```

数据将存储在 `trading_system.sqlite` 的 `klines` 表中。

## 2. 使用本地数据进行回测

使用 `src/test-db-backtest.ts` 进行基于本地数据库的回测。

```bash
npx ts-node src/test-db-backtest.ts
```

该脚本会：
1. 从数据库读取过去 30 天的 `1m` K 线数据。
2. 初始化回测引擎。
3. 执行 `HighLowReversionStrategy` 策略并输出性能指标。

## 3. 核心组件

- **`DataSyncer`**: 负责与长桥 API 通讯并进行增量同步。
- **`DataManager`**: 负责本地 SQLite 数据库的 CRUD 操作。
- **`BacktestFactory`**: 简化了从数据库加载数据并启动回测的过程。

## 4. 注意事项

- **频率限制**: 长桥 API 每秒限制 10 次调用。`DataSyncer` 已内置 `RateLimiter`。
- **复权**: 系统默认使用**前复权**（AdjustType.ForwardAdjust）。这能确保回测时价格走势的连续性，剔除分红送股导致的“价格断层”。

