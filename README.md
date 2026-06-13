# Personal Mock API

个人轻量化 Mock API 工具，基于当前目录里的《个人轻量化Mock API平台落地方案（自用极速版）》收敛实现。

当前版本优先保证自用、轻量、可运行：

- TypeScript + Node.js 22
- Node 内置 `node:sqlite`，不依赖独立数据库服务
- 无 Express、无 Redis、无权限系统、无团队功能
- 一个管理页面完成接口新增、编辑、删除
- 支持接口分类，左侧接口列表按分类分组
- 支持同 URL 多接口，通过 header/query/body/rawBody 匹配规则分流
- 支持 `mock` 和 `proxy` 两种模式
- 支持 CORS、响应延迟、状态码、请求日志
- 支持少量模板变量

## 环境要求

- Node.js `>=22.16.0`
- npm `>=10`

## 安装

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

访问：

```text
http://localhost:13000
```

Mock 接口统一前缀：

```text
http://localhost:13000/mock/*
```

例如默认接口：

```text
http://localhost:13000/mock/hello?page=1
```

## 生产运行

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t personal-mock-api .
docker run -d --name personal-mock-api -p 13000:13000 -v "$PWD/data:/app/data" personal-mock-api
```

## 数据文件

SQLite 数据库会自动创建在：

```text
data/mock.db
```

这个文件可以直接备份、迁移。`data/` 已加入 `.gitignore`。

## 项目结构

```text
src/
  server.ts              # 启动入口
  config.ts              # 端口、目录、数据库路径
  errors.ts              # HTTP 错误类型
  types.ts               # 核心类型
  db/                    # SQLite 初始化和数据访问
  http/                  # HTTP 路由、请求读取、响应、静态文件
  mock/                  # Mock 模板和代理转发
  utils/                 # 通用工具函数
public/                  # 管理页面静态资源
data/                    # SQLite 数据文件，本地生成
```

## 分类

系统会自动创建一个“默认分类”。旧数据启动后会自动迁移到默认分类。

管理页面支持：

- 新增分类
- 重命名分类
- 删除分类，分类下接口会移动到默认分类
- 新增或编辑接口时选择分类
- 在接口列表上方选择分类，只展示该分类下的接口

## 模板变量

Mock 响应里可以使用：

```text
{{uuid}}
{{timestamp}}
{{now}}
{{randomInt(1,100)}}
{{query.page}}
{{body.name}}
```

示例：

```json
{
  "id": "{{uuid}}",
  "page": "{{query.page}}",
  "createdAt": "{{now}}"
}
```

## 匹配规则

同一个 `method + path` 可以创建多个接口，通过“匹配规则”决定命中哪一个。

JSON 网关接口示例：

```json
[
  {
    "source": "body",
    "path": "type",
    "operator": "equals",
    "value": "createUser"
  }
]
```

嵌套 JSON 字段：

```json
[
  {
    "source": "body",
    "path": "data.bizCode",
    "operator": "equals",
    "value": "ORDER_CREATE"
  }
]
```

SOAP/XML 文本匹配：

```json
[
  {
    "source": "rawBody",
    "operator": "contains",
    "value": "<queryUser"
  }
]
```

Header 匹配：

```json
[
  {
    "source": "header",
    "name": "SOAPAction",
    "operator": "contains",
    "value": "queryUser"
  }
]
```

支持的 `source`：

- `body`：JSON body 字段；不写 `path` 时按原始 body 文本匹配
- `rawBody`：原始请求体文本
- `query`：URL 查询参数
- `header`：请求头

支持的 `operator`：

- `equals`
- `contains`
- `regex`
- `exists`

## 当前取舍

为了保持个人自用轻量化，当前没有加入：

- JS 沙箱
- OpenAPI 导入
- Monaco 编辑器
- 多项目和权限系统
- Docker 镜像

这些功能可以后续按真实使用频率再加。
