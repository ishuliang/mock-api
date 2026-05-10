import type { Request, Response } from 'express'
import { readFileSync } from 'fs'
import { join } from 'path'

const getVersionInfo = (): { version: string; buildTime: string } => {
    try {
        const versionFile = join(import.meta.dirname, '..', 'version.json')
        return JSON.parse(readFileSync(versionFile, 'utf-8'))
    } catch {
        return { version: 'unknown', buildTime: 'unknown' }
    }
}

export default {
    method: 'get' as const,
    path: '/health',
    handler: (_req: Request, res: Response) => {
        const { version, buildTime } = getVersionInfo()
        res.json({
            status: 'ok',
            version,
            buildTime,
            uptime: Math.floor(process.uptime()) + 's'
        })
    }
}
