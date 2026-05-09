import express from 'express';
import fs from 'fs/promises';
import path from 'path';
const app = express();
const PORT = 3000;
app.use(express.json());
// 自动加载 routes 下所有路由
const loadRoutes = async () => {
    const routePath = path.join(import.meta.dirname, 'routes');
    const files = await fs.readdir(routePath);
    for (const file of files) {
        if (!/\.(ts|js)$/.test(file))
            continue;
        const routeModule = await import(`./routes/${file}`);
        const route = routeModule.default;
        app[route.method](route.path, route.handler);
    }
};
// 启动服务
const startServer = async () => {
    await loadRoutes();
    app.listen(PORT, () => {
        console.log(`✅ Mock API 运行在 http://localhost:${PORT}`);
    });
};
startServer();
