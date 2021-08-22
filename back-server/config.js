const fs = require('fs');

/**
 * 获取 application.config.json
 * @returns {{
 * port: number,
 * env: string,
 * staticPath: string,
 * frontAddress: string, 
 * logDirectory: string,
 * exampleMode: boolean,
 * tokenSecret: string,
 * tokenExpires: number,
 * }}
 */
exports.application = function () {
    try {
        return JSON.parse(fs.readFileSync('./application.config.json'));
    } catch (_) {
        return {};
    }
}

/**
 * 获取 database.config.json
 * @returns {{}}
 */
exports.database = function () {
    try {
        return JSON.parse(fs.readFileSync('./database.config.json'));
    } catch (_) {
        return {};
    }
}