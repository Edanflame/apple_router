// 脚本原作者@ddgksf2013
// 原地址https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/weibo_json.js

const version = 'V2.0.142';

const mainConfig = {
  isDebug: false,
  author: "ddgksf2013",
  removeHomeVip: true,
  removeHomeCreatorTask: true,
  removeRelate: true,
  removeGood: true,
  removeFollow: true,
  modifyMenus: true,
  removeRelateItem: false,
  removeRecommendItem: true,
  removeRewardItem: true,
  removeLiveMedia: true,
  removeNextVideo: false,
  removePinedTrending: true,
  removeInterestFriendInTopic: false,
  removeInterestTopic: false,
  removeInterestUser: true,
  removeLvZhou: true,
  removeSearchWindow: true,
  profileSkin1: null,
  profileSkin2: null,
  tabIconVersion: 0,
  tabIconPath: ""
};

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
  "/2/statuses/video_mixtimeline": "nextVideoHandler",
  "video/tiny_stream_mid_detail": "nextVideoHandler",
  "/!/client/light_skin": "tabSkinHandler",
  "/littleskin/preview": "skinPreviewHandler",
  "/search/finder": "removeSearchMain",
  "/search/container_timeline": "removeSearch",
  "/search/container_discover": "removeSearch",
  "/2/flowpage": "removeMsgAd",
  "/2/page?": "removePage",
  "/statuses/unread_topic_timeline": "topicHandler",
  "/square&pageDataType/": "squareHandler",
  "/statuses/container_timeline_topic": "removeMain",
  "/statuses/container_timeline": "removeMainTab",
  "wbapplua/wbpullad.lua": "removeLuaScreenAds",
  "interface/sdk/sdkad.php": "removePhpScreenAds",
  "a=trends": "removeTopics",
  user_center: "modifiedUserCenter",
  "a=get_coopen_ads": "removeIntlOpenAds",
  "php?a=search_topic": "removeSearchTopic",
  "ad/realtime": "removeRealtimeAd",
  "ad/preload": "removeAdPreload",
  "php?a=open_app": "removeAdBanner"
};

// --- 逻辑分发函数 ---

function getModifyMethod(url) {
  for (const path of modifyCardsUrls) {
    if (url.indexOf(path) > -1) return "removeCards";
  }
  for (const path of modifyStatusesUrls) {
    if (url.indexOf(path) > -1) return "removeTimeLine";
  }
  for (var [key, value] of Object.entries(otherUrls)) {
    if (url.indexOf(key) > -1) return value;
  }
  return null;
}

// --- 具体处理函数 ---

function removeRealtimeAd(data) {
  delete data.ads;
  data.code = 4016;
  return data;
}

function removeAdBanner(data) {
  if (data.data.close_ad_setting) delete data.data.close_ad_setting;
  if (data.data.detail_banner_ad) data.data.detail_banner_ad = [];
  return data;
}

function removeAdPreload(data) {
  if (data.ads) {
    data.last_ad_show_interval = 86400;
    for (var ad of data.ads) {
      ad.start_time = 2681574400; // 设为远未来时间
      ad.end_time = 2681660799;
      ad.display_duration = 0;
      ad.daily_display_cnt = 0;
      ad.total_display_cnt = 0;
    }
  }
  return data;
}

function removeIntlOpenAds(data) {
  if (data.data) data.data = { display_ad: 1 };
  return data;
}

function removeSearchTopic(data) {
  if (data.data && data.data.search_topic?.cards.length !== 0) {
    data.data.search_topic.cards = Object.values(data.data.search_topic.cards).filter(
      (item) => item.type != "searchtop"
    );
    if (data.data.trending_topic) delete data.data.trending_topic;
  }
  return data;
}

function modifiedUserCenter(data) {
  if (data.data && data.data.length !== 0 && data.data.cards) {
    data.data.cards = Object.values(data.data.cards).filter(
      (item) => item.items[0].type != "personal_vip"
    );
  }
  return data;
}

