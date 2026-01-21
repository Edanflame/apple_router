/**
 * 逻辑：.items |= map(select(.category != "card"))
 */

// 获取响应体
let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 检查 items 是否存在且是数组
        if (obj.items && Array.isArray(obj.items)) {
            // 过滤掉 category 为 "card" 的项
            obj.items = obj.items.filter(item => item.category !== "card");
        }

        // 将修改后的对象转回字符串并返回
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        // 如果解析 JSON 出错，不修改 body 直接返回
        console.log("JSON 过滤脚本执行失败: " + e);
        $done({});
    }
} else {
    // 没有 body 则直接结束
    $done({});
}
