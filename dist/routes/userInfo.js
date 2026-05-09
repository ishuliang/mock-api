export default {
    method: 'get',
    path: '/api/user/info',
    handler: (req, res) => {
        res.json({
            code: 200,
            data: { id: 1, name: '测试用户', role: 'admin' }
        });
    }
};
