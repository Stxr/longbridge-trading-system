## 1. 项目初始化与环境搭建

- [x] 1.1 在 `src/web/` 创建后端目录结构，并初始化 `express` 基础框架
- [x] 1.2 在根目录创建 `web/` 目录，并使用 `vite` 初始化 React + Tailwind CSS 前端项目
- [x] 1.3 安装核心依赖：后端 `express`, `socket.io`；前端 `lightweight-charts`, `socket.io-client`, `axios`, `zustand`
- [x] 1.4 配置 `tsconfig.json` 以支持新目录的类型检查

## 2. 后端 API 开发 (Express)

- [x] 2.1 实现 `GET /api/strategies` 接口，调用 `StrategyLoader` 返回可用策略列表
- [x] 2.2 实现 `POST /api/backtest` 接口，封装 `BacktestEngine` 异步执行回测
- [x] 2.3 集成 `Socket.io`，实现实盘交易数据的实时流转
- [x] 2.4 实现静态资源托管，使 Express 能在生产环境下提供前端构建产物

## 3. 前端面板开发 (React)

- [x] 3.1 搭建基础布局（Layout），包含导航栏和侧边栏
- [x] 3.2 实现策略选择与参数配置表单
- [x] 3.3 集成 `lightweight-charts` 实现高性能 K 线图表
- [x] 3.4 在图表上实现买卖点（markers）的可视化渲染
- [x] 3.5 实现资金曲线图（Equity Curve）展示回测表现
- [x] 3.6 实现实盘监控页面，通过 WebSocket 接收并展示实时持仓与余额

## 4. CLI 集成与工具链

- [x] 4.1 在 `src/cli/` 中注册 `web` 命令
- [x] 4.2 实现 `lbt web` 命令逻辑：启动后端服务器并调用 `open` 库打开浏览器
- [x] 4.3 编写构建脚本，确保 `npm run build` 能同时处理前端构建和产物同步

## 5. 测试与验证

- [x] 5.1 验证回测流程的可视化闭环
- [x] 5.2 验证 WebSocket 在实盘监控中的稳定性
- [x] 5.3 运行 `lbt web` 确保全流程一键启动成功
