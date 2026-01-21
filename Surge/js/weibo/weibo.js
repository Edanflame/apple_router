// 脚本原作者@ddgksf2013
// 原地址https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/weibo_json.js

const version = 'V2.0.142';

const mainConfig = {
  isDebug: false,                  // 是否开启调试
  author: "ddgksf2013",
  removeHomeVip: true,             // 移除首页 VIP 标识
  removeHomeCreatorTask: true,     // 移除首页创作中心任务
  removeRelate: true,              // 移除相关推荐
  removeGood: true,                // 移除博主好物种草
  removeFollow: true,              // 移除关注卡片
  modifyMenus: true,               // 修改菜单栏
  removeRelateItem: false,         // 移除相关项目
  removeRecommendItem: true,       // 移除推荐条目
  removeRewardItem: true,          // 移除打赏栏
  removeLiveMedia: true,           // 移除首页直播入口
  removeNextVideo: false,          // 移除自动下一条视频
  removePinedTrending: true,       // 移除置顶热搜
  removeInterestUser: true,        // 移除可能感兴趣的人
  removeLvZhou: true,              // 移除绿洲入口
  removeSearchWindow: true,        // 移除搜索框背景/窗口
  profileSkin1: null,
  profileSkin2: null,
  tabIconVersion: 0,
  tabIconPath: ""
};

// 菜单项显示/隐藏配置
const itemMenusConfig = {
  creator_task: false,
  mblog_menus_custom: false,
  mblog_menus_video_later: true,
  mblog_menus_comment_manager: true,
  mblog_menus_avatar_widget: false,
  mblog_menus_card_bg: false,
  mblog_menus_long_picture: true,
  mblog_menus_delete: true,
  mblog_menus_edit: true,
  mblog_menus_edit_history: true,
  mblog_menus_edit_video: true,
  mblog_menus_sticking: true,
  mblog_menus_open_reward: true,
  mblog_menus_novelty: false,
  mblog_menus_favorite: true,
  mblog_menus_promote: true,
  mblog_menus_modify_visible: true,
  mblog_menus_copy_url: true,
  mblog_menus_follow: true,
  mblog_menus_video_feedback: true,
  mblog_menus_shield: true,
  mblog_menus_report: true,
  mblog_menus_apeal: true,
  mblog_menus_home: true
};

const modifyCardsUrls = ["/cardlist", "video/community_tab", "searchall"];
const modifyStatusesUrls = [
  "statuses/friends/timeline",
  "statuses_unread_hot_timeline",
  "statuses/unread_friends_timeline",
  "statuses/unread_hot_timeline",
  "groups/timeline",
  "statuses/friends_timeline"
];

// 其他功能对应的 URL 与函数映射
const otherUrls = {
  "/profile/me": "removeHome",
  "/statuses/extend": "itemExtendHandler",
  "/video/remind_info": "removeVideoRemind",
  "/checkin/show": "removeCheckin",
  "/live/media_homelist": "removeMediaHomelist",
  "/container_detail": "removeComments",
  "/container/get_item": "containerHandler",
  "/profile/container_timeline": "userHandler",
  "/video/tiny_stream_video_list": "nextVideoHandler",
  "video/tiny_stream_mid_detail": "nextVideoHandler",
  "/search/finder": "removeSearchMain",
  "/search/container_timeline": "removeSearch",
  "wbapplua/wbpullad.lua": "removeLuaScreenAds",
  "interface/sdk/sdkad.php": "removePhpScreenAds"
  // ... 等等
};

function getModifyMethod(url) {
  for (const o of modifyCardsUrls) if (url.indexOf(o) > -1) return "removeCards";
  for (const i of modifyStatusesUrls) if (url.indexOf(i) > -1) return "removeTimeLine";
  for (var [path, method] of Object.entries(otherUrls)) {
    if (url.indexOf(path) > -1) return method;
  }
  return null;
}

// 判断是否为广告卡片
function isAd(data) {
  if (!data) return false;
  return (
    data.mblogtypename == "广告" ||
    data.mblogtypename == "热推" ||
    data.promotion?.type == "ad" ||
    data.page_info?.actionlog?.source == "ad" ||
    data.content_auth_info?.content_auth_title == "广告"
  );
}

// 移除时间线（首页信息流）广告
function removeTimeLine(data) {
  const adSections = ["ad", "advertises", "trends", "headers"];
  adSections.forEach(key => delete data[key]);

  if (data.statuses) {
    let cleanStatuses = [];
    for (let status of data.statuses) {
      if (!isAd(status)) {
        lvZhouHandler(status); // 处理绿洲广告
        if (status.common_struct) delete status.common_struct;
        cleanStatuses.push(status);
      }
    }
    data.statuses = cleanStatuses;
  }
}

// 移除开屏预加载广告
function removeAdPreload(data) {
  if (data.ads) {
    data.last_ad_show_interval = 86400; // 设置显示间隔为一天
    for (let ad of data.ads) {
      ad.start_time = 2681574400; // 设置时间为 2055 年
      ad.end_time = 2681660799;
      ad.display_duration = 0;
      ad.daily_display_cnt = 0;
    }
  }
  return data;
}

// 处理“我”页面的 UI
function removeHome(data) {
  if (data.items) {
    let newItems = [];
    for (let item of data.items) {
      let itemId = item.itemId;
      if (itemId == "profileme_mine") {
        if (mainConfig.removeHomeVip) {
            if (item.header?.vipIcon) delete item.header.vipIcon;
            item.header.vipView = null;
        }
        newItems.push(item);
      } else if (["100505_-_chaohua", "100505_-_recentlyuser"].includes(itemId)) {
        newItems.push(item);
      }
      // 过滤掉其他如 创作中心 等任务
    }
    data.items = newItems;
  }
  return data;
}

var body = $response.body;
var url = $request.url;
let method = getModifyMethod(url);

if (method) {
  log("匹配到方法: " + method);
  var func = eval(method); // 动态调用上面定义的函数

  // 匹配并解析 JSON (兼容某些返回带 OK 字样的接口)
  let jsonMatch = body.match(/\{.*\}/);
  if (jsonMatch) {
    let data = JSON.parse(jsonMatch[0]);
    func(data); // 执行修改
    body = JSON.stringify(data);

    if (method == "removePhpScreenAds") {
      body += "OK";
    }
  }
}

$done({ body: body });

