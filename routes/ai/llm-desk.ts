import type { Request, Response } from 'express'
import aiReport from './ai-report.json'

export default {
    method: 'post' as const,
    path: '/llm-desk',
    handler: (_req: Request, res: Response) => {
        res.json(aiReport)
    }
}
