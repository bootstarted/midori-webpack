const midori = require('midori');
const webpack = require('../');

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const isUniversal = typeof global.__webpack_dev_token__ !== 'undefined';

console.log('isUniversal?', isUniversal);

const createApp = midori.compose(
  webpack.withStats(
    !isDev || isUniversal ?
      './demo/dist/stats.json' : 'http://localhost:8080/js/stats.json'
  ),
  midori.get('/stats', midori.request(function(req) {
    return midori.send(JSON.stringify(req.stats.assetsByChunkName));
  })),
  midori.send('Visit `/stats` for stats.')
);

const app = createApp();
app.listen(process.env.PORT || 8888);
