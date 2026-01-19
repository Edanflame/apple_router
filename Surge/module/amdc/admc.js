/*
  这个脚本的作用是拦截阿里系的配置请求。
  作者：Ivan
  版本：1.0.0
  更新时间：2026-01-19
*/

const apps = [
  "AMap", "Cainiao", "闲鱼", "飞猪旅行", "喵街", "天猫",
  "Alibaba", "MovieApp", "Hema", "Moon", "DMPortal"
];
const targetReg = new RegExp(apps.join('|'));

var ua=$request.headers["User-Agent"]||$request.headers["user-agent"];
targetReg.test(ua)
    ? $done({ body: "Edanflame" })
    : $done({});

