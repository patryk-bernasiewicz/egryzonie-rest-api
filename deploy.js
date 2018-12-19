const path = require('path');
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();
const readline = require('readline');
const nodeSSH = require('node-ssh');

let target;

const targetArg = process.argv.find(arg => arg.match(/--target=/));
if (targetArg) {
  target = targetArg.split('=')[1];
} else {
  target = 'production';
}

const config = require('./deploy/config');

if (!config[target]) {
  process.stdout.write(`No config specified for target "${target}"!\n`);
  process.kill(0);
}

const useConfig = config[target];

const ftpDeployConfig = {
  user: useConfig.ftp.username,
  password: useConfig.ftp.password,
  host: useConfig.ftp.server,
  port: useConfig.ftp.port || 21,
  localRoot: __dirname,
  remoteRoot: useConfig.ftp.directory,
  include: ['*.js', '*.json', 'config/**/*.json', 'startup/**/*.js', 'src/**/*.js'],
  exclude: ['node_modules/**/*', 'test/**/*', 'coverage/**/*', '.nyc_output', 'cert/**/*'],
  forcePasv: false
};

ftpDeploy.on('uploaded', function({ totalFilesCount, transferredFileCount }) {
  const percent = Math.ceil((transferredFileCount / totalFilesCount) * 100);
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0, null);
  process.stdout.write(`Uploaded files... ${transferredFileCount}/${totalFilesCount} (${percent}%)`);
});
ftpDeploy.on('log', function(data) {
  process.stdout.write(`[LOG] ${data}`);
});


(async () => {
  process.stdout.write(`Preparing to upload files to ${useConfig.ftp.server}...\n`);
  await ftpDeploy.deploy(ftpDeployConfig)
    .catch(error => process.stdout.write(error.message));
  process.stdout.write('\nSuccessfully deployed all filed to FTP!\n');
  
  const sshConnection = new nodeSSH();

  await sshConnection.connect({
    host: useConfig.ssh.host,
    username: useConfig.ssh.username,
    privateKey: useConfig.ssh.privateKey,
    passphrase: useConfig.ssh.password
  }).catch(error => process.stdout.write(error.message));
  process.stdout.write(`Successfully connected to ${useConfig.ssh.host} via SSH.\n`);
  for (let command of useConfig.ssh.commands) {
    process.stdout.write(`Executing command '${command}'... \n`);
    const result = await sshConnection.execCommand(command, { cwd: useConfig.ssh.cwd }).catch(error => process.stdout.write('[SSH] Error!', error));
    process.stdout.write(result.stdout.toString('utf8') + '\n');
  }
  sshConnection.dispose();

  process.stdout.write('\nEverything went smoothly!\n');
})();
