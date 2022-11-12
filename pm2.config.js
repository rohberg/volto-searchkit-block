let apps = [
    {
      name   : "searchkit_backend",
      script: 'venv/bin/runwsgi instance/etc/zope.ini',
      cwd: './backend'
    },
    {
      name   : "searchkit_frontend",
      script: 'yarn build && yarn start:prod',
      cwd: './frontend'
    }
  ];

module.exports = { apps: apps };

