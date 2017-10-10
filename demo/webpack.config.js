const path = require('path');
const StatsPlugin = require('stats-webpack-plugin');

module.exports = {
  entry: './index.js',
  context: __dirname,
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/js/',
  },
  plugins: [new StatsPlugin('stats.json')],
};
