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

const silent = process.argv.find(arg => arg.match(/--silent/));

function write(text = '\n', oneLine = false, force = false) {
  if (!silent || force) {
    if (oneLine) {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);
    }
    process.stdout.write(text);
  }
}


const config = require('./deploy/config');

if (!config[target]) {
  write(`No config specified for target "${target}"!\n`);
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
  exclude: ['node_modules/**/*', 'node_modules/faker/**/*', 'deploy/**/*', 'test/**/*', 'coverage/**/*', '.nyc_output', 'cert/**/*', 'node_modules/**/*'],
  forcePasv: false
};

ftpDeploy.on('uploaded', function({ totalFilesCount, transferredFileCount, filename }) {
  const percent = Math.ceil((transferredFileCount / totalFilesCount) * 100);
  write(`Uploading files... ${transferredFileCount}/${totalFilesCount} (${percent}%) ${filename}\n`, false, true);
});
ftpDeploy.on('log', function(data) {
  write(`[LOG] ${data}`);
});


(async () => {
  write(`Preparing to upload files to ${useConfig.targetName}...\n`);
  await ftpDeploy.deploy(ftpDeployConfig)
    .catch(error => write(error.message));
  write('\nSuccessfully deployed all filed to FTP!\n');
  
  const sshConnection = new nodeSSH();

  await sshConnection.connect({
    host: useConfig.ssh.host,
    username: useConfig.ssh.username,
    privateKey: useConfig.ssh.privateKey,
    passphrase: useConfig.ssh.password
  }).catch(error => write(error.message));
  write(`Successfully connected to ${useConfig.ssh.host} via SSH.\n`);
  for (let command of useConfig.ssh.commands) {
    write(`Executing command '${command}'... \n`);
    const result = await sshConnection.execCommand(command, { cwd: useConfig.ssh.cwd }).catch(error => process.stdout.write('[SSH] Error!', error));
    write(result.stdout.toString('utf8') + '\n');
  }
  sshConnection.dispose();

  write('\nEverything went smoothly!\n', false, true);
})();
