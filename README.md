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
- **可视化交易面板**：基于 React + Express 构建的图形化 Web 界面，支持 K 线回测展示、资金曲线分析及实时行情监控。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install
# 安装 Web 前端依赖并构建
cd web && npm install && npm run build && cd ..
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件，并填写您的长桥证券 API 配置：

```env
LONGPORT_APP_KEY=your_app_key
LONGPORT_APP_SECRET=your_app_secret
LONGPORT_ACCESS_TOKEN=your_access_token
```

## 📊 命令行工具 (lbt CLI)

本系统提供了一个名为 `lbt` 的命令行工具，极大地简化了日常操作。

### 1. 安装与初始化

首先确保已安装项目依赖，然后执行 link 命令：

```bash
npm install
npm link
```

### 2. 启用自动补全 (重要)

`lbt` 支持强大的 Shell 自动补全（Bash, Zsh, Fish）。

**Bash/Zsh 用户**：
运行以下命令并按照提示操作：
```bash
lbt --completion
```

**Fish 用户**：
运行以下命令以自动安装补全脚本：
```fish
mkdir -p ~/.config/fish/completions
lbt --completion-fish > ~/.config/fish/completions/lbt.fish
```
*注：重启终端或运行 `source ~/.config/fish/config.fish` 后生效。*

### 3. 常用命令

- **列出策略**：`lbt list`
- **同步数据**：`lbt sync 700.HK 1000 1m`
- **回测策略**：`lbt backtest` (不带参数将进入交互模式)
- **启动 Web 面板**：`lbt web` (一键启动可视化分析界面)
- **实盘交易**：`lbt live` (包含风险确认)

## 🖥 Web 交易面板

本系统新增了强大的 Web 可视化工具，只需一行命令即可开启。

### 1. 启动服务
```bash
lbt web
```
执行后，系统将自动启动 Express 后端服务器并打开浏览器。

### 2. 核心功能
- **智能回测配置**：根据策略代码动态生成参数表单，支持设置初始资金、时间范围及 K 线周期（1m ~ 1mo）。
- **专业图表展示**：集成 `lightweight-charts`，在 K 线图上直观标注买入/卖出点位。
- **资产表现分析**：实时计算收益率、胜率、最大回撤，并绘制资产净值（Equity）变化曲线。
- **自动化同步**：回测时若本地数据库缺少对应时间段数据，Web 后端会自动触发长桥接口同步，无需手动操作。
- **实时监控**：通过 WebSocket 流式接收实盘行情，并在网页端实时刷新。

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