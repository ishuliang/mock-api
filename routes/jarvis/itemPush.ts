import type { Request, Response } from 'express'

export default {
    method: 'post' as const,
    path: '/itemPush',
    handler: (req: Request, res: Response) => {
        console.log('itemPush params:', {
            body: req.body,
            query: req.query,
            params: req.params
        })

        res.json({
            code: '200',
            message: '成功'
        })
    }
}
