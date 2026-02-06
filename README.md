# Longbridge Trading System (长桥证券自动化交易系统) 🧧

这是一个基于 [Longport SDK](https://open.longportapp.com/docs) 开发的自动化交易框架，采用 TypeScript 编写，支持多策略并行、回测引擎以及实盘交易模式。

## 🌟 核心特性

- **多策略框架**：提供 `BaseStrategy` 基类，轻松扩展自定义交易策略。
- **内置常用策略**：
  - `HighLowReversionStrategy`: 高低点回归策略（支持滑点容差与价格动作确认）。
  - `SMACrossoverStrategy`: 均线交叉策略。
  - `BollingerBandsStrategy`: 布林带策略。
  - `RSIMomentumStrategy`: RSI 动量策略。
  - `MACDStrategy`: MACD 指标策略。
  - `DualThrustStrategy`: Dual Thrust 区间突破策略。
- **完善的回测系统**：内置数据回放（Data Replayer）与订单模拟（Order Simulator），支持使用历史 K 线进行策略验证。
- **实盘/仿真支持**：对接长桥证券 OpenAPI，支持实时行情订阅与订单下达。
- **数据持久化**：使用 SQLite (Knex.js) 记录历史行情与交易日志。
- **环境隔离**：支持 `.env` 配置，通过环境变量管理 API Key 与交易参数。

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

### 3. 运行项目

- **实盘模式**：
  ```bash
  npm start
  ```
- **回测模式**：
  ```bash
  npm run start:backtest
  ```

## 📂 项目结构

- `src/modules/strategy-framework/`: 交易策略实现核心。
- `src/modules/backtesting-engine/`: 回测引擎，包含订单模拟逻辑。
- `src/modules/longbridge-integration/`: 与长桥证券 SDK 的集成封装。
- `src/modules/data-management/`: 数据库与数据持久化逻辑。
- `src/shared/`: 共享模型与工具类。

## 🛠 开发扩展

您可以继承 `src/modules/strategy-framework/base-strategy.ts` 并实现 `onData` 或 `onQuote` 方法来创建自己的策略。

```typescript
export class MyStrategy extends BaseStrategy {
  async onData(kline: KLine): Promise<void> {
    // 在这里编写您的逻辑
  }
}
```

## 📄 开源协议

本项目采用 ISC 协议。

---

*祝老板：招财进宝，代码零 Bug！* 🧧