function removeTopics(data) {
  if (data.data) data.data.order = ["search_topic"];
  return data;
}

function isAd(item) {
  if (!item) return false;
  return (
    item.mblogtypename == "广告" ||
    item.mblogtypename == "热推" ||
    item.promotion?.type == "ad" ||
    item.page_info?.actionlog?.source == "ad" ||
    item.content_auth_info?.content_auth_title == "广告"
  );
}

function squareHandler(data) {
  return data;
}

function removeMainTab(data) {
  if (data.loadedInfo && data.loadedInfo.headers) delete data.loadedInfo.headers;
  if (data.items) {
    let newItems = [];
    for (let item of data.items) {
      let isPromo = isAd(item.data);
      if (!isPromo) {
        if (item.data?.page_info?.video_limit) delete item.data.page_info.video_limit;
        if (item.data?.common_struct) delete item.data.common_struct;
        // 过滤 profile_top 相关的项
        if (item.category == "group" && JSON.stringify(item.items).indexOf("profile_top") != -1) {
          // 跳过
        } else {
          newItems.push(item);
        }
      }
    }
    data.items = newItems;
    log("removeMainTab success");
  }
  return data;
}

function removeMain(data) {
  if (data.loadedInfo && data.loadedInfo.headers) delete data.loadedInfo.headers;
  if (data.items) {
    let newItems = [];
    for (let item of data.items) {
      if (item.category == "feed") {
        if (!isAd(item.data)) newItems.push(item);
      } else if (item.category == "group") {
        if (item.items.length > 0 && item.items[0].data?.itemid?.includes("search_input")) {
          item.items = item.items.filter(
            (i) =>
              i?.data?.itemid?.includes("mine_topics") ||
              i?.data?.itemid?.includes("search_input") ||
              i?.data?.card_type == 202
          );
          item.items[0].data.hotwords = [{ word: "搜索超话", tip: "" }];
          newItems.push(item);
        } else if (item.items.length > 0 && item.items[0].data?.itemid?.includes("top_title")) {
          // 跳过
        } else {
          if (item.items.length > 0) {
            item.items = Object.values(item.items).filter(
              (i) => i.category === "feed" || i.category === "card"
            );
          }
          newItems.push(item);
        }
      } else if (item.data?.card_type && [202, 200].indexOf(item.data.card_type) > -1) {
        newItems.push(item);
      } else {
        newItems.push(item);
      }
    }
    data.items = newItems;
    log("removeMain success");
  }
  return data;
}

function topicHandler(data) {
  var cards = data.cards;
  if (cards && (mainConfig.removeUnfollowTopic || mainConfig.removeUnusedPart)) {
    let newCards = [];
    for (let card of cards) {
      let keep = true;
      if (card.mblog) {
        var buttons = card.mblog.buttons;
        if (mainConfig.removeUnfollowTopic && buttons && buttons[0].type == "follow") keep = false;
      } else {
        if (!mainConfig.removeUnusedPart) continue;
        if (card.itemid == "bottom_mix_activity") keep = false;
        else if (card?.top?.title == "正在活跃") keep = false;
        else if (card.card_type == 200 && card.group) keep = false;
        else {
          let groups = card.card_group;
          if (!groups) continue;
          if (["guess_like_title", "cats_top_title", "chaohua_home_readpost_samecity_title"].indexOf(groups[0].itemid) > -1) {
            keep = false;
          } else if (groups.length > 1) {
            let filteredGroup = [];
            for (let g of groups) {
              if (["chaohua_discovery_banner_1", "bottom_mix_activity"].indexOf(g.itemid) == -1) {
                filteredGroup.push(g);
              }
            }
            card.card_group = filteredGroup;
          }
        }
      }
      if (keep) newCards.push(card);
    }
    data.cards = newCards;
    log("topicHandler success");
  }
  return data;
}

