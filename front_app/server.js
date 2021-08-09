// server.js
const express = require('express')
const next = require('next')
const { createProxyMiddleware } = require('http-proxy-middleware')
const config = require('./application.config.json')

const devProxy = {
    '/api': {
        target: config.server || 'http://localhost:8512', // 后台端口
        pathRewrite: {
            '^/api': '/api'              // url 重定向
        },
        changeOrigin: true
    }
}

const port = parseInt(process.env.PORT, 10) || config.port || 8511
const dev = process.env.NODE_ENV !== 'production'   // 判断是否为开发模式的方式是脚本中是否设置了
const app = next({
    dev
})
const handle = app.getRequestHandler()
app.prepare()
    .then(() => {
        const server = express()
        if (dev && devProxy) {
            Object.keys(devProxy).forEach(function (context) {
                server.use(createProxyMiddleware(context, devProxy[context]))
            })
        }
        server.all('*', (req, res) => {
            handle(req, res)
        })
        server.listen(port, err => {
            if (err) {
                throw err
            }
            console.log(`> Ready on http://localhost:${port}`)
        })
    })
    .catch(err => {
        console.log('An error occurred, unable to start the server')
        console.log(err)
    })