/**
* System User Authentication controller
*/
module.exports = function(app, db, options){
var _ = require("lodash"),
   debug = require('debug')('core-api'),
   express = require('express'),
   util = require('util'),
   path = require('path'),
   jwt = require('jsonwebtoken'),
   sequelize = db.sequelize,  //The sequelize instance
   Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
   SysRole =  sequelize.model("SysRole"),
   SysRolePermission = sequelize.model("SysRolePermission"),
   models = options.db;

var router = express.Router();



/**
* PATH: /roles
* return system roles
*/
router.get("/", function(req, res, next){
  return res.json({
   success: true
   ,data: [{
     name: "SUPER_USER",
     permission: [{
       method: "*",
       path: "*"
     }]
   }]
  });
});

//创建后台角色
router.post("/create", function(req, res, next) {
    var param = req.body;
    var id ;

    SysRole.create({
      name: param.name
    })
    .then(function(sysRole) {
      id = sysRole.id;
      if(param.permissions){
        param.permissions.forEach(function(data){
          data.role_id = id;
        })
      }

      SysRolePermission.bulkCreate(param.permissions)
      .then(function(){
        SysRole.findOne({
          where:{
             id : id
           },
         include:[{
           model: sequelize.model("SysRolePermission"),
           as: 'permissions'
         }]
        })
        .then(function(sysRole){
          return res.json({
            success:true,
            data:sysRole
          });
        })
        .catch(function(err){
          throw err;
          return res.status(500).json({
            success:false,
            errMsg:err.message,
            errors:err
          })
        })
      })
      .catch(function(err){
        throw err;
      })
    })
    .catch(function(err) {
      throw err;
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
})

//更新后台角色
router.post("/update", function(req, res, next) {
  var param = req.body;
  var id = param.id;

  SysRole.findOne({
    where:{
       id : id
     },
    include:[{
     model: sequelize.model("SysRolePermission"),
     as: 'permissions'
    }]
  })
  .then(function(sysRole){
    sysRole.update({
      name:param.name
    })
    .then(function(sysRole){
      if(sysRole.permissions){
        sysRole.permissions.forEach(function(data){
             _.remove(param.permissions,function(paramData){
                  console.log(data.name+'  '+ paramData.name);
            return data.name == paramData.name
          })
        })
      }

      if(param.permissions){
        param.permissions.forEach(function(data){
          data.role_id = id;
        })
      }

      SysRolePermission.bulkCreate(param.permissions)
      .then(function(){
        return res.json({
          success:true
        })
      })
      .catch(function(err){
        return res.status(500).json({
          success:false,
          errMsg:err.message,
          errors:err
        })
      })
    })
    .catch(function(err){
      return res.status(500).json({
        success:false,
        errMsg:err.message,
        errors:err
      })
    })
  })
  .catch(function(err) {
    return res.status(500).json({
      success: false
      ,errMsg: err.message
      ,errors: err
    })
  })
})

router.post("/deleteRoles", function(req, res, next) {
  var param = req.body,
      role_id = param.role_id,
      name = param.name;

  sequelize.query("DELETE FROM sys_role_permissions WHERE role_id = ? AND name = ?",
            {replacements: [role_id, name]})
  .then(function(rows){
    return res.json({
      success:true,
      data:rows
    })
  })
  .catch(function(err){
    return res.status(500).json({
      success:false,
      errMsg:err.message,
      errors:err
    })
  })

})

//查询角色
router.post("/queryRoles", function(req, res, next) {
 var param = req.body;
 var name = param.name || "";

 SysRole.findAll({
   where :{
     name:{
       $like:"%"+name+"%"
     }
   },
   include:[{
     model: sequelize.model("SysRolePermission"),
     as: 'permissions'
   }],
   order: 'id desc'
 })
 .then(function(sysRoles){
   return res.json({
     success:true,
     data:sysRoles
   });
 })
 .catch(function(err){
   return res.status(500).json({
     success:false,
     errMsg:err.message,
     errors:err
   })
 })
})

//删除角色
router.get("/delete", function(req, res, next) {
 var param = req.query;
 var id = param.id;

 SysRole.destroy({
   where:{
     id:id
   }
 })
 .then(function(rows){
   SysRolePermission.destroy({
     where:{
       role_id:id
     }
   })
   .then(function(rows){
     return res.json({
       success:true,
       data:rows
     })
   })
   .catch(function(err){
     return res.status(500).json({
       success:false,
       errMsg:err.message,
       errors:err
     })
   })
 })
 .catch(function(err){
   return res.status(500).json({
     success:false,
     errMsg:err.message,
     errors:err
   })
 })
})

//根据角色查询系统用户
router.post("/querySysUsers", function(req, res, next) {
  var param = req.body,
      role_id = param.role_id,
      offset = param.offset || 0,
      limit = param.limit || 20
  sequelize.model("SysRoleUser").findAndCountAll({
    where: {
      role_id: role_id
    },
    include: [{
      attributes: ['username', 'email', 'mobile', 'firstName', 'lastName', 'userType'],
      model: sequelize.model("SysUser"),
      as: 'sysuser',
      include: [{
        model: sequelize.model("KerryProperty"),
        as: 'WorkingProperty',
        attributes: ['name']
      }]
    }],
    offset: offset,
    limit: limit
  })
  .then(function(results) {
    return res.json({
      success: true,
      data: results.rows,
      count: results.count,
      offset: offset,
      limit: limit
    })
  })
})


app.use("/roles", router);
}
