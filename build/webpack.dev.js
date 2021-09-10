const webpack = require('webpack');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');
const debug = process.env.DEBUG === 'true';

const smp = new SpeedMeasurePlugin();
const config = merge(commonConfig, {
  mode: 'development',
  devServer: {
    port: 9001,
    host: '127.0.0.1',
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    watchOptions: {
      aggregateTimeout: 500,
    },
  },
  target: 'web',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // new HardSourceWebpackPlugin()
  ],
  devtool: 'cheap-module-source-map',
});

module.exports = debug ? smp.wrap(config) : config;
