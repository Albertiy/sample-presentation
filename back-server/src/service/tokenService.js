const jwt = require('jsonwebtoken')
const CONFIG = require('../../config').application();

function getSecret() {
    return CONFIG.tokenSecret ?? 'noSecret';
}

function getExpiresIn() {
    return CONFIG.tokenExpires ?? 86400;
}

const genToken = (id, pwd) => {
    return jwt.sign({ id: id, pwd: pwd, date: new Date() }, getSecret(), { expiresIn: getExpiresIn() });
}

const verToken = (token) => {
    return jwt.verify(token, getSecret(), { expiresIn: getExpiresIn() });
}

module.exports = {
    genToken: genToken,
    verToken: verToken,
}