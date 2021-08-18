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
                source: '/:slug(MP_verify_\\S*.txt)',
                destination: server + '/:slug',
            }
        ]
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/list',
                permanent: true
            },
        ]
    },
};