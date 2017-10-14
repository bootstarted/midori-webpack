const path = require('path');
const StatsPlugin = require('./StatsPlugin');

module.exports = {
  entry: './index.js',
  context: __dirname,
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/js/',
  },
  plugins: [new StatsPlugin('stats.json')],
};
