## MODIFIED Requirements

### Requirement: 基础命令结构
系统应当（SHALL）提供名为 `lbt` 的根命令，并支持 `list`, `sync`, `backtest`, `live`, `web` 五个核心子命令。

#### Scenario: 运行 lbt --help
- **WHEN** 用户在终端输入 `lbt --help`
- **THEN** 系统显示所有可用命令及简要描述

## ADDED Requirements

### Requirement: 启动 Web 面板
系统应当（SHALL）支持通过 `lbt web` 命令启动 Web 后端服务并自动在默认浏览器中打开前端面板。

#### Scenario: 运行 lbt web
- **WHEN** 用户在终端输入 `lbt web`
- **THEN** 系统启动 Express 后端服务，监听默认端口（如 3000），并尝试调用系统默认浏览器打开 `http://localhost:3000`
