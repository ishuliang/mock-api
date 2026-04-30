// 你的免费 Mock 服务
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 只处理 /api 接口
    if (path !== "/api") {
      return new Response("Not found", { status: 404 });
    }

    try {
      // 1. 获取请求内容
      const method = request.method;
      let body = {};
      if (request.method === "POST") {
        body = await request.json();
      }

      // ==============================================
      // 2. 你可以在这里写任意规则匹配！！！
      // ==============================================
      if (body.id === 1001) {
        return Response.json({
          code: 200,
          msg: "你传了 id=1001",
          data: { id: 1001, name: "测试数据A" }
        });
      }

      if (body.type === "success") {
        return Response.json({
          code: 200,
          msg: "操作成功"
        });
      }

      if (body.type === "fail") {
        return Response.json({
          code: 500,
          msg: "操作失败"
        });
      }

      // 默认返回
      return Response.json({
        code: 200,
        msg: "默认返回内容",
        method: method
      });

    } catch (e) {
      return Response.json({ code: -1, msg: "请求格式错误" });
    }
  }
};