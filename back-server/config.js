const fs = require('fs');
const ApplicationConfigPath = './config/application.config.json';
const DatabaseConfigPath = './config/database.config.json';

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
        return JSON.parse(fs.readFileSync(ApplicationConfigPath));
    } catch (_) {
        return {};
    }
}

/**
 * 获取 database.config.json
 * @returns {{
 *  host: string,
 *  port: string,
 *  user: string,
 *  password: string,
 *  database: string,
 * }}
 */
exports.database = function () {
    try {
        return JSON.parse(fs.readFileSync(DatabaseConfigPath));
    } catch (_) {
        return {};
    }
}