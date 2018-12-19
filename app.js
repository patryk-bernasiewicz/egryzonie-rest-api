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
  cert: fs.readFileSync('cert/cert.pem'),
  passphrase: 'a748cf4213'
};

const port = process.env.PORT || 3000;
https.createServer(sslOptions, app).listen(port, null, function() {
  console.log(`Server listening on port ${port}...`);
});