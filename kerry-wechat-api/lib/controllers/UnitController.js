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

  router.post("/create", function(req, res, next) {
    var param = req.body,
        unit_number = param.unit_number,
        unit_desc = param.unit_desc,
        sys_user_id = param.sys_user_id,
        property_id = param.property_id;

    Units.create({
      unit_number: unit_number,
      sys_user_id: sys_user_id,
      property_id: property_id,
      unit_desc: unit_desc
    })
    .then(function(unit) {
      return res.json({
        success: true,
        data: unit
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

  router.post("/query", function(req, res, next) {
    var param = req.body,
        unit_desc = param.unit_desc || '',
        offset = param.offset || 0,
        limit = param.limit || 20,
        appId = param.appId;

    var propertyOption = {};
    if (appId && appId.length > 0) {
      propertyOption.appId = appId;
    }

    var unitOption = {};
    if (req.units) {
      unitOption.id = {
        $in: req.units
      }
    }
    if (unit_desc && unit_desc.length > 0) {
      unitOption.unit_desc =  {
        $like: '%'+unit_desc+'%'
      }
    }
    // console.log(unitOption)

    Units.findAndCountAll({
      where: unitOption,
      include: [{
        model: sequelize.model("SysUser"),
        as: 'sys_user',
      }, {
        model: sequelize.model("KerryProperty"),
        as: 'property',
        where: propertyOption
      }],
      order: 'id desc',
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

  router.post("/query_all", function(req, res, next) {
    var param = req.body,
        unit_desc = param.unit_desc;

    var unitOption = {
      unit_desc: {
        $like: '%'+unit_desc+'%'
      }
    };
    if (req.units) {
      unitOption.id = {
        $in: req.units
      }
    }
    Units.findAll({
      attributes:['id', 'unit_number', 'unit_desc'],
      where: unitOption,
      include: [{
        model: sequelize.model("KerryProperty"),
        as: 'property',
        where: {
          app_id: param.appId
        }
      }]
    })
    .then(function(units) {
      return res.json({
        success: true,
        data: units
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

  router.post("/delete", function(req, res, next) {
    var param = req.body,
        id = param.id;

    Units.findOne({
      where: {
        id: id
      }
    })
    .then(function(unit) {
      var now = new Date();
      var unit_number = unit.unit_number+"__"+now.getTime();
      unit.update({
        unit_number: unit_number
      })
      .then(function() {
        unit.destroy().then(function() {
          return res.json({
            success: true
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
      .catch(function(err) {
        console.error(err)
        return res.status(500).json({
          success: false
          ,errMsg: err.message
          ,errors: err
        })
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
        sys_user_id = param.sys_user_id,
        unit_desc = param.unit_desc,
        unit_number = param.unit_number;

    Units.findOne({
      where: {
        id: id
      }
    })
    .then(function(unit) {
      if (!unit) {
        return res.json({
          success: false,
          errMsg: '找不到户号'
        })
      }else {
        unit.update({
          unit_number: unit_number,
          sys_user_id: sys_user_id,
          unit_desc: unit_desc
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

  router.post("/queryUserBindByUnit", function(req, res, next) {
    var param = req.body,
        unit_number = param.unit_number,
        appId = param.appId;
    Units.findOne({
      where: {
        unit_number: unit_number
      },
      include: [{
        model: sequelize.model("UserUnitBinding"),
        as: 'user_unit_binding',
        include: [{
          model: sequelize.model("User"),
          as: 'wechat_user'
        }]
      },{
        model: sequelize.model("KerryUserUnit"),
        as: 'user_unit',
        include: [{
          model: sequelize.model("KerryUsers"),
          as: 'kerry_user'
        }]
      }, {
        model: sequelize.model("KerryProperty"),
        as: 'property',
        where: {
          app_id: appId
        }
      }]
    })
    .then(function(unit) {
      return res.json({
        success: true,
        unit: unit
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

  router.post("/queryByWechat", function(req, res, next) {
    var param = req.body,
        unit_desc = param.unit_desc;
    Units.findAll({
      attributes:['id', 'unit_number', 'unit_desc'],
      where: {
        unit_desc: {
          $like: '%'+unit_desc+'%'
        }
      },
      include: [{
        model: sequelize.model("KerryProperty"),
        as: 'property',
        where: {
          app_id: param.appId
        }
      }]
    })
    .then(function(units) {
      return res.json({
        success: true,
        data: units
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


  app.use("/units", router);
}
