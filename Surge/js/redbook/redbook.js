// 脚本原作者@ddgksf2013
// 原地址https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/redbook_json.js

const version = 'V1.0.27';

/**
 * 小红书功能增强/去广告脚本
 * 适配：Surge, Quantumult X, Loon
 * 核心功能：去广告、解除下载限制、保存无水印视频/实况图片
 */

const $ = new Env("小红书");
const RedBookPhotoKey = 'redbook_user_photo_key';
const RedBookVideoKey = 'redbook_user_video_key';

let body = $response.body;
if (!body) $done({});

try {
    let url = $request.url;
    let obj = JSON.parse(body);

    // ------------------ 逻辑判断开始 ------------------

    // 1. 移除笔记页面的挂件 (Widgets)，如活动图标
    if (/api\/sns\/v\d+\/note\/widgets/.test(url)) {
        obj.data = {}; 
        body = JSON.stringify(obj);
    }

    // 2. 实况图片 (Live Photo) 保存
    else if (/api\/sns\/v\d+\/note\/live_photo\/save/.test(url)) {
        // 从缓存中获取无水印资源链接并替换
        let cachedData = JSON.parse($.getdata(RedBookPhotoKey) || "[]");
        obj.data.live_photo = cachedData; // 具体的替换逻辑
        body = JSON.stringify(obj);
    }

    // 3. 视频保存 (解除下载限制)
    else if (/api\/sns\/v\d+\/note\/video\/save/.test(url)) {
        let cachedVideos = JSON.parse($.getdata(RedBookVideoKey) || "[]");
        for (let v of cachedVideos) {
            if (v.id == obj.data.video_id) {
                obj.data = v; // 替换为无水印视频对象
            }
        }
        body = JSON.stringify(obj);
    }

    // 4. 评论区净化
    else if (/api\/sns\/v\d+\/note\/comment\/list/.test(url)) {
        if (obj.data && obj.data.comments) {
            obj.data.comments.forEach(comment => {
                // 处理评论区图片，尝试获取原图
                if (comment.pictures) {
                    comment.pictures.forEach(pic => {
                        pic.origin_url = pic.image_url; 
                    });
                }
            });
        }
        body = JSON.stringify(obj);
    }

    // 5. 短视频信息流 (RedTube) 去广告 & 解除限制
    else if (/api\/sns\/v\d+\/note\/redtube/.test(url)) {
        if (obj.data && obj.data.items) {
            obj.data.items.forEach(item => {
                if (item.ads) item.ads = 0; // 移除广告标签
                item.has_related_goods = false; // 移除商品标签
                // 开启下载权限，禁用水印
                item.privilege = {
                    "disable_save": false,
                    "disable_watermark": true,
                    "disable_weibo_cover": true
                };
            });
        }
        body = JSON.stringify(obj);
    }

    // 6. 首页 Feed 流去广告 (Tab/Video Feed)
    else if (/api\/sns\/v\d+\/note\/(tab|video)feed/.test(url)) {
        let items = obj.data.items || obj.items;
        if (items) {
            items.forEach(item => {
                if (item.ads) item.ads = 0;
                if (item.has_related_goods) item.has_related_goods = false;
                // 解除下载限制
                if (item.privilege) {
                    item.privilege = {
                        "disable_save": false,
                        "disable_watermark": true
                    };
                }
            });
        }
        body = JSON.stringify(obj);
    }

    // 7. 搜索发现页净化
    else if (/api\/sns\/v\d+\/search\/hint/.test(url)) {
        if (obj.data && obj.data.hint_words) {
            // 屏蔽热词广告，只保留基础搜索词
            obj.data.hint_words = [{ "title": "搜索笔记", "search_word": "搜索笔记" }];
        }
        body = JSON.stringify(obj);
    }

    // 8. 开屏广告绕过 (Splash Config)
    else if (/api\/sns\/v\d+\/system_service\/splash_config/.test(url)) {
        if (obj.data && obj.data.ads) {
            obj.data.ads.forEach(ad => {
                ad.start_time = 2208963661; // 将广告开始时间设为 2040 年
                ad.end_time = 2208963661;
            });
        }
        body = JSON.stringify(obj);
    }

    // 9. 搜索结果去广告
    else if (/api\/sns\/v\d\/search\/notes/.test(url)) {
        if (obj.data && obj.data.items) {
            obj.data.items = obj.data.items.filter(i => !i.ads); // 过滤广告卡片
        }
        body = JSON.stringify(obj);
    }

} catch (e) {
    console.log("小红书脚本执行出错: " + e);
}

$done({ body });

// 环境接口省略 (Env...)
