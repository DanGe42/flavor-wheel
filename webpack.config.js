var path = require('path');

module.exports = {
  // Configuration for the webpack-dev-server
  devServer: {
    // Webpack bundled assets will be found at [server]/dist/
    publicPath: '/dist/'
  },
  entry: './app/js/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
