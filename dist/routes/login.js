export default {
    method: 'post',
    path: '/api/login',
    handler: (req, res) => {
        res.json({
            code: 200,
            msg: '登录成功',
            data: { token: 'mock-token-123456' }
        });
    }
};
