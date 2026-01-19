// 脚本原作者@ddgksf2013
// 原地址https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/cainiao_json.js

const version = 'V1.0.21';

// 解析原始响应体
var ddgksf2013 = JSON.parse($response.body);

// 1. 处理首页协议接口：删除大横幅和待办列表
if ($request.url.indexOf("mtop.cainiao.nbpresentation.protocol.homepage.get.cn") != -1) {
    if (ddgksf2013.data?.result?.dataList?.length > 0) {
        ddgksf2013.data.result.dataList = ddgksf2013.data.result.dataList.filter(item => {
            // 过滤掉：大横幅区域、待办事项区域
            return !("big_banner_area_v870" == item.type || "todo_list_v860" == item.type);
        });
    }
} 
// 2. 处理 E2E 引擎接口（通常是包裹页或活动页）：删除推广资源
else if ($request.url.indexOf("mtop.cainiao.app.e2e.engine") != -1) {
    let adKeys = ["banner", "activity", "asset", "vip", "wallet"];
    for (let key of adKeys) {
        if (ddgksf2013.data?.data?.[key]) {
            delete ddgksf2013.data.data[key]; // 删除对应的广告和资产模块
        }
    }
} 
// 3. 处理合并后的首页接口（批量处理多个子接口）
else if ($request.url.indexOf("mtop.cainiao.nbpresentation.homepage.merge.get.cn") != -1) {
    for (let i = 0; i < 4; i++) {
        let subKey = `mtop.cainiao.nbpresentation.protocol.homepage.get.cn@${i}`;
        if (ddgksf2013.data?.[subKey]?.data?.result?.dataList?.length > 0) {
            ddgksf2013.data[subKey].data.result.dataList = ddgksf2013.data[subKey].data.result.dataList.filter(item => {
                // 同样过滤掉大横幅和待办
                return !("big_banner_area_v870" == item.type || "todo_list_v860" == item.type);
            });
        }
    }
} 
// 4. 处理具体的广告流展示接口（通过数字 ID 精确删除）
else if ($request.url.indexOf("mtop.cainiao.guoguo.nbnetflow.ads.mshow") != -1) {
    const adIds = ["1308", "1275", "205"]; // 这些通常是具体的广告位 ID
    adIds.forEach(id => {
        if (ddgksf2013.data[id]) {
            delete ddgksf2013.data[id];
        }
    });
} 
// 5. 处理你刚才提到的首页广告索引接口（重点在此！）
else if ($request.url.indexOf("mtop.cainiao.guoguo.nbnetflow.ads.index.cn") != -1) {
    if (ddgksf2013.data?.result) {
        // 直接将广告结果清空，只保留一个空对象防止 App 出错
        ddgksf2013.data.result = [{}];
    }
} 
// 6. 处理搜索框或关键词广告
else if ($request.url.indexOf("mtop.cainiao.adkeyword") != -1) {
    if (ddgksf2013.data?.result?.adHotKeywords) {
        ddgksf2013.data.result.adHotKeywords = []; // 清空热词广告
    }
}

// 将修改后的 JSON 对象转回字符串并返回
var body = JSON.stringify(ddgksf2013);
$done({ body });
