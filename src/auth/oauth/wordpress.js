'use strict';

const superagent = require('superagent');
const Users = require('../users-model.js');

const API = 'http://localhost:3000';
const WPTS = 'https://public-api.wordpress.com/oauth2/token';
const SERVICE = 'https://public-api.wordpress.com/oauth2/authorize';

// const AUTHORIZE_URL='https://public-api.wordpress.com/oauth2/authorize';
// const AUTHENTICATE_URL='https://public-api.wordpress.com/oauth2/authenticate';


let authorize = (request) => {
  
  console.log('(1)', request.query.code);
  
  return superagent.post(WPTS)
    .type('form')
    .send({
      client_id: process.env.WORDPRESS_CLIENT_ID,
      redirect_uri: `${API}/oauth`,
      client_secret: process.env.WORDPRESS_CLIENT_SECRET,
      code: request.query.code,
      grant_type: 'authorization_code',
    })
    .then( response => {
      console.log(response.body.blog_url);
      let access_token = response.body.access_token;
      console.log('(2)', access_token);
      return access_token;
    })
    .then(token => {
      console.log(SERVICE, token);
      // return superagent.post(`https://jefefood.wordpress.com?oauth=me&access_token=${token}`)
      return superagent.get('https://public-api.wordpress.com/rest/v1/me/')
        .set('Authorization', `Bearer ${token}`)
        .then( response => {
          let user = response.body;
          console.log(response);
          console.log('(3)', user);
          return user;
        });
    })
    .then( oauthUser => {
      console.log('(4) Create Our Account');
      return Users.createFromOauth(oauthUser.email);
    })
    .then( actualUser => {
      return actualUser.generateToken(); 
    })
    .catch( error => error );
};


module.exports = authorize;