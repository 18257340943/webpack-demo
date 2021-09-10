const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const commonConfig = require('./webpack.common');

const smp = new SpeedMeasurePlugin();

// 主要用于npm的制作开发和生产都在线;
let config = merge(commonConfig, {
  mode: 'production',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: 'chunk/[name].[contenthash:8].css',
    }),
    new TerserWebpackPlugin(),
    // new HardSourceWebpackPlugin(),
    // new webpack.ids.HashedModuleIdsPlugin(),
  ].filter(Boolean), // 过滤那些 undefined
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
});

// module.exports = config;
// console.log(config, 'config')

module.exports = smp.wrap(config);
