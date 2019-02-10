const fs = require('fs');
const path = require('path');
const http = require('http');

const { APP_ENV } = require(path.resolve('src/environment'));

const app = require('./index');

// SSL
const keyPath = path.resolve('cert', 'cert.key');
const certPath = path.resolve('cert', 'cert.pem');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('No SSL certificates found!');
  process.kill(0);
}

// const sslOptions = {
//   key: fs.readFileSync('cert/cert.key'),
//   cert: fs.readFileSync('cert/cert.pem')
// };

if (APP_ENV === 'local') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Local HTTP server listening on port ${port}.`));
} else {
  // for hosting with Passenger Phusion that automatically handles SSL configuration
  app.listen(3000, () => console.log('HTTP Server listening on defined port.'));
}
