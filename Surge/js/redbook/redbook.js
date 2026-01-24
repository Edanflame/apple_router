// 脚本原作者@ddgksf2013
// 原地址https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/redbook_json.js

const version = 'V1.0.27';

/**
 * 小红书功能增强/去广告脚本
 * 适配：Surge, Quantumult X, Loon
 * 核心功能：去广告、解除下载限制、保存无水印视频/实况图片
 */

var version_ = 'jsjiami.com.v7';

// --- Env.js 跨平台环境库 ---
function Env(n, t) {
  class s {
    constructor(t) {
      this.env = t
    }
    send(t, e = "GET") {
      t = "string" == typeof t ? {
        url: t
      } : t;
      let s = this.get;
      return "POST" === e && (s = this.post), new Promise((i, r) => {
        s.call(this, t, (t, e, s) => {
          t ? r(t) : i(e)
        })
      })
    }
    get(t) {
      return this.send.call(this.env, t)
    }
    post(t) {
      return this.send.call(this.env, t, "POST")
    }
  }
  return new class {
    constructor(t, e) {
      this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e)
    }
    isQuanX() {
      return "undefined" != typeof $task
    }
    isSurge() {
      return "undefined" != typeof $httpClient && "undefined" == typeof $loon
    }
    isShadowrocket() {
      return "undefined" != typeof $rocket
    }
    toObj(t, e = null) {
      try {
        return JSON.parse(t)
      } catch {
        return e
      }
    }
    toStr(t, e = null) {
      try {
        return JSON.stringify(t)
      } catch {
        return e
      }
    }
    getjson(t, e) {
      let s = e;
      if (this.getdata(t)) try {
        s = JSON.parse(this.getdata(t))
      } catch {}
      return s
    }
    setjson(t, e) {
      try {
        return this.setdata(JSON.stringify(t), e)
      } catch {
        return !1
      }
    }
    lodash_get(t, e, s) {
      let i = t;
      for (const t of e.replace(/\[(\d+)\]/g, ".$1").split("."))
        if (i = Object(i)[t], void 0 === i) return s;
      return i
    }
    lodash_set(t, i, e) {
      return Object(t) !== t || ((i = Array.isArray(i) ? i : i.toString().match(/[^.[\]]+/g) || []).slice(0, -1).reduce((t, e, s) => Object(t[e]) === t[e] ? t[e] : t[e] = Math.abs(i[s + 1]) >> 0 == +i[s + 1] ? [] : {}, t)[i[i.length - 1]] = e), t
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        var [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), s = s ? this.getval(s) : "";
        if (s) try {
          const t = JSON.parse(s);
          e = t ? this.lodash_get(t, i, "") : e
        } catch (t) {
          e = ""
        }
      }
      return e
    }
    setdata(t, e) {
      let s = !1;
      if (/^@/.test(e)) {
        var [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), n = this.getval(i), n = i ? "null" === n ? null : n || "{}" : "{}";
        try {
          const e = JSON.parse(n);
          this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
        } catch (e) {
          n = {};
          this.lodash_set(n, r, t), s = this.setval(JSON.stringify(n), i)
        }
      } else s = this.setval(t, e);
      return s
    }
    getval(t) {
      return this.isSurge() || this.isShadowrocket() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : null
    }
    setval(t, e) {
      return this.isSurge() || this.isShadowrocket() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : null
    }
    get(t, r = () => {}) {
      t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isShadowrocket() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
        "X-Surge-Skip-Scripting": !1
      })), $httpClient.get(t, (t, e, s) => {
        !t && e && (e.body = s, e.statusCode = e.status), r(t, e, s)
      })) : this.isQuanX() && (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
        hints: !1
      })), $task.fetch(t).then(t => {
        var {
          statusCode: t,
          statusCode: e,
          headers: s,
          body: i
        } = t;
        r(null, {
          status: t,
          statusCode: e,
          headers: s,
          body: i
        }, i)
      }, t => r(t)))
    }
    post(t, r = () => {}) {
      t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isShadowrocket() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
        "X-Surge-Skip-Scripting": !1
      })), $httpClient.post(t, (t, e, s) => {
        !t && e && (e.body = s, e.statusCode = e.status), r(t, e, s)
      })) : this.isQuanX() && (t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
        hints: !1
      })), $task.fetch(t).then(t => {
        var {
          statusCode: t,
          statusCode: e,
          headers: s,
          body: i
        } = t;
        r(null, {
          status: t,
          statusCode: e,
          headers: s,
          body: i
        }, i)
      }, t => r(t)))
    }
    time(t, e = null) {
      var s, e = e ? new Date(e) : new Date,
        i = {
          "M+": e.getMonth() + 1,
          "d+": e.getDate(),
          "H+": e.getHours(),
          "m+": e.getMinutes(),
          "s+": e.getSeconds(),
          "q+": Math.floor((e.getMonth() + 3) / 3),
          S: e.getMilliseconds()
        };
      for (s in /(y+)/.test(t) && (t = t.replace(RegExp.$1, (e.getFullYear() + "").substr(4 - RegExp.$1.length))), i) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[s] : ("00" + i[s]).substr(("" + i[s]).length)));
      return t
    }
    msg(t = n, e = "", s = "", i) {
      var r = t => {
        return t && ("string" == typeof t ? this.isShadowrocket() ? t : this.isQuanX() ? {
          "open-url": t
        } : this.isSurge() ? {
          url: t
        } : void 0 : "object" == typeof t ? this.isShadowrocket() ? {
          openUrl: t.openUrl || t.url || t["open-url"],
          mediaUrl: t.mediaUrl || t["media-url"]
        } : this.isQuanX() ? {
          "open-url": t["open-url"] || t.url || t.openUrl,
          "media-url": t["media-url"] || t.mediaUrl
        } : this.isSurge() ? {
          url: t.url || t.openUrl || t["open-url"]
        } : void 0 : void 0)
      };
      this.isMute || (this.isSurge() || this.isShadowrocket() ? $notification.post(t, e, s, r(i)) : this.isQuanX() && $notify(t, e, s, r(i))), this.isMuteLog || ((r = [""]).push(t), e && r.push(e), s && r.push(s), console.log(r.join("\n")), this.logs = this.logs.concat(r))
    }
    log(...t) {
      0 < t.length && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
    }
    logErr(t, e) {
      !this.isSurge() && !this.isQuanX() && !this.isShadowrocket() ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
    }
    wait(e) {
      return new Promise(t => setTimeout(t, e))
    }
    done(t = {}) {
      (new Date).getTime(), this.startTime;
      (this.isSurge() || this.isQuanX() || this.isShadowrocket()) && $done(t)
    }
  }(n, t)
}

