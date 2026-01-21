/**
 * 逻辑：过滤掉 region_name 在指定黑名单中的项目
 * 对应 JQ: .entrance_region_res_list |= map(select(.region_name | IN("工具区", "我页面灯泡", "banner区") | not))
 */

let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);
        
        // 定义要剔除的黑名单列表
        const blacklist = ["工具区", "我页面灯泡", "banner区"];

        // 检查目标数组是否存在
        if (obj.entrance_region_res_list && Array.isArray(obj.entrance_region_res_list)) {
            // 使用 filter 过滤数组
            // 逻辑：如果 region_name 不在黑名单里，就保留（return true）
            obj.entrance_region_res_list = obj.entrance_region_res_list.filter(item => {
                return !blacklist.includes(item.region_name);
            });
        }

        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("脚本执行出错: " + e);
        $done({});
    }
} else {
    $done({});
}
