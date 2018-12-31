const MAIN_ENV = process.env.EG_ENV || 'public';  // local | remote | public

if (MAIN_ENV !== 'local') {
  const pjson = require('./package.json');
  const stage = pjson.stage || 'development';
  process.env.NODE_ENV = stage;
}

console.log(process.env.NODE_ENV);

const path = require('path');
const fs = require('fs');
const https = require('https');

const app = require('./index');

// SSL
const keyPath = path.resolve('cert', 'cert.key');
const certPath = path.resolve('cert', 'cert.pem');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('No SSL certificates found!');
  process.kill(0);
}

const sslOptions = {
  key: fs.readFileSync('cert/cert.key'),
  cert: fs.readFileSync('cert/cert.pem')
};

if (MAIN_ENV === 'local') {
  // use https module to create local HTTPS server
  const port = process.env.PORT || 3000;
  https.createServer(sslOptions, app).listen(port, null, function() {
    console.log(`Server listening on port ${port}...`);
  });
} else {
  // for hosting with Passenger Phusion that automatically handles SSL configuration
  app.listen(3000, () => console.log('Listening on port!'));
}
