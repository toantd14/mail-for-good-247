const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto-js');
const auth = require('./auth');
const parseJson = bodyParser.json();
const db = require('../models');

const unsubscribe = require('../controllers/subscriber/unsubscribe');

// Analytics
const getClickthroughs = require('../controllers/analytics/get-clickthroughs');
const refresh = require('../controllers/analytics/refresh');
const open = require('../controllers/analytics/open');
const clickthrough = require('../controllers/analytics/clickthrough');

// Settings
const getSettings = require('../controllers/settings/get-settings');
const changeSettings = require('../controllers/settings/changesettings');

// Middleware
const { apiIsAuth, isAuth } = require('./middleware/auth');

// Routes
const lists = require('./lists');
const templates = require('./templates');
const campaigns = require('./campaigns');
const accountsManagement = require('./accountsManagement')
const permissions = require('./permissions');

module.exports = (app, passport, io, redis) => {

  ////////////////////
  /* AUTHENTICATION */
  ////////////////////

  auth(app, passport, isAuth);

  app.get('/logout', isAuth, (req, res) => {
    req.logout();
    res.redirect('/login');
  });

  app.get('/auth/loginbyaccesstoken', (req, res, passport) => {
    let bodyParam = {
      access_token: req.query.access_token,
      expiredTime: req.query.expiredTime,
      userName: req.query.userName,
      secretKey: process.env.M4G_SECRET_KEY
    };

    if(!bodyParam.access_token || !bodyParam.expiredTime || !bodyParam.userName) {
      return res.redirect('/login');
    }
    if(parseInt(bodyParam.expiredTime) < parseInt(Math.floor(new Date().getTime()/1000.0))) {
      return res.send('Session expired, please login again!');
    }

    let token = bodyParam.userName + bodyParam.expiredTime + bodyParam.secretKey;
    let accessToken = crypto.MD5(crypto.MD5(token).toString());

    db.user.findOne({
      where: {
        email: bodyParam.userName
      }
    }).then( async user => {
      if(bodyParam.access_token != accessToken) {
        return res.send('Token not valid, please login again!');
      }

      let userCreated = user;
      if(user === null){
        userCreated = await db.user.createOne({
          email: bodyParam.userName,
          name: bodyParam.userName,
          password: 'secret247',
          isAdmin: false,
        })
      }

      req.login(userCreated,function(){
        return res.redirect('/');
      })
    }).catch(error =>{
      return res.send('Server error, please login again!');
    })
  });

  ////////////////////
  /*      API       */
  ////////////////////

  /* Campaigns */
  campaigns(app, io, redis);

  /* Templates */
  templates(app);

  /* Lists */
  lists(app, io);

  accountsManagement(app)

  /* Permissions */
  permissions(app);

  /* Settings */
  // Get boolean values designating assigned fields
  app.get('/api/settings', apiIsAuth, (req, res) => {
    getSettings(req, res);
  });
  // Post to change new settings
  app.post('/api/settings', apiIsAuth, parseJson, (req, res) => {
    changeSettings(req, res, redis);
  });

  /* Subscribers */
  // Get to unsubscribe an email based on the unsubscribeKey parameter
  app.get('/unsubscribe/:unsubscribeKey', (req, res) => {
    unsubscribe(req, res);
  });

  ////////////////////
  /*    ANALYTICS   */
  ////////////////////

  // convenience root for dev
  app.get('/api/analytics/refresh', (req, res) => {
    refresh(req, res);
  });
  // Clickthrough
  app.get('/clickthrough', (req, res) => {
    clickthrough(req, res);
  });
  // Open/pixel tracking
  app.get('/trackopen', (req, res) => {
    open(req, res);
  });
  // temporary
  app.get('/api/analytics/clickthrough', apiIsAuth, (req, res) => {
    getClickthroughs(req, res);
  });

  ////////////////////
  /*      APP       */
  ////////////////////

  app.get('/*', isAuth, (req, res) => {
    res.sendFile(path.resolve('dist/index.html'));
  });
};
