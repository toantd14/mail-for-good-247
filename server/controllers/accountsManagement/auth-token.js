const db = require('../../models');
const crypto = require('crypto-js');

module.exports = function(req, res) {
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
}