const $ = new Env("小红书");

/**
 * 小红书 全能脚本 (去广告/无水印保存/净化)
 * 还原逻辑对照
 */

// 初始化环境变量键值
$.RedBookPhotoKey = 'RedBookPhotoKey';
$.RedBookVideoKey = 'redbook_user_video_key';

let body = $response.body;

if (body) {
    switch (true) {
        // 1. 移除笔记中的小组件 (Widgets)
        case /api\/sns\/v\d+\/note\/widgets/.test($request.url):
            try {
                let obj = JSON.parse(body);
                obj.data = {}; // 清空组件数据
                body = JSON.stringify(obj);
            } catch (e) {
                console.log('移除组件失败: ' + e);
            }
            break;

        // 2. 实况照片 (Live Photo) 保存逻辑
        case /api\/sns\/v\d+\/note\/live_photo\/save/.test($request.url):
            try {
                let obj = JSON.parse(body);
                // 从本地持久化存储中读取之前截获的无水印视频数据，强制覆盖给 App
                obj.data.video = JSON.parse($.getdata($.RedBookPhotoKey));
                body = JSON.stringify(obj);
            } catch (e) {
                console.log('Live Photo 保存逻辑错误: ' + e);
            }
            break;

        // 3. 普通视频无水印保存
        case /api\/sns\/v\d+\/note\/video\/save/.test($request.url):
            try {
                let obj = JSON.parse(body);
                let cachedData = JSON.parse($.getdata($.RedBookVideoKey));
                // 遍历本地缓存，找到与当前视频 ID 匹配的无水印链接进行替换
                for (let item of cachedData) {
                    if (item.video_id == obj.data.video_id) {
                        obj.data = item; 
                    }
                }
                body = JSON.stringify(obj);
            } catch (e) {
                console.log('视频保存逻辑错误: ' + e);
            }
            break;

        // 4. 评论区图片去水印
        case /api\/sns\/v\d+\/note\/comment\/list/.test($request.url):
            try {
                let obj = JSON.parse(body);
                for (let comment of obj.data.comments) {
                    if (comment.pictures) {
                        for (let pic of comment.pictures) {
                            // 将预览图链接替换为原图链接
                            if (pic.origin_url) {
                                pic.url = pic.origin_url;
                            }
                        }
                    }
                }
                body = JSON.stringify(obj);
            } catch (e) {
                console.log('评论区去水印错误: ' + e);
            }
            break;

        // 5. 短视频流 (RedTube) 处理：去除保存限制和水印标记
        case /api\/sns\/v\d+\/note\/redtube/.test($request.url):
            try {
                let obj = JSON.parse(body);
                for (let item of obj.data.items) {
                    // 解除保存限制
                    if (item.f_ads) item.f_ads = 0;
                    if (item.has_related_goods) item.has_related_goods = false;
                    // 强制开启允许保存、禁用水印
                    item.video_detail_info = {
                        'disable_save': false,
                        'disable_watermark': true,
                        'disable_weibo_cover': true
                    };
                }
                body = JSON.stringify(obj);
            } catch (e) {
                console.log('视频流处理错误: ' + e);
            }
            break;

        // 6. 视频/分类信息流：提取无水印下载地址并存入本地
        case /api\/sns\/v\d+\/note\/(tab|video)feed/.test($request.url):
            try {
                let obj = JSON.parse(body);
                let localVideos = JSON.parse($.getdata($.RedBookVideoKey) || "[]");
                let items = obj.data.items || obj.items;
                for (let item of items) {
                    // 解除下载限制、去除水印标志
                    item.video_detail_info = {
                        'disable_save': false,
                        'disable_watermark': true,
                        'disable_weibo_cover': true
                    };
                    // 核心：捕捉当前视频的真实下载地址并存入本地缓存，供点击保存按钮时调用
                    if (item.video_info_v2?.media?.stream?.h265) {
                        let videoData = {
                            'video_id': item.id,
                            'download_url': item.video_info_v2.media.stream.h265[0].master_url
                        };
                        localVideos.push(videoData);
                    }
                }
                // 只保留最近 100 条记录
                while (localVideos.length > 100) localVideos.shift();
                $.setdata(JSON.stringify(localVideos), $.RedBookVideoKey);
                body = JSON.stringify(obj);
            } catch (e) {
                console.log('Feed流视频捕捉错误: ' + e);
            }
            break;

        // 7. 搜索/首页图片流：去除水印标志
        case /api\/sns\/v\d+\/note\/imagefeed/.test($request.url):
            try {
                let obj = JSON.parse(body);
                let localPhotos = JSON.parse($.getdata($.RedBookPhotoKey) || "[]");
                let items = obj.data.items || obj.items;
                for (let item of items) {
                    for (let note of item.note_list) {
                        note.video_detail_info = {
                            'disable_save': false,
                            'disable_watermark': true,
                            'disable_weibo_cover': true
                        };
                        // 记录实况照片的无水印视频路径
                        if (note.live_photo && note.live_photo.media.stream.h265) {
                            let photoData = {
                                'video_url': note.live_photo.media.stream.h265[0].master_url
                            };
                            localPhotos.push(photoData);
                        }
                    }
                }
                while (localPhotos.length > 100) localPhotos.shift();
                $.setdata(JSON.stringify(localPhotos), $.RedBookPhotoKey);
                body = JSON.stringify(obj);
            } catch (e) {
                console.log('图片流捕捉错误: ' + e);
            }
            break;

        // 8. 移除开屏广告 (Splash Config)
        case /api\/sns\/v\d+\/system_service\/splash_config/.test($request.url):
            try {
                let obj = JSON.parse(body);
                if (obj.data && obj.data.ads_groups) {
                    obj.data.ads_groups.forEach(group => {
                        group.start_time = "2208963661"; // 设置开始时间到未来
                        group.end_time = "2208963661";   // 设置结束时间到未来
                        if (group.ads) {
                            group.ads.forEach(ad => {
                                ad.start_time = 2208963661;
                                ad.end_time = 2208963661;
                            });
                        }
                    });
                }
                body = JSON.stringify(obj);
            } catch (e) {
                console.log('开屏广告移除失败: ' + e);
            }
            break;

        // 9. 移除首页和搜索中的广告位
        case /api\/sns\/v\d+\/homefeed\?/.test($request.url):
        case /api\/sns\/v\d\/search\/notes/.test($request.url):
            try {
                let obj = JSON.parse(body);
                // 过滤掉所有带有 ads 标记的内容
                obj.data.items = obj.data.items.filter(item => !item.ads);
                body = JSON.stringify(obj);
            } catch (e) {
                console.log('过滤广告失败: ' + e);
            }
            break;

        // 10. 净化搜索框：移除搜索热词、移除推荐词
        case /api\/sns\/v\d+\/search\/hint/.test($request.url):
            try {
                let obj = JSON.parse(body);
                if (obj.data?.hint_words) {
                    obj.data.hint_words = [{ "title": "搜索笔记" }];
                }
                body = JSON.stringify(obj);
            } catch (e) { }
            break;

        // 11. 净化 UI 界面：移除气泡、皮肤、背景图、浮动图标等加载项
        case /api\/sns\/v\d+\/system_service\/config/.test($request.url):
            try {
                let obj = JSON.parse(body);
                const props = ['bubble_config', 'skin_config', 'loading_img', 'app_theme', 'floating_icon', 'watermark_pic_path'];
                props.forEach(p => delete obj.data[p]);
                body = JSON.stringify(obj);
            } catch (e) { }
            break;

        default:
            $done({});
            break;
    }
    $done({ body: body });
} else {
    $done({});
}