function removeSearchMain(data) {
  var channels = data.channelInfo.channels;
  if (channels) {
    let newChannels = [];
    for (let channel of channels) {
      if (channel.payload) {
        if (channel.payload?.items) channel.payload.items = [];
        if (channel.payload?.loadedInfo?.searchBarContent) channel.payload.loadedInfo.searchBarContent = [{}];
        if (channel.payload?.loadedInfo?.headerBack) {
          channel.payload.loadedInfo.headerBack.channelStyleMap = {};
        }
        delete channel.titleInfoAbsorb;
        delete channel.titleInfo;
        delete channel.title;
        newChannels.push(channel);
      }
    }
    data.channelInfo.channels = newChannels;
    if (data.header?.data) removeHeader(data.header.data);
    if (data.channelInfo?.moreChannels) {
      delete data.channelInfo.moreChannels;
      delete data.channelInfo.channelConfig;
    }
    log("remove_search main success");
  }
  return data;
}

function removeHeader(headerData) {
  if (headerData.items) {
    let newItems = [];
    for (let item of headerData.items) {
      if (item.category == "group") {
        item.items = item.items
          .filter(
            (i) =>
              i.data?.card_type === undefined ||
              i.data?.card_type === 101 ||
              i.data?.card_type === 17
          )
          .map((i) => {
            if (i.data?.card_type === 17) i.data.col = 1;
            return i;
          });
        if (item.items.length > 0) newItems.push(item);
      }
    }
    log("remove Header success");
    headerData.items = newItems;
  }
  return headerData;
}

function checkSearchWindow(item) {
  if (!mainConfig.removeSearchWindow) return false;
  if (item.category != "card") return false;
  let itemid = item.data?.itemid;
  let cardType = item.data?.card_type;
  return (
    itemid == "finder_window" ||
    itemid == "discover_gallery" ||
    itemid == "more_frame" ||
    [208, 236, 247, 217, 101, 19].indexOf(cardType) > -1 ||
    item.data?.mblog?.page_info?.actionlog?.source?.includes("ad") ||
    item.data?.pic?.includes("ads")
  );
}

function removeSearch(data) {
  if (data.items) {
    let newItems = [];
    for (let item of data.items) {
      if (item.category == "feed") {
        if (!isAd(item.data)) {
          if (item.data?.page_info?.video_limit) delete item.data.page_info.video_limit;
          newItems.push(item);
        }
      } else if (item.category == "group") {
        if (item.header?.type === "guess" && item.itemExt?.filterType != "search") {
          // 跳过
        } else {
          item.items = item.items
            .filter(
              (i) =>
                (i.data?.card_type === undefined ||
                  i.data?.card_type === 17 ||
                  i.data?.card_type === 10) &&
                i.data?.content_auth_info?.content_auth_title !== "广告"
            )
            .map((i) => {
              if (i.data?.card_type === 17) i.data.col = 1;
              return i;
            });
          if (item.items.length > 0) newItems.push(item);
        }
      } else {
        if (!checkSearchWindow(item)) newItems.push(item);
      }
    }
    data.items = newItems;
    if (data.loadedInfo) {
      data.loadedInfo.searchBarContent = [];
      if (data.loadedInfo.headerBack) data.loadedInfo.headerBack.channelStyleMap = {};
    }
    log("remove_search success");
  }
  return data;
}

function removeMsgAd(data) {
  if (data.items) {
    let newItems = [];
    for (let item of data.items) {
      if (item.itemId == "hotword") {
        item.items = item.items.filter((i) => i?.data?.pic?.includes("com/wb_search"));
        newItems.push(item);
      } else if (item.type == "text" && item?.text?.content?.includes("实时热点")) {
        newItems.push(item);
      }
    }
    data.items = newItems;
    if (data.channelInfo) delete data.channelInfo;
    log("remove_search success");
  }
  return data;
}

