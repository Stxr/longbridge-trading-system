# Longbridge Trading System (长桥证券自动化交易系统) 🧧

这是一个基于 [Longport SDK](https://open.longportapp.com/docs) 开发的自动化交易框架，采用 TypeScript 编写，支持多策略并行、回测引擎以及实盘交易模式。

## 🌟 核心特性

- **数据持久化与深度同步**：支持从长桥 API 深度拉取海量历史 K 线，并利用 SQLite 进行本地持久化存储。
- **专业级回测引擎**：
  - 支持 **DB 回测**（秒级加载本地数据）与 **实时回测**（拉取最新行情）。
  - 内置真实的 **胜率 (Win Rate)** 与 **动态年化夏普比率 (Sharpe Ratio)** 计算。
  - 支持滑点容差、佣金建模与 FIFO 订单撮合。
- **多策略框架**：内置高低点回归、均线交叉、布林带、RSI、MACD、Dual Thrust 等多种经典策略。
- **实盘/仿真支持**：对接长桥证券 OpenAPI，支持实时行情订阅与订单下达。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件，并填写您的长桥证券 API 配置：

```env
LONGPORT_APP_KEY=your_app_key
LONGPORT_APP_SECRET=your_app_secret
LONGPORT_ACCESS_TOKEN=your_access_token
```

## 📊 数据同步工具

使用 `src/sync-data.ts` 可以将长桥的历史行情下载到本地，支持增量更新和多股票批量同步。

**命令格式：**
```bash
npx ts-node src/sync-data.ts <股票代码> <数量或起始时间> <周期>
```

**常见用法：**
- **同步多个股票的日线**：
  ```bash
  npx ts-node src/sync-data.ts "700.HK, 9988.HK, TSLA.US" 100 1d
  ```
- **拉取特定时间段至今的分钟线**（自动分页递归回溯）：
  ```bash
  npx ts-node src/sync-data.ts "700.HK" 2026-01-01 1m
  ```
- **同步最近 5000 条分钟线**：
  ```bash
  npx ts-node src/sync-data.ts "700.HK" 5000 1m
  ```

## 🧪 回测运行

本系统提供两种回测模式，以平衡速度与实时性。

### 1. 本地数据库回测 (推荐)
适用于大规模参数优化，直接读取本地 SQLite 数据，速度极快。
```bash
npx ts-node src/test-db-backtest.ts
```
*注：运行前请确保已使用同步工具下载了对应股票的数据。*

### 2. API 实时回测
直接从长桥 API 拉取最近 N 条数据进行回测，无需提前同步。
```bash
npx ts-node src/test-real-backtest.ts
```

### 3. 查看数据统计
快速查看本地数据库中已存数据的范围和数量：
```bash
npx ts-node src/check-db.ts
```

## 📂 项目结构

- `src/modules/strategy-framework/`: 交易策略实现核心。
- `src/modules/backtesting-engine/`: 回测引擎，包含订单模拟、撮合与工厂类。
- `src/modules/data-management/`: 数据库存储 (DataManager)、深度同步器 (DataSyncer)。
- `src/modules/performance-analytics/`: 性能指标计算（收益率、回撤、胜率、夏普比率）。
- `src/modules/longbridge-integration/`: 长桥 SDK 封装。

## 🛠 开发扩展

您可以继承 `src/modules/strategy-framework/base-strategy.ts` 并实现 `onData` 方法。系统会自动处理 symbol 匹配与数据分发。

```typescript
export class MyStrategy extends BaseStrategy {
  async onData(kline: KLine): Promise<void> {
    // 您的逻辑
  }
}
```

## 📄 开源协议

本项目采用 ISC 协议。

---

*祝老板：招财进宝，代码零 Bug！* 🧧