let config = require('./application.config.json')
let server = config.server ? config.server : '';
// next.config.js

/**
 * @type {import{'next'}.NextConfig}
 */
module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: server + '/api/:path*',
            },
            {
                source: '/MP_verify_TheTVVlNKvL5iKBL.txt',
                destination: server + '/MP_verify_TheTVVlNKvL5iKBL.txt'
            }
        ]
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/list',
                permanent: true
            }
        ]
    },
};