function removePage(data) {
  removeCards(data);
  if (mainConfig.removePinedTrending && data.cards && data.cards.length > 0 && data.cards[0].card_group) {
    data.cards[0].card_group = data.cards[0].card_group.filter(
      (item) =>
        !(
          item?.actionlog?.ext?.includes("ads_word") ||
          item?.itemid?.includes("t:51") ||
          item?.itemid?.includes("ads_word")
        )
    );
  }
  return data;
}

function removeCards(data) {
  if (data.hotwords) data.hotwords = [];
  if (data.cards) {
    let newCards = [];
    for (let card of data.cards) {
      // 这里的 232082 逻辑用于处理特定容器 ID
      if (data.cardlistInfo?.containerid == "232082type=1") {
        if ([17, 58, 11].indexOf(card.card_type) > -1) {
          card = { card_type: card.card_type + 1 };
        }
      }
      let group = card.card_group;
      if (group && group.length > 0) {
        let newGroup = [];
        for (const gItem of group) {
          if (gItem.card_type != 118 && !isAd(gItem.mblog) && JSON.stringify(gItem).indexOf("res_from:ads") == -1) {
            newGroup.push(gItem);
          }
        }
        card.card_group = newGroup;
        newCards.push(card);
      } else {
        let cType = card.card_type;
        if ([9, 165].indexOf(cType) > -1) {
          if (!isAd(card.mblog)) newCards.push(card);
        } else if ([1007, 180].indexOf(cType) > -1) {
          // 跳过
        } else {
          newCards.push(card);
        }
      }
    }
    data.cards = newCards;
  }
  if (data.items) {
    log("data.items");
    removeSearch(data);
  }
}

function lvZhouHandler(item) {
  if (mainConfig.removeLvZhou && item) {
    var struct = item.common_struct;
    if (struct) {
      let newStruct = [];
      for (const s of struct) {
        if (s.name != "绿洲") newStruct.push(s);
      }
      item.common_struct = newStruct;
    }
  }
}

function isBlock(item) {
  var blockIds = mainConfig.blockIds || [];
  if (blockIds.length !== 0) {
    var userId = item.user.id;
    for (const bid of blockIds) {
      if (bid == userId) return true;
    }
  }
  return false;
}

function removeTimeLine(data) {
  for (const key of ["ad", "advertises", "trends", "headers"]) {
    if (data[key]) delete data[key];
  }
  if (data.statuses) {
    let newStatuses = [];
    for (const status of data.statuses) {
      if (!isAd(status)) {
        lvZhouHandler(status);
        if (status.common_struct) delete status.common_struct;
        if (status.category == "group") {
          // 跳过
        } else {
          newStatuses.push(status);
        }
      }
    }
    data.statuses = newStatuses;
  }
}

function removeHomeVip(item) {
  if (item.header && item.header.vipView) {
    item.header.vipView = null;
  }
  return item;
}

function removeVideoRemind(data) {
  data.bubble_dismiss_time = 0;
  data.exist_remind = false;
  data.image_dismiss_time = 0;
  data.image = "";
  data.tag_image_english = "";
  data.tag_image_english_dark = "";
  data.tag_image_normal = "";
  data.tag_image_normal_dark = "";
}

function itemExtendHandler(data) {
  if ((mainConfig.removeRelate || mainConfig.removeGood) && data.trend && data.trend.titles) {
    let title = data.trend.titles.title;
    if ((mainConfig.removeRelate && title === "相关推荐") || (mainConfig.removeGood && title === "博主好物种草")) {
      delete data.trend;
    }
  }
  if (mainConfig.removeFollow && data.follow_data) data.follow_data = null;
  if (mainConfig.removeRewardItem && data.reward_info) data.reward_info = null;
  if (data.head_cards) delete data.head_cards;
  if (data.page_alerts) data.page_alerts = null;

  try {
    if (data.trend.extra_struct.extBtnInfo.btn_picurl.indexOf("timeline_icon_ad_delete") > -1) {
      delete data.trend;
    }
  } catch (err) {}

  if (mainConfig.modifyMenus && data.custom_action_list) {
    let newMenus = [];
    for (const menu of data.custom_action_list) {
      let mType = menu.type;
      let configValue = itemMenusConfig[mType];
      if (configValue === undefined) {
        newMenus.push(menu);
      } else if (mType === "mblog_menus_copy_url") {
        newMenus.unshift(menu);
      } else if (configValue) {
        newMenus.push(menu);
      }
    }
    data.custom_action_list = newMenus;
  }
}

