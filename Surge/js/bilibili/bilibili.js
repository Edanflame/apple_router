// 脚本原作者@ddgksf2013
// 原地址https://raw.githubusercontent.com/ddgksf2013/Scripts/dd607d8c27bb694ced7651853e25cbfd4a410244/bilibili_json.js

const version = 'V2.0.122';

// 获取响应内容
let body = $response.body;

if (body) {
    // switch(true) 模式，根据不同的 URL 执行不同的逻辑
    switch (true) {
        // 1. 相关推荐页面：过滤广告卡片
        case /pgc\/season\/app\/related\/recommend\?/.test($request.url):
            try {
                let obj = JSON.parse(body);
                if (obj.result?.cards?.length) {
                    // 过滤掉 type 为 2 的推广卡片
                    obj.result.cards = obj.result.cards.filter(item => item.type != 2);
                }
                body = JSON.stringify(obj);
            } catch (e) {
                console.log("bilibili recommend error:" + e);
            }
            break;

        // 2. 皮肤设置：移除共同装备（强制默认皮肤）
        case /^https?:\/\/app\.bilibili\.com\/x\/resource\/show\/skin\?/.test($request.url):
            try {
                let obj = JSON.parse(body);
                delete obj.data.common_equip;
                body = JSON.stringify(obj);
            } catch (e) {
                console.log("bilibili skin error:" + e);
            }
            break;

        // 3. 首页信息流：移除广告、横幅(Banner)和非视频卡片
        case /^https:\/\/app\.bilibili\.com\/x\/v2\/feed\/index\?/.test($request.url):
            try {
                let obj = JSON.parse(body);
                let newItems = [];
                for (let item of obj.data.items) {
                    if (item.hasOwnProperty("banner_item")) continue; // 移除横幅
                    // 仅保留没有广告标签、且属于普通视频类型的卡片
                    if (!item.hasOwnProperty("ad_info") && 
                        item.card_goto?.indexOf("ad") === -1 && 
                        ["small_cover_v2", "large_cover_v1", "large_cover_single_v9"].includes(item.card_type)) {
                        newItems.push(item);
                    }
                }
                obj.data.items = newItems;
                body = JSON.stringify(obj);
            } catch (e) {
                console.log("bilibili index error:" + e);
            }
            break;

        // 4. Story模式（短视频/竖屏）：移除广告
        case /^https?:\/\/app\.bilibili\.com\/x\/v2\/feed\/index\/story\?/.test($request.url):
            try {
                let obj = JSON.parse(body);
                let newItems = [];
                for (let item of obj.data.items) {
                    if (!item.hasOwnProperty("ad_info") && item.card_goto.indexOf("ad") === -1) {
                        newItems.push(item);
                    }
                }
                obj.data.items = newItems;
                body = JSON.stringify(obj);
            } catch (e) {
                console.log("bilibili Story error:" + e);
            }
            break;

        // 5. 青少年模式状态：强制关闭
        case /^https?:\/\/app\.bilibili\.com\/x\/v\d\/account\/teenagers\/status\?/.test($request.url):
            try {
                let obj = JSON.parse(body);
                obj.data.teenagers_status = 0;
                body = JSON.stringify(obj);
            } catch (e) {
                console.log("bilibili teenagers error:" + e);
            }
            break;

        // 6. 底部 Tab 栏自定义：只保留 直播、推荐、番剧、热门、影视
        case /^https?:\/\/app\.bilibili\.com\/x\/resource\/show\/tab/.test($request.url):
            try {
                const bottomIdKeep = new Set([177, 178, 179, 181, 102, 104, 106, 486, 488, 489]);
                let obj = JSON.parse(body);
                if (obj.data?.tab) {
                    // 重新定义底栏
                    obj.data.tab = [
                        { id: 39, tab_id: "直播tab", name: "Live", uri: "bilibili://live/home", pos: 1 },
                        { id: 40, tab_id: "推荐tab", name: "For You", uri: "bilibili://pegasus/promo", pos: 2, default_selected: 1 },
                        { id: 3502, tab_id: "bangumi", name: "Anime", uri: "bilibili://pgc/bangumi_v2", pos: 3 },
                        { id: 41, tab_id: "hottopic", name: "Trending", uri: "bilibili://pegasus/hottopic", pos: 4 },
                        // { id: 151, name: "影视", uri: "bilibili://pgc/cinema-tab", pos: 5 }
                    ];
                }/*
                if (obj.data.top) {
                    // 顶部只保留消息
                    obj.data.top = [{ id: 481, name: "消息", uri: "bilibili://link/im_home", pos: 1 }];
                }*/
                if (obj.data.top) {
                    obj.data.top = obj.data.top.filter(item => item.id === 3510);
                    obj.data.top[0].pos = 1;
                }
                if (obj.data.bottom) {
                    obj.data.bottom = obj.data.bottom.filter(item => bottomIdKeep.has(item.id));
                }
                body = JSON.stringify(obj);
            } catch (e) {
                console.log("bilibili tabprocess error:" + e);
            }
            break;

        // 7. “我的”页面：移除杂项、伪装大会员状态
        case /^https?:\/\/app\.bilibili\.com\/x\/v2\/account\/mine/.test($request.url):
            try {
                let obj = JSON.parse(body);
                // 允许显示的菜单 ID (创作中心、设置等)
                const sectionKeep = new Set([396, 397, 398, 399, 407, 410, 402, 404, 425, 426, 427, 428, 430, 432, 433, 434, 494, 495, 496, 497, 500, 501, 2830, 3072, 3084]);

                obj.data.sections_v2.forEach((sec, index) => {
                    let filteredItems = sec.items.filter(item => sectionKeep.has(item.id));
                    obj.data.sections_v2[index].items = filteredItems;
                    delete obj.data.sections_v2[index].title; // 隐藏标题
                });

                delete obj.data.vip_section_v2; // 移除会员购买入口
                obj.data.live_tip = {};
                obj.data.answer = {};
                body = JSON.stringify(obj);
            } catch (e) {
                console.log("bilibili account_mine error:" + e);
            }
            break;

        //8. 开屏广告预加载
        case /^https:\/\/app\.bilibili\.com\/x\/v2\/splash\/list/.test($request.url):
            try {
                let obj = JSON.parse(body);
                obj.data.show = [{}];
                body = JSON.stringify(obj);
            } catch (e) {
                console.log("bilibili splash list error:" + e);
            }
            break;

        default:
            // 匹配不到 URL 时不做处理
            break;
    }
}

$done({ body: body });
