"use strict"

module.exports = [
    {
      name: "所有功能",
      httpMethod: "*",
      httpPath: "^\/.*"
    },
    {
      name: "查询户号",
      httpMethod: "POST",
      httpPath: "^\/api\/units(\/query|\/query_all)"
    },
    {
      name: "编辑户号",
      httpMethod: "POST",
      httpPath: "^\/api\/units.*"
    },
    {
      name: "查询业主",
      httpMethod: "POST",
      httpPath: "^\/api\/user_settings\/query"
    },
    {
      name: "编辑业主",
      httpMethod: "POST",
      httpPath: "^\/api\/user_settings.*"
    },
    {
      name: "编辑绑定",
      httpMethod: "POST",
      httpPath: "^\/api\/wechatUsers.*"
    },
    {
      name: "查询管家",
      httpMethod: "POST",
      httpPath: "^\/api\/sysuser"
    },
    {
      name: "模版消息",
      httpMethod: "POST",
      httpPath: "^\/api\/delivery.*"
    },
    {
      name: "图文推送",
      httpMethod: "POST",
      httpPath: "^\/api\/wechatNews.*"
    },
    {
      name: "编辑公告",
      httpMethod: "POST",
      httpPath: "^\/api\/billboards.*"
    },
    {
      name: "查询账单",
      httpMethod: "POST",
      httpPath: "^\/api(\/propertyBills\/queryPropertyBills|\/propertyBills\/queryUserBills)"
    },
    {
      name: "编辑账单",
      httpMethod: "POST",
      httpPath: "^\/api(\/propertyBills.*|\/propertyBillLines.*)"
    },
    {
      name: "反馈意见",
      httpMethod: "POST",
      httpPath: "^\/api\/suggestions.*"
    },
    {
      name: "编辑菜单",
      httpMethod: "POST",
      httpPath: "^(\/api\/wechatAssets.*|\/wxapi.*)"
    },
    {
      name: "个人中心",
      httpMethod: "POST",
      httpPath: "^\/api(\/auth.*|\/sysusers\/deleteUnit|\/sysusers\/updateUnits)"
    }
]