function updateFollowOrder(data) {
  try {
    for (var item of data.items) {
      if (item.itemId === "mainnums_friends") {
        let scheme = item.click.modules[0].scheme;
        item.click.modules[0].scheme = scheme.replace("231093_-_selfrecomm", "231093_-_selffollowed");
        log("updateFollowOrder success");
        return;
      }
    }
  } catch (err) {
    console.log("updateFollowOrder fail");
  }
}

function updateProfileSkin(data, configKey) {
  try {
    var skins = mainConfig[configKey];
    if (skins) {
      let index = 0;
      for (var item of data.items) {
        if (item.image) {
          try {
            if (item.image.style.darkMode != "alpha") {
              item.image.style.darkMode = "alpha";
            }
            item.image.iconUrl = skins[index++];
            if (item.dot) item.dot = [];
          } catch (err) {}
        }
      }
      log("updateProfileSkin success");
    }
  } catch (err) {
    console.log("updateProfileSkin fail");
  }
}

function removeHome(data) {
  if (data.items) {
    let newItems = [];
    for (let item of data.items) {
      let iId = item.itemId;
      if (iId == "profileme_mine") {
        if (mainConfig.removeHomeVip) item = removeHomeVip(item);
        if (item.header?.vipIcon) delete item.header.vipIcon;
        updateFollowOrder(item);
        newItems.push(item);
      } else if (iId == "100505_-_top8") {
        updateProfileSkin(item, "profileSkin1");
        newItems.push(item);
      } else if (iId == "100505_-_newcreator") {
        if (item.type == "grid") {
          updateProfileSkin(item, "profileSkin2");
          newItems.push(item);
        } else {
          if (!mainConfig.removeHomeCreatorTask) newItems.push(item);
        }
      } else if (["100505_-_chaohua", "100505_-_manage", "100505_-_recentlyuser"].indexOf(iId) == -1) {
        newItems.push(item);
      } else {
        if (item.images?.length > 0) {
          item.images = item.images.filter(
            (img) => img.itemId == "100505_-_chaohua" || img.itemId == "100505_-_recentlyuser"
          );
        }
        newItems.push(item);
      }
    }
    data.items = newItems;
  }
  return data;
}

function removeCheckin(data) {
  log("remove tab1签到");
  data.show = 0;
}

function removeMediaHomelist(data) {
  if (mainConfig.removeLiveMedia) {
    log("remove 首页直播");
    data.data = {};
  }
}

function removeComments(data) {
  const adTags = ["广告", "廣告", "相关内容", "推荐", "热推", "推薦", "荐读"];
  if (data.pageHeader) {
    data.pageHeader.data.items = data.pageHeader.data.items.filter((i) => i.category == "detail");
  }
  var items = data.items || [];
  if (items.length !== 0) {
    let newItems = [];
    for (const item of items) {
      let adType = item.data.adType || "";
      if (adTags.indexOf(adType) == -1 && item.data.card_type != 6 && item.data.card_type != 236) {
        newItems.push(item);
      }
    }
    log("remove 评论区相关和推荐内容");
    data.items = newItems;
    if (data.tip_msg) delete data.tip_msg;
  }
}

