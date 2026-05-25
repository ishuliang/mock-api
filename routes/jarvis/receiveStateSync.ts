import type { Request, Response } from 'express'

export default {
    method: 'post' as const,
    path: '/itemResult/receiveStateSync',
    handler: (_req: Request, res: Response) => {
        res.json({
            code: '200',
            message: '成功'
        })
    }
}
