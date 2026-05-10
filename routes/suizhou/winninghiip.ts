import type { Request, Response } from 'express'

export default {
    method: 'post' as const,
    path: '/winninghiip',
    handler: (req: Request, res: Response) => {
        const tranCode = req.body?.Request?.Head?.TranCode

        if (tranCode === 'HTE0104') {
            res.json({
                Response: {
                    Body: { ret: 'T', msg: '' },
                    Head: {
                        AckCode: '100.2',
                        AckMessage: '成功',
                        ContentType: 'text/json',
                        IpAddress: '192.168.99.71',
                        MessageId: 'EADBBBEDEC9149489DBB9130F7647999',
                        Timestamp: '2026-05-08 19:43:49.389',
                        Version: '1.1'
                    }
                }
            })
            return
        }

        if (tranCode !== 'HTE0103') {
            res.status(400).json({
                Response: {
                    Head: {
                        AckCode: '400',
                        AckMessage: `不支持的 TranCode: ${tranCode ?? '未传入'}`,
                    }
                }
            })
            return
        }

        res.json({
            Response: {
                Body: {
                    CommonOrder: {
                        OrderIdList: [
                            { IDType: 'HISOrderNo', IDNumber: '26354600' }
                        ]
                    },
                    OrderDetailGroupList: [
                        {
                            OrderDetail: {
                                RecipeDetailNumber: '6672',
                                OrderDetailIdList: [{ IDType: 'HISOrderDetailNo', IDNumber: '48594095' }]
                            }
                        },
                        {
                            OrderDetail: {
                                RecipeDetailNumber: '6673',
                                OrderDetailIdList: [{ IDType: 'HISOrderDetailNo', IDNumber: '48594096' }]
                            }
                        },
                        {
                            OrderDetail: {
                                RecipeDetailNumber: '6674',
                                OrderDetailIdList: [{ IDType: 'HISOrderDetailNo', IDNumber: '48594097' }]
                            }
                        },
                        {
                            OrderDetail: {
                                RecipeDetailNumber: '6675',
                                OrderDetailIdList: [{ IDType: 'HISOrderDetailNo', IDNumber: '48594098' }]
                            }
                        },
                        {
                            OrderDetail: {
                                RecipeDetailNumber: '6676',
                                OrderDetailIdList: [{ IDType: 'HISOrderDetailNo', IDNumber: '48594099' }]
                            }
                        }
                    ]
                },
                Head: {
                    AckCode: '100.2',
                    AckMessage: '成功',
                    ContentType: 'text/json',
                    IpAddress: '192.168.99.71',
                    MessageId: '9538f61ebd824481b2980bbe63586ac6',
                    Timestamp: '2026-05-09 16:27:47.412',
                    Version: '1.1'
                }
            }
        })
    }
}
