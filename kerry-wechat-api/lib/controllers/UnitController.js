module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     Units =  sequelize.model("Units");

  var router = express.Router();

  router.post("/query", function(req, res, next) {
    var param = req.body,
        unit_number = param.unit_number || '',
        offset = param.offset || 0,
        limit = param.limit || 20;

    Units.findAndCountAll({
      where: {
        unit_number: {
          $like: '%'+unit_number+'%'
        }
      },
      offset: offset,
      limit: limit
    })
    .then(function(results) {
      var count = results.count;
      return res.json({
        success: true,
        data: results.rows,
        count: count,
        offset: offset,
        limit: limit
      })
    })
    .catch(function(err) {

      console.error(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  router.post("/update", function(req, res, next) {
    var param = req.body,
        id = param.id,
        sys_user_id = param.sys_user_id

    Units.findOne({
      id: id
    })
    .then(function(unit) {
      if (!unit) {
        return res.json({
          success: false,
          errMsg: '找不到单元'
        })
      }else {
        unit.update({
          sys_user_id: sys_user_id
        })
        .then(function(instance) {
          return res.json({
            success: true,
            data: instance
          })
        })
        .catch(function(err) {
          console.error(err)
          return res.status(500).json({
            success: false
            ,errMsg: err.message
            ,errors: err
          })
        })

      }
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })

  })


  app.use("/units", router);
}
