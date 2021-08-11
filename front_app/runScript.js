var exec = require('child_process').exec;
exec('npm start', { windowsHide: true });

// this didn't work：
// "pm2": "pm2 start node npm --watch --name yilabaoFrontApp --no-autorestart --log pm2_error.log -- start"