import type { Request, Response } from 'express'

export default {
    method: 'post' as const,
    path: '/winninghiip',
    handler: (req: Request, res: Response) => {
        const tranCode = req.body?.Request?.Head?.TranCode

        if (tranCode === 'HTE0101') {
            res.json({
                Response: {
                    Body: {
                        F: '病历号[2605280052]被重复使用'
                        // PatientVisit: {
                        //     VisitNumber: 'HL26012200001'
                        // },
                        // Demography: {
                        //     PatientIdentifierList: [
                        //         { IDType: 'HisPatientID', IDNumber: '9499741' },
                        //         { IDType: 'MedicalRecordNo', IDNumber: '2601220006' }
                        //     ]
                        // }
                    },
                    Head: {
                        AckCode: '100.2',
                        AckMessage: '成功',
                        ContentType: 'text/json',
                        IpAddress: '192.168.99.71',
                        MessageId: '123199bd1c1f404cad0922d67b6a609c',
                        Timestamp: '2026-05-28 07:51:49.773',
                        Version: '1.1'
                    }
                }
            })
            return
        }

        if (tranCode === 'ORD0304' || tranCode === 'ORD0301') {
            res.json({
                Response: {
                    Head: {
                        AckCode: '100.2',
                        AckMessage: '骞冲彴鎺ユ敹鎴愬姛锛',
                        Version: '1.1',
                        ContentType: 'text/json',
                        ServiceVersion: '1.1'
                    },
                    Body: {}
                }
            })
            return
        }

        if (tranCode === 'HTE0104') {
            res.json({
                Response: {
                    Body: { ret: 'T', msg: '' },
                    Head: {
                        AckCode: '100.2',
                        AckMessage: '鎴愬姛',
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
                        AckMessage: '',
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
                                RecipeDetailNumber: '15530',
                                OrderDetailIdList: [{ IDType: 'HISOrderDetailNo', IDNumber: '48594095' }]
                            }
                        },
                        {
                            OrderDetail: {
                                RecipeDetailNumber: '15531',
                                OrderDetailIdList: [{ IDType: 'HISOrderDetailNo', IDNumber: '48594096' }]
                            }
                        },
                        {
                            OrderDetail: {
                                RecipeDetailNumber: '15532',
                                OrderDetailIdList: [{ IDType: 'HISOrderDetailNo', IDNumber: '48594097' }]
                            }
                        },
                        {
                            OrderDetail: {
                                RecipeDetailNumber: '15533',
                                OrderDetailIdList: [{ IDType: 'HISOrderDetailNo', IDNumber: '48594098' }]
                            }
                        }
                    ]
                },
                Head: {
                    AckCode: '100.2',
                    AckMessage: '鎴愬姛',
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
