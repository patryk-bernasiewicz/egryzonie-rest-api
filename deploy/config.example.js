module.exports = {
  staging: {
    ftp: {
      protocol: 'ftp',
      server: '',
      port: null,
      tls: true,
      username: '',
      password: '',
      directory: 'public_nodejs/'
    },
    ssh: {
      host: '',
      username: '',
      privateKey: '/home/.ssh/id_rsa',
      password: '',
      commands: [
        'exit'
      ]
    }
  },
  production: {
    ftp: {
      protocol: 'ftp',
      server: '',
      port: null,
      tls: true,
      username: '',
      password: '',
      directory: 'public_nodejs/'
    },
    ssh: {
      host: '',
      username: '',
      privateKey: '/home/.ssh/id_rsa',
      password: '',
      commands: [
        'exit'
      ]
    }
  }
};