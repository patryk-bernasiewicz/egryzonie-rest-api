const passport = require('passport');
const passportJWT = require('passport-jwt');
const config = require('config');
const _ = require('lodash');

const mongoose = require('mongoose');
const { User } = require('../src/models/user');

const error = err => console.error(err.message);

// OAuth2 Profile Callback
async function facebookCallback(accessToken, refreshToken, profile, done) {
  let user;
  user = await User
    .findOne({ FacebookID: profile.id })
    .catch(err => {
      console.error(err.message);
      return done(null, false, { message: 'error while registering through facebook: ' + err.message });
    });
  if (!user) {
    user = await new User({
      facebookId: profile.id,
      nickname: profile.displayName,
      email: profile.emails[0].value,
      avatarUrl: profile.photos[0].value,
    })
      .save()
      .catch(err => {
        error(err);
        return done(null, false, { message: 'error while registering through facebook: ' + err.message });
      });
    return done(null, user);
  } else {
    return done(null, user);
  }
}

async function googleCallback(accessToken, refreshToken, profile, done) {
  let user;
  user = await User
    .findOne({ googleId: profile.id })
    .catch(err => {
      error(err);
      return done(null, false, { message: 'Error while registering through Google: ' + err.message });
    });
  if (!user) {
    user = await new User({
      googleId: profile.id,
      nickname: profile.displayName,
      email: profile.emails[0].value,
      avatarUrl: profile._json.picture
    })
      .save()
      .catch(err => {
        error(err);
        return done(null, false, { message: 'Error while registering user through Google: ' + err.message });
      });
  }
  return done(null, user);
}


// Token authentication
const { Strategy, ExtractJwt } = passportJWT;
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get('jwtPrivateKey')
};
passport.use('jwt', new Strategy(opts, async (jwtPayload, done) => {
  const user = await User
    .findById(jwtPayload._id)
    .catch(error);
  if (!user) {
    return done(null, false);
  }
  return done(null, _.pick(user, ['_id', 'nickname', 'email', 'role']));
}));


// Facebook token strategoy
// const FacebookTokenStrategy = require('passport-facebook-token');
// passport.use(new FacebookTokenStrategy({
//   clientId: config.get('facebookAppId'),
//   clientSecret: config.get('facebookSecret')
// }));


// Google token strategy
// const GoogleTokenStrategy = require('passport-google-token').Strategy;
// passport.use(new GoogleTokenStrategy({
//   clientId: config.get('googleClientId'),
//   clientSecret: config.get('googleSecret')
// }));


// Passport stuff
passport.serializeUser(function(user, done) {
  return done(null, { user: { id, role }});
});

passport.deserializeUser(async function({ id }, done) {
  const user = await User
    .findById(id)
    .catch(err => {
      console.error(err.message);
      return done(err, null);
    });
  return done(err, user);
});


module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
};