function containerHandler(data) {
  if (mainConfig.removeInterestFriendInTopic && data.card_type_name === "超话里的好友") {
    log("remove 超话里的好友");
    data.card_group = [];
  }
  if (mainConfig.removeInterestTopic && data.itemid) {
    if (data.itemid.indexOf("infeed_may_interest_in") > -1) {
      log("remove 感兴趣的超话");
      data.card_group = [];
    } else if (data.itemid.indexOf("infeed_friends_recommend") > -1) {
      log("remove 超话好友关注");
      data.card_group = [];
    }
  }
}

function userHandler(data) {
  data = removeMainTab(data);
  if (mainConfig.removeInterestUser && data.items) {
    let newItems = [];
    for (let item of data.items) {
      let keep = true;
      if (item.category == "group") {
        try {
          if (item.items[0].data.desc == "可能感兴趣的人") keep = false;
        } catch (err) {}
      }
      if (keep) {
        if (item.data?.common_struct) delete item.data.common_struct;
        newItems.push(item);
      }
    }
    data.items = newItems;
    log("removeMain sub success");
  }
  return data;
}

function nextVideoHandler(data) {
  if (data.statuses) {
    let newStatuses = [];
    for (let status of data.statuses) {
      if (!isAd(status)) {
        if (status.video_info) {
          for (const key of ["forward_redpacket_info", "shopping", "float_info", "tags"]) {
            if (status.video_info[key]) delete status.video_info[key];
          }
        }
        newStatuses.push(status);
      }
    }
    data.statuses = newStatuses;
    log("removeMainTab Success");
  }
  return data;
}

function tabSkinHandler(data) {
  try {
    var version = mainConfig.tabIconVersion;
    data.data.canUse = 1;
    if (version && mainConfig.tabIconPath && !(version < 100)) {
      for (let item of data.data.list) {
        item.version = version;
        item.downloadlink = mainConfig.tabIconPath;
      }
      log("tabSkinHandler success");
    }
  } catch (err) {
    log("tabSkinHandler fail");
  }
}

function skinPreviewHandler(data) {
  data.data.skin_info.status = 1;
}

function removeLuaScreenAds(data) {
  if (data.cached_ad) {
    for (var ad of data.cached_ad.ads) {
      ad.start_date = 1893254400; // 远未来
      ad.show_count = 0;
      ad.duration = 0;
      ad.end_date = 1893340799;
    }
  }
  return data;
}

function removePhpScreenAds(data) {
  if (data.ads) {
    data.show_push_splash_ad = false;
    data.background_delay_display_time = 0;
    data.lastAdShow_delay_display_time = 0;
    data.realtime_ad_video_stall_time = 0;
    data.realtime_ad_timeout_duration = 0;
    for (var ad of data.ads) {
      ad.displaytime = 0;
      ad.displayintervel = 86400;
      ad.allowdaydisplaynum = 0;
      ad.displaynum = 0;
      ad.displaytime = 1;
      ad.begintime = "2029-12-30 00:00:00";
      ad.endtime = "2029-12-30 23:59:59";
    }
  }
  return data;
}

function log(msg) {
  if (mainConfig.isDebug) console.log(msg);
}

// --- 脚本入口执行部分 ---

var body = $response.body;
var url = $request.url;
let method = getModifyMethod(url);

if (method) {
  log(method);
  // eval 这里用于动态调用上面定义的处理函数
  var handlerFunc = eval(method);
  // 提取有效的 JSON 部分（处理可能存在的 JSONP 或前后缀）
  let jsonMatch = body.match(/\{.*\}/);
  if (jsonMatch) {
    let data = JSON.parse(jsonMatch[0]);
    // 执行对应的修改函数（注意：原代码里写的是 new func(data)，可能是个小错误，通常直接执行即可）
    handlerFunc(data); 
    
    body = JSON.stringify(data);
    if (method == "removePhpScreenAds") {
      body = JSON.stringify(data) + "OK";
    }
  }
}

$done({ body: body });
