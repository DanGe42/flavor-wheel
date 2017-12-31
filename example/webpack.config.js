const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractScss = new ExtractTextPlugin('bundle.css');

module.exports = {
  // Generate source maps
  // TODO: disable when generating for production
  devtool: 'source-map',

  // Configuration for the webpack-dev-server
  devServer: {
    // Webpack bundled assets will be found at [server]/dist/
    publicPath: '/dist/'
  },

  // Webpack starts here in JS land
  entry: path.resolve(__dirname, './main.js'),

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          // Same as .babelrc
          // TODO investigate if this works with .babelrc
          presets: [
            ["babel-preset-env", {
              "targets": {
                "browsers": ["last 2 versions", "safari >= 9"]
              }
            }]
          ]
        }
      }
    ],
    rules: [{
      // SCSS compilation rules (requires sass-loader, css-loader)
      test: /\.scss$/,

      // Source maps should be specified for both loaders
      // Normally, styles will get compiled into JS and injected via <style>
      // tag. That's full of silliness, so we will extract them into a separate
      // file.
      loader: extractScss.extract({
        use: [{
          loader: "css-loader",
          options: { sourceMap: true }
        }, {
          loader: "sass-loader",
          options: { sourceMap: true }
        }]
      })
    }]
  },
  plugins: [
    extractScss
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
