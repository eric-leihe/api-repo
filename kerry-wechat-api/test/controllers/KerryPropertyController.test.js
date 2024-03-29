let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){

  describe("API平台系统创建物业", function(){

    before(function(done) {
      db.sequelize.model("KerryProperty").sync({ force: false})
      .then(function() {
        return db.sequelize.model("KerryProperty").destroy({
          where: {
            $or: [{
              name: 'tes1t21'
            }, {
              name: 'te2st11'
            }]
          }
        })
      })
      .then(function() {
        done()
      })
    })

    it("POST提交物业", function(done){
      var now = (new Date()).getTime()
      request(app)
        .post("/api/properties/create")
        .send({
          name: now+"",
          appId: now+"",
          telephone: now+"",
          province: 'test',
          city: 'test',
          street: 'tes2t',
          start_time: (new Date()),
          end_time: (new Date()),
          zipcode: 'test',
          isjde: false,
          mchId: '123456',
          partnerKey: '123456',
          bill_sync_date: 5
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;

        })
        .end(done);
    })

    it("POST提交物业失败", function(done){
      request(app)
        .post("/api/properties/create")
        .send({
          name: 'test2',
          appId: 'test',
          telephone: '13111111111',
          province: 'test',
          city: 'test',
          isjde: false
        })
        .expect(500)
        .end(done);
    })

    it("查询物业", function(done) {
      request(app)
        .post("/api/properties/query")
        .send({
          name: 'test',
          appId: 'test1'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true;
          expect(res.body.data.length).to.be.above(0);
        })
        .end(done);
    })

    it("查询关键字不存在的物业", function(done) {
      request(app)
        .post("/api/properties/query")
        .send({
          name: 'test22'
        })
        .expect(200)
        .expect(function(res) {

          expect(res.body.success).to.be.true;
          expect(res.body.data.length).to.equal(0);
        })
        .end(done);
    })

    it("修改不存在的物业", function(done){
      request(app)
        .post("/api/properties/update")
        .send({
          id: '123',
          name: 'test',
          appId: 'test',
          telephone: '13111111111',
          province: 'test',
          city: 'test',
          street: 'test',
          start_time: (new Date()),
          end_time: (new Date()),
          zipcode: 'test',
          isjde: false
        })
        .expect(404)
        .end(done);
    })

    it("修改存在的物业", function(done){
      request(app)
        .post("/api/properties/update")
        .send({
          id: '1',
          name: 'test1',
          appId: 'test',
          telephone: '13111111111',
          province: 'test',
          city: 'test',
          street: 'test',
          start_time: (new Date()),
          end_time: (new Date()),
          zipcode: 'test',
          isjde: false,
          mchId: '1234567',
          partnerKey: '2222222',
          bill_sync_date: 10
        })
        .expect(200)
        .expect(function(res) {
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
          var property = res.body.data;
          expect(property.name).to.equal('test1');
        })
        .end(done);
    })

    it("删除不存在的物业", function(done){
      request(app)
        .post("/api/properties/delete")
        .send({
          id: '123'
        })
        .expect(200)
        .expect(function(res) {
          expect(res.body.success).to.be.true;
          expect(res.body.affectedRows).to.equal(0);
        })
        .end(done);
    })

    it("删除存在的物业", function(done){
      request(app)
        .post("/api/properties/delete")
        .send({
          id: '1'
        })
        .expect(200)
        .expect(function(res) {
          expect(res.body.success).to.be.true;
          expect(res.body.affectedRows).to.equal(1);
        })
        .end(done);
    })

    it("提交物业", function(done){
      var now = (new Date()).getTime();
      request(app)
        .post("/api/properties/create")
        .send({
          name: 'te2st11'+now,
          appId: 'test2'+now,
          telephone: now+"",
          province: 'te2st',
          city: 't3est',
          street: 't1est',
          start_time: (new Date()),
          end_time: (new Date()),
          zipcode: 'test',
          isjde: false,
          mchId: '1234567',
          partnerKey: '2222222',
          bill_sync_date: 10
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;

        })
        .end(done);
    })

  });
}
