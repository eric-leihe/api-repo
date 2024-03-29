
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     models = options.db;

  var router = express.Router();
  var stringify = require('csv-stringify');
  var fs = require('fs')
  var iconv = require('iconv-lite');
  var env = process.env.NODE_ENV

  //查询已付款的账单信息
  //根据时间和户号, 查询已付款账单
  router.post("/queryByTime", function(req, res, next) {
    var param = req.body,
        start_time = param.start_time || "",
        end_time = param.end_time || "",
        appId = param.appId,
        offset = param.offset || 0,
        limit = param.limit || 20,
        is_pay = param.is_pay,
        pay_date = param.pay_date || "",
        unit_desc = param.unit_desc || ""

    queryBills(start_time, end_time, appId, offset, limit, unit_desc, is_pay, pay_date,
      function(error, results, offset, limit, count) {
        if (error) {
          console.error(error)
          return res.status(500).json({
            success: false,
            error: error,
            errMsg: error.message
          })
        }
        var data = [];
        for (var i = 0; i < results.length; i++) {
          var row = results[i];
          var bill = _.find(data, function(o) {
            return row.id == o.id
          })
          if (!bill) {
            data.push({
              id: row.id,
              bill_number: row.bill_number,
              year: row.year,
              month: row.month,
              print_data: row.print_data,
              is_push: row.is_push,
              username: row.username,
              active: row.active,
              created_at: row.created_at,
              updated_at: row.updated_at,
              deleted_at: row.deleted_at,
              unit_id: row.unit_id,
              property_bill_lines: [{
                id: row.bill_line_id,
                work_order_number: row.work_order_number,
                description: row.description,
                taxable_amount: row.taxable_amount,
                tax: row.tax,
                gross_amount: row.gross_amount,
                is_pay: row.is_pay,
                pay_date: row.pay_date,
                remark: row.remark,
                expire_date: row.expire_date,
                wechat_trade_no: row.wechat_trade_no,
                sys_user: {
                  id: row.sys_user_id,
                  username: row.sys_username,
                  first_name: row.first_name,
                  last_name: row.last_name
                }
              }],
              unit: [{
                id: row.unit_id,
                unit_number: row.unit_number,
                unit_desc: row.unit_desc
              }]
            })
          }
          else {
            bill.property_bill_lines.push({
              id: row.bill_line_id,
              work_order_number: row.work_order_number,
              description: row.description,
              taxable_amount: row.taxable_amount,
              tax: row.tax,
              gross_amount: row.gross_amount,
              is_pay: row.is_pay,
              pay_date: row.pay_date,
              remark: row.remark,
              expire_date: row.expire_date,
              wechat_trade_no: row.wechat_trade_no,
              sys_user: {
                id: row.sys_user_id,
                username: row.sys_username,
                first_name: row.first_name,
                last_name: row.last_name
              }
            })

            bill.unit.push({
              id: row.unit_id,
              unit_number: row.unit_number,
              unit_desc: row.unit_desc
            })
          }
        }

        if (error) {
          return res.status(500).json({
            success: false,
            error: error,
            errMsg: error.message
          })
        }
        return res.json({
          success: true,
          data: data,
          offset: offset,
          limit: limit,
          count: count
        })

      })

  })

  router.post("/export", function(req, res, next) {

    var param = req.body,
        start_time = param.start_time || "",
        end_time = param.end_time || "",
        appId = param.appId,
        offset = null,
        limit = null,
        pay_date = param.pay_date || "",
        is_pay = param.is_pay,
        unit_desc = param.unit_desc || ""


    var query = "SELECT * FROM vw_property_bill WHERE app_id = ? "
    if (start_time.length > 0) {
      var startDate = new Date(start_time);
      if (startDate != 'Invalid Date') {
        var year = startDate.getFullYear(),
            month = startDate.getMonth()+1

        query += " AND (year > "+year+" OR (year="+year+" AND month >= "+month+")) "
      }
    }

    if (end_time.length > 0) {
      var endDate = new Date(end_time);
      if (endDate != 'Invalid Date') {
        var year = endDate.getFullYear(),
            month = endDate.getMonth()+1
        query += " AND (year < "+year+" OR (year = "+year+" AND month <= "+month+")) "
      }
    }

    if (pay_date.length > 0) {
      query += " AND to_char(pay_date, 'YYYY-MM-DD') = '" + pay_date + "'"
    }

    if (unit_desc && unit_desc.length > 0) {
      query += " AND unit_desc like '%"+unit_desc+"%' "
    }

    if (typeof is_pay != 'undefined' && is_pay != null && is_pay !== '') {
      query += ' AND is_pay=' + is_pay
    }

    sequelize.query(query, {replacements: [appId], type: sequelize.QueryTypes.SELECT})
    .then(function(results) {
      var data = [{bill_line_id: '账单行id', 'bill_number':'账单号', 'year':'年份',
                  'month': '月份', 'username': '住户', 'description': '描述', 'gross_amount': '总额',
                  'is_pay': '支付状态', 'unit_number': '户号编号', 'unit_desc': '户号',
                  'wechat_trade_no': '微信交易号', 'remark': '备注', 'pay_date': '支付日期'}];

      for (var i = 0; i < results.length; i++) {
        let result = results[i];
        let payDateObj,
            pay_date = ""
        if (result.pay_date) {
          payDateObj = new Date(result.pay_date)
        }
        if (payDateObj && payDateObj != 'Invalid Date') {
          pay_date = payDateObj.getFullYear() +"-"+ (payDateObj.getMonth()+1)+"-"+ (payDateObj.getDate())
        }
        data.push({
          bill_line_id: result.bill_line_id,
          bill_number: result.bill_number,
          year: result.year,
          month: result.month,
          username: result.username,
          description: result.description,
          gross_amount: result.gross_amount,
          is_pay: result.is_pay?"已支付":"未支付",
          unit_number: result.unit_number,
          unit_desc: result.unit_desc,
          wechat_trade_no: result.wechat_trade_no,
          remark: result.remark,
          pay_date: pay_date
        })
      }

      stringify(data, (err, results) => {
        if (err) {
          console.error(err)
          return res.status(500).json({
            success: false,
            error: err,
            errMsg: err.message
          })
        }
        var now = new Date();

        var fileName = req.x_app_config.billPath + now.toLocaleString() + ".csv";
        var newCsv = iconv.encode(results, 'GBK')
        fs.writeFile(fileName, newCsv, (err)=> {
          if (err) {
            console.error(err)
            return res.status(500).json({
              success: false,
              error: err,
              errMsg: err.message
            })
          }
          return res.download(fileName)
        })

      })

    })
    .catch(function(error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        error: error,
        errMsg: error.message
      })
    })

  })

  function queryBills(start_time, end_time, appId, offset, limit, unit_desc, is_pay, pay_date, callback) {
    var billOption = ""
    if (unit_desc && unit_desc.length > 0) {
      billOption += "'%"+unit_desc+"%'"
    }

    var now = new Date(),
        thisYear = now.getFullYear(),
        thisMonth = now.getMonth() + 1

    var timeOption = ""
    if (start_time.length > 0) {
      var startDate = new Date(start_time);
      if (startDate != 'Invalid Date') {
        var year = startDate.getFullYear(),
            month = startDate.getMonth()+1

        timeOption = " (year > "+year+" OR (year="+year+" AND month >= "+month+")) "
      }
    }

    if (end_time.length > 0) {
      var endDate = new Date(end_time);
      if (endDate != 'Invalid Date') {
        var year = endDate.getFullYear(),
            month = endDate.getMonth()+1
        if (timeOption.length > 0) {
          timeOption += " AND (year < "+year+" OR (year = "+year+" AND month <= "+month+")) "
        }else {
          timeOption = " (year < "+year+" OR (year = "+year+" AND month <= "+month+")) "
        }
      }
    }

    if (pay_date.length > 0) {
      if (timeOption.length > 0) {
        timeOption += " AND to_char(pay_date, 'YYYY-MM-DD') = '" + pay_date + "'"
      }else {
        timeOption = " to_char(pay_date, 'YYYY-MM-DD') = '" + pay_date + "'"
      }
    }

    var query = 'SELECT distinct on (bill_line_id) vw_property_bill.* FROM vw_property_bill INNER JOIN (select distinct on (id)  t.* from vw_property_bill t WHERE app_id = ?';
    if (billOption.length > 2) {
      query += ' AND unit_desc LIKE ' + billOption
    }
    if (timeOption.length > 0) {
      query += ' AND ' + timeOption
    }

    debug(is_pay)

    if (typeof is_pay != 'undefined' && is_pay != null && is_pay !== '') {
      query += ' AND is_pay=' + is_pay
    }

    if (offset>=0 && limit>=0) {
      query += ' ORDER BY id DESC offset '+offset+' limit '+limit+' ) x ON vw_property_bill.id = x.id ORDER BY bill_line_id DESC;'
    }
    else {
      query += ' ORDER BY id DESC ) x ON vw_property_bill.id = x.id ORDER BY bill_line_id DESC;'
    }


    sequelize.query(query, { replacements: [appId], type: sequelize.QueryTypes.SELECT})
    .then(function(results) {

      var countQuery = 'SELECT count(1) FROM (SELECT DISTINCT id FROM vw_property_bill WHERE app_id = ?';

      if (billOption.length > 2) {
        countQuery += ' AND unit_desc LIKE ' + billOption
      }
      if (timeOption.length > 0) {
        countQuery += ' AND ' + timeOption
      }
      if (typeof is_pay != 'undefined' &&  is_pay != null && is_pay !== '') {
        countQuery += ' AND is_pay=' + is_pay
      }

      countQuery += ') as count'

      sequelize.query(countQuery, { replacements: [appId], type: sequelize.QueryTypes.SELECT})
      .then(function(count) {

        return callback(
          null,
          results,
          offset,
          limit,
          count.length>0?count[0].count:0
        )
      })
      .catch(function(err) {
        console.error(err)
        return callback(err)
      })

    })
    .catch(function(err) {
      console.error(err)
      return callback(err)
    })
  }


  app.use("/billManager", router);

}
