var webpack = require('webpack'),
    path = require('path'),
    WebpackNotifierPlugin = require('webpack-notifier'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    es2015 = require('babel-preset-es2015');

var PATHS = {
  fonts: 'assets/fonts'
};

module.exports = {
  debug: true,
  entry: {
    main: './src/js/main.js',
  },
  output: {
    path: path.join(__dirname, ''),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader?presets[]=es2015',
      exclude: /(node_modules|bower_components)/
    }, {
      test: /\.css$/,
      loader: "style-loader!css-loader"
    }, {
      test: /\.ttf$/,
      loader: 'url?limit=50000',
      include: PATHS.fonts
    }]
  },
  plugins: [
    new webpack.DefinePlugin({

    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: true
    }),
    new webpack.ProvidePlugin({
      '$': 'jquery'
    })
  ]
};

