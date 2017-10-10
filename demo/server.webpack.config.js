const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './server.js',
  context: __dirname,
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
  },
  target: 'node',
  externals: [{
    // This line is only here for dealing with the fact `midori-webpack` is
    // local in this example. Your project should not have this.
    '../': 'require("../../")',
  }, nodeExternals()],
};
