# mock-api

基于 Express + TypeScript 的轻量级 Mock API 服务，支持自动递归加载 `routes` 目录下所有路由文件。

## 特性

- **自动路由加载**：递归扫描 `routes` 目录及其子目录下的所有 `.ts` 文件，自动注册为 Express 路由
- **TypeScript 原生支持**：开发时使用 `tsx` 直接运行，无需预编译
- **局域网 IP 提示**：启动时自动获取本机局域网 IP，方便同网段设备调试

## 技术栈

- [Express](https://expressjs.com/) — Web 框架
- [TypeScript](https://www.typescriptlang.org/) — 类型安全
- [tsx](https://github.com/privatenumber/tsx) — 开发时直接运行 TypeScript

## 项目结构

```
mock-api/
├── index.ts          # 入口：启动 Express 服务，自动加载路由
├── routes/           # 路由目录（支持任意层级子目录）
│   └── test/
│       ├── login.ts
│       └── userInfo.ts
├── package.json
└── tsconfig.json
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后控制台会输出局域网访问地址，例如：

```
访问地址: http://192.168.1.20:3000
```

### 构建

```bash
npm run build
```

编译后的文件输出到 `dist/` 目录。

### 生产运行

```bash
npm start
```

## 添加新接口

在 `routes/` 目录下（或任意子目录中）新建 `.ts` 文件，按以下格式导出路由对象即可自动注册：

```ts
import type { Request, Response } from 'express'

export default {
    method: 'get',                      // HTTP 方法
    path: '/api/example',               // 接口路径
    handler: (req: Request, res: Response) => {
        res.json({
            code: 200,
            data: { message: 'Hello' }
        })
    }
}
```

支持的 `method`：`get`、`post`、`put`、`delete`、`patch`

## 部署

构建产物位于 `dist/` 目录，部署时需同时上传：

```
dist/
package.json
package-lock.json
```

然后在服务器上执行：

```bash
npm ci --omit=dev
node dist/index.js
```

或使用 PM2：

```bash
pm2 start dist/index.js --name mock-api
```
