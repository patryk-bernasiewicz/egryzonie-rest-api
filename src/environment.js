const path = require('path');
module.exports = (() => {
  const APP_ENV = process.env.EG_ENV || 'public';
  let NODE_ENV = process.env.NODE_ENV;
  
  if (APP_ENV !== 'local') {
    const pjson = require(path.resolve('package.json'));
    const stage = pjson.stage || 'development';
    NODE_ENV = stage;
  }

  return { APP_ENV, NODE_ENV };
})();