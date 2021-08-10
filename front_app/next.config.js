let config = require('./application.config.json')
let server = config.server ? config.server : '';
// next.config.js
module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: server + '/api/:path*',
            },
        ]
    },
};