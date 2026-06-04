import type { Request, Response } from 'express'

const pdfBase64 =
    'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAzMDAgMTQwXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKL0YxIDE4IFRmCjUwIDgwIFRkCihSZXBvcnQgUERGIFN0cmVhbSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMDkgMDAwMDAgbgowMDAwMDAwMDU4IDAwMDAwIG4KMDAwMDAwMDExNSAwMDAwMCBuCjAwMDAwMDAyNDkgMDAwMDAgbgowMDAwMDAwMzQzIDAwMDAwIG4KdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo0MTMKJSVFT0Y='

export default {
    method: 'post' as const,
    path: '/reportpdffilestream',
    handler: (_req: Request, res: Response) => {
        res.json({
            errcode: 'T',
            errmsg: '',
            reportlist: [
                {
                    applyno: '204041856',
                    replbcode: '1',
                    replbname: '生化',
                    barcode: '0118876861P',
                    techno: '164',
                    pubdatetime: '2026-05-28 13:07:08',
                    printflag: '0',
                    noprintflag: '0',
                    noprintreason: '',
                    pdffilename: '204041856.pdf',
                    templatepagetype: '',
                    pdfbase64str: pdfBase64
                }
            ]
        })
    }
}
