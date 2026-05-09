import express, { type Request, type Response } from 'express'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

const getLocalIP = (): string => {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
        const ifaceList = interfaces[name]
        if (!ifaceList) continue
        for (const iface of ifaceList) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address
            }
        }
    }
    return '127.0.0.1'
}

interface Route {
    method: 'get' | 'post' | 'put' | 'delete' | 'patch'
    path: string
    handler: (req: Request, res: Response) => void
}

const app = express()
const PORT = 13000

app.use(express.json())

// 自动加载 routes 下所有路由（递归子目录）
const loadRoutes = async () => {
    const routeDir = path.join(import.meta.dirname, 'routes')

    const collectTsFiles = async (dir: string): Promise<string[]> => {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        const files: string[] = []
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                files.push(...await collectTsFiles(fullPath))
            } else if (entry.name.endsWith('.ts')) {
                files.push(fullPath)
            }
        }
        return files
    }

    const files = await collectTsFiles(routeDir)

    for (const file of files) {
        const relativePath = path.relative(routeDir, file).replace(/\\/g, '/')
        const routeModule = await import(`./routes/${relativePath}`)
        const route = routeModule.default as Route
        app[route.method](route.path, route.handler)
    }
}

// 启动服务
const startServer = async () => {
    await loadRoutes()
    app.listen(PORT, () => {
        const localIP = getLocalIP()
        console.log(`访问地址: http://${localIP}:${PORT}`)
    })
}

startServer()