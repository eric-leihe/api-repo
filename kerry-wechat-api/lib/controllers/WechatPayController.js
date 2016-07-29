module.exports = function(app, db, options){
var _ = require("lodash"),
   debug = require('debug')('core-api'),
   express = require('express'),
   util = require('util'),
   path = require('path'),
   jwt = require('jsonwebtoken'),
   sequelize = db.sequelize,  //The sequelize instance
   Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
   fs = require('fs'),
   Payment = require('../wechatPay/payment').Payment,
   Paymentmiddleware = require('../wechatPay/middleware');
   var initConfig = {
     partnerKey: "w4go19um14n73r2v2v3wvderavvscgz0",  //w4go19um14n73r2v2v3wvderavvscgz0  API密钥，嘉里不夜城
     appId: "wx59b13639314be7c8",
     mchId: "1352525102",
     notifyUrl: "http://www.weixin.qq.com/wxpay/pay.php"//,
     //pfx: fs.readFileSync("../../cert/apiclient_cert.p12")
   };
   var payment = new Payment(initConfig);


   models = options.db;

   var router = express.Router();


//查询角色
router.post("/WechatPay", function(req, res, next) {
  var order = {
  body: '吮指原味鸡 * 1',
  attach: '{"部位":"三角"}',     //附加数据
  out_trade_no: '20160628080001',   //订单号
  total_fee: 10 * 100,     //总金额
  spbill_create_ip: "10.0.0.35",  //下单IP
  openid: 'oc4kVwVHYTTQhWq7hrc_rgMBSpjI',
  trade_type: 'JSAPI'
};
console.log("IP  "+ req.ip);

payment.getBrandWCPayRequestParams(order, function(err, payargs){
console.log(err);
  console.log(payargs);
  return res.json({
    success: true
  })
});

})



app.use("/wechatPays", router);

}