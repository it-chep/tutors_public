const { createProxyMiddleware } = require('http-proxy-middleware');

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

module.exports = (app) => {
  app.use(
    '/api',
    createProxyMiddleware({
      changeOrigin: true,
      target: backendUrl,
    }),
  );
};
