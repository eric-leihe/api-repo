let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken'),
    fs = require('fs'),
    debug = require('debug')('core-api')

module.exports = function(app, db, config){


  describe("维修工单", function(){

    function ensureExists(path, mask, cb) {
      debug(path)
      if (typeof mask == 'function') { // allow the `mask` parameter to be optional
          cb = mask;
          mask = 0777;
      }
      fs.mkdir(path, mask, function(err) {
        debug("mkdir error: "+err)
          if (err) {
              if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
              else cb(err); // something else went wrong
          } else cb(null); // successfully created folder
      });
    }

    before(function(done) {
      db.sequelize.model("KerryWorkOrder").sync({force: false})
      .then(function() {
        return db.sequelize.model("KerryWorkOrderLine").sync({force: false})
      })
      .then(function() {
        return db.sequelize.model("KerryWorkOrderComment").sync({force: false})
      })
      .then(function() {
        return db.sequelize.query("UPDATE wechat_assets SET kerry_work_order_id = NULL")
      })
      .then(function() {
        return db.sequelize.query("DELETE FROM kerry_work_order_comments")
      })
      .then(function() {
        return db.sequelize.query("DELETE FROM kerry_work_order_lines")
      })
      .then(function() {
        return db.sequelize.query("DELETE FROM kerry_work_orders")
      })
      .then(function() {
        ensureExists('test/upload/', 0777, (err) => {

          done()
        })


      })
    })

    var id, line_id

    it("POST提交工单", function(done){
      request(app)
        .post("/api/workOrder/create")
        .send({
          unit_id: 2,
          content: '灯坏了',
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE',
          assetIds: "5, 8"
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
          id = res.body.data.id
        })
        .end(done);
    })

    it("添加维修单行", function(done) {
      request(app)
        .post("/api/workOrder/addOrderLine")
        .send({
          id: id,
          title: '人工费',
          price: '120',
          count: '1'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
          line_id = res.body.data.id
        })
        .end(done);
    })

    it("添加维修人员信息, 状态改为处理中", function(done) {
      var start = new Date()
      var end = new Date(start.getFullYear(), start.getMonth(), start.getDate(),
                        start.getHours()+2, start.getMinutes(), 0)
      request(app)
        .post("/api/workOrder/addWorker")
        .send({
          id: id,
          worker_name: "王",
          worker_phone: "13123454345",
          priority: 5,
          p_start: start,
          p_end: end
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })


    it("微信查询未处理维修", function(done) {
      request(app)
        .post("/api/workOrder/queryUnderWorking")
        .send({
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done)
    })

    it("后台查询未处理维修个数", function(done) {
      request(app)
        .post("/api/workOrder/queryApplingCount")
        .send({
          appId: "shanghai"
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done)
    })

    it("确认已完成", function(done) {
      request(app)
        .post("/api/workOrder/updateComplete")
        .send({
          id: id
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("微信端模拟支付", function(done) {
      request(app)
        .post("/api/workOrder/pay")
        .send({
          id: id,
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE',
          appId: 'shanghai'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("后台线下支付", function(done) {

      db.sequelize.model("KerryWorkOrder")
      .update({
        status: 'UNPAY',
        is_pay: false
      }, {
        where: {
          id: id
        }
      })
      .then(function() {
        request(app)
          .post("/api/workOrder/pay_offline")
          .send({
            work_order_id: id,
            remark: '现金',
            sys_user_id: 1
          })
          .expect(200)
          .expect(function(res){
            console.log(res.body)
            expect(res.body.success).to.be.true;
          })
          .end(done);
      })
      .catch(function(error) {
        console.error(error)
        done(error)
      })

    })

    it("微信端创建评论", function(done) {
      request(app)
        .post("/api/workOrder/comment")
        .send({
          id: id,
          content: '很好很好',
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("POST查询工单", function(done){
      request(app)
        .post("/api/workOrder/query")
        .send({
          appId: 'shanghai'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("POST查询工单行", function(done){
      request(app)
        .post("/api/workOrder/queryLines")
        .send({
          order_id: id
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })


    it("微信查询处理完的维修", function(done) {
      request(app)
        .post("/api/workOrder/queryPaid")
        .send({
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("打印工单", function(done) {
      request(app)
        .post("/api/orderPrint/print")
        .send({
          id: id
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("删除工单行", function(done) {
      request(app)
        .post("/api/workOrder/deleteLine")
        .send({
          order_line_id: line_id
        })
        .expect(200)
        .expect(function(res) {
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("删除工单", function(done) {
      request(app)
        .post("/api/workOrder/delete")
        .send({
          id: id
        })
        .expect(200)
        .expect(function(res) {
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

  })
}
