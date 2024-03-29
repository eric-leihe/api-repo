"use strict"

let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    path = require("path"),
    config = require(path.join(__dirname, 'config', 'config.' + process.env.NODE_ENV + '.json')),
    Sequelize = require("sequelize"),
    sequelize = new Sequelize(  config.sequelize.database,
                  config.sequelize.username, config.sequelize.password, config.sequelize);

var db = {
  sequelize: sequelize,
  Sequelize: Sequelize
}


var app = express();
    app.use(cookieParser());
    app.use(bodyParser());

app.locals.config = config;

/**
 * Global middleware setup config for every request
 */
app.use(function(req, res, next){
  req.x_app_config = app.locals.config;
  return next();
})


app.use("/api", require("../lib/")({
  db: db,
  config: app.locals.config
}))

require("./controllers/AuthController.test")(app, config);
