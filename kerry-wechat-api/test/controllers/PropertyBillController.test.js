let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("API平台系统账单管理", function(){

    before(function(done) {
      db.sequelize.model("PropertyBillInsertTemp").sync({force: true})
      .then(function() {
        return db.sequelize.model("PropertyBillLineInsertTemp").sync({force: true})
      })
      // .then(function() {
      //   return db.sequelize.query('DELETE FROM property_bill_lines')
      // })
      // .then(function() {
      //   return db.sequelize.query('DELETE FROM property_bills')
      // })
      .then(function() {
        done()
      })
      .catch(function(err) {
        console.error(err);
        done(err)
      })
    })

    // it("POST提交账单", function(done){
    //   var date = new Date();
    //   request(app)
    //     .post("/api/propertyBills/create")
    //     .send({
    //       year:date.getFullYear(),
    //       month:date.getMonth(),
    //       is_push:false,
    //       unit_id:1,
    //       property_bill_lines:[{
    //         description:"11111111111111",
    //         taxable_amount:100,
    //         tax:10,
    //         gross_amount:110,
    //         is_pay:false,
    //         expire_date:date,
    //         active:true
    //       },{
    //         description:"2222222222222",
    //         taxable_amount:200,
    //         tax:20,
    //         gross_amount:220,
    //         is_pay:false,
    //         expire_date:date,
    //         active:true
    //       }]
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       console.log(res.body.data);
    //       expect(res.body.success).to.be.true;
    //       expect(res.body.data).to.exist;
    //     })
    //     .end(done);
    // })
    //
    // it("POST更新账单", function(done){
    //   var date = new Date();
    //
    //   request(app)
    //     .post("/api/propertyBills/update")
    //     .send({
    //       id:6,
    //       property_bill_lines:[{
    //         id:2,
    //         description:"11111111111111",
    //         taxable_amount:100,
    //         tax:10,
    //         gross_amount:110,
    //         is_pay:false,
    //         expire_date:date,
    //         active:true
    //       },{
    //         id:3,
    //         description:"2222222222222",
    //         taxable_amount:200,
    //         tax:20,
    //         gross_amount:220,
    //         is_pay:false,
    //         expire_date:date,
    //         active:true
    //       },{
    //         description:"3333333333333333",
    //         taxable_amount:300,
    //         tax:30,
    //         gross_amount:330,
    //         is_pay:false,
    //         expire_date:date,
    //         active:true
    //       }]
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //     })
    //     .end(done);
    // })
    //
    // it("POST查询账单", function(done){
    //   request(app)
    //     .post("/api/propertyBills/queryPropertyBills")
    //     .send({
    //       bill_number:''
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       console.log(res.body.data);
    //       expect(res.body.success).to.be.true;
    //     })
    //     .end(done);
    // })
    //
    // it("根据userid查询账单", function(done) {
    //   request(app)
    //     .post("/api/propertyBills/queryUserBills")
    //     .send({
    //       wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE',
    //       unit_id: 1,
    //       year: 2016
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       console.log(res.body.data);
    //       expect(res.body.success).to.be.true;
    //     })
    //     .end(done);
    // })

    it("上传csv", function(done) {
      var requestData = [
        { field1: '水费',
          field2: 20160401,
          field3: 20160430,
          field4: 694.6,
          field5: 'A0001',
          field6: 'A0001',
          field7: '0',
          field8: 10010549,
          field9: 'XXX',
          field10: 103631 }
        ];

        request(app)
          .post("/api/propertyBills/upload")
          .send({
            data: requestData,
            appId: 'shanghai'
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
          })
          .end(done);
    })
    //
    //
    it("上传csv, 不存在的单元号, 同步忽略", function(done) {
      var requestData = [
        { field1: '水费',
          field2: 20160401,
          field3: 20160430,
          field4: 694.6,
          field5: 'A0001',
          field6: 'A0001',
          field7: '0000',
          field8: 10010549,
          field9: 'XXX',
          field10: 103631 }
        ];

        request(app)
          .post("/api/propertyBills/upload")
          .send({
            data: requestData,
            appId: 'shanghai'
          })
          .expect(500)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.false
          })
          .end(done);
    })

    it("上传csv, 存在账单, 插入数据到账单行", function(done) {
      var requestData = [
        { field1: '水费',
          field2: 20160401,
          field3: 20160430,
          field4: 694.6,
          field5: 'A0001',
          field6: 'A0001',
          field7: '0',
          field8: 10010549,
          field9: 'XXX',
          field10: 103631 },
          { field1: '电费',
            field2: 20160401,
            field3: 20160430,
            field4: 1000,
            field5: 'A0001',
            field6: 'A0001',
            field7: '0',
            field8: 10010549,
            field9: 'XXX',
            field10: 103631 }
        ];

        request(app)
          .post("/api/propertyBills/upload")
          .send({
            data: requestData,
            appId: 'shanghai'
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
          })
          .end(done);
    })

    it("上传csv, 存在账单行, 更新", function(done) {
      var requestData = [
        { field1: '水费',
          field2: 20160401,
          field3: 20160430,
          field4: 694.6,
          field5: 'A0001',
          field6: 'A0001',
          field7: '0',
          field8: 10010549,
          field9: 'XXX',
          field10: 103631 },
        { field1: '水费',
          field2: 20160501,
          field3: 20160530,
          field4: 694.6,
          field5: 'A0001',
          field6: 'A0001',
          field7: '0',
          field8: 10010549,
          field9: 'XXX',
          field10: 103631 },
        { field1: '水费',
          field2: 20160601,
          field3: 20160630,
          field4: 694.6,
          field5: 'A0001',
          field6: 'A0001',
          field7: '0',
          field8: 10010549,
          field9: 'XXX',
          field10: 103631 }
        ];

        request(app)
          .post("/api/propertyBills/upload")
          .send({
            data: requestData,
            appId: 'shanghai'
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
          })
          .end(done);
    })

    it("查询账单", function(done) {

        request(app)
          .post("/api/propertyBills/queryPropertyBillsView")
          .send({
            appId: 'shanghai'
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
          })
          .end(done);
    })

    it("查询账单, 没有结果", function(done) {

        request(app)
          .post("/api/propertyBills/queryPropertyBillsView")
          .send({
            appId: 'shanghai',
            unit_desc: 'AAA'
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
            expect(result.data.length).to.be.equal(0)
          })
          .end(done);
    })

    it("查询已付款账单", function(done) {

        request(app)
          .post("/api/billManager/queryByTime")
          .send({
            appId: 'shanghai'
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
          })
          .end(done);
    })

    it("更新账单行为已付款", function(done) {

      db.sequelize.model("PropertyBillLine").update({
        is_pay: true
      }, {
        where: {
          is_pay: false
        }
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        console.error(err)
        done(err)
      })
    })

    it("根据月份查询账单1", function(done) {

      var start_time = new Date('2016-05-01')

      request(app)
        .post("/api/billManager/queryByTime")
        .send({
          appId: 'shanghai',
          start_time: start_time
        })
        .expect(200)
        .expect(function(res){
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
          expect(result.data.length).to.be.equal(2)
        })
        .end(done);
    })

    it("根据月份查询账单2", function(done) {

      var start_time = new Date('2016-04-01')
      var end_time = new Date('2016-04-01')
      request(app)
        .post("/api/billManager/queryByTime")
        .send({
          appId: 'shanghai',
          start_time: start_time,
          end_time: end_time
        })
        .expect(200)
        .expect(function(res){
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
          expect(result.data.length).to.be.equal(1)
        })
        .end(done);
    })

    it("根据支付日期查询账单", (done) => {
      var today = new Date('2016-08-18');
      db.sequelize.model("PropertyBillLine").update({
        pay_date: today
      }, {
        where: {
          pay_date: null
        }
      })
      .then(function(results) {
        var pay_date = '2016-08-18'
        request(app)
          .post("/api/billManager/queryByTime")
          .send({
            appId: 'shanghai',
            pay_date: pay_date
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
          })
          .end(done);
      })


    })

    // it("导出", (done)=> {
    //
    //   var start_time = new Date('2016-04-01')
    //   var end_time = new Date('2016-04-01')
    //   request(app)
    //     .post("/api/billManager/export")
    //     .send({
    //       appId: 'shanghai',
    //       start_time: start_time,
    //       end_time: end_time
    //     })
    //     .expect(200)
    //     .expect((res)=> {
    //       console.log(res)
    //     })
    //     .end(done)
    //
    // })


  });
}
