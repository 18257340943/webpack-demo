const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const os = require('os');
const HappyPack = require('happypack');

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
// 编写目录
const srcDir = path.join(__dirname, '../src');
// 初始化环境
const devMode = process.env.NODE_ENV === 'development';
const isEnvProduction = process.env.NODE_ENV === 'production';

let publicUrlOrPath = '/';

// 生产环境下打包；
if (isEnvProduction) {
  publicUrlOrPath = 'https://cdn.zxhj618.com';
  if (process.env.BUILD_ENV === 'online') {
    publicUrlOrPath += '/static/saas-admin-web-online/';
  } else if (process.env.BUILD_ENV === 'pre-release') {
    publicUrlOrPath += '/static/saas-admin-web-pre/';
  }
}

module.exports = {
  entry: {
    main: ['react-hot-loader/patch', path.join(__dirname, '../src/main.js')],
  },
  output: {
    path: path.join(__dirname, '../dist'),
    publicPath: publicUrlOrPath,
    filename: '[name].[chunkhash:8].js',
    chunkFilename: 'chunk/[name].[chunkhash:8].js',
  },
  module: {
    rules: [
      // 每次构建打印一大坨，先注释掉了
      // {
      //   test: /\.(js|jsx)$/,
      //   include: [srcDir],
      //   loader: 'eslint-loader',
      //   enforce: 'pre',
      //   options: {
      //     fix: true,
      //   },
      // },
      {
        oneOf: [
          {
            test: /\.(js|jsx)$/,
            include: [srcDir],
            exclude: /(node_modules|bower_components)/,
            // use: ['happypack/loader?id=happybabel'],
            use: 'babel-loader?cacheDirectory',
          },
          {
            test: /\.less$/,
            use: [
              devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
              'css-loader',
              // 'postcss-loader',
              'less-loader',
            ],
          },
          {
            test: /\.css$/,
            use: [
              devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
              'css-loader',
              // 'postcss-loader',
            ],
          },
          {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            use: ['url-loader'],
            include: [srcDir],
          },
          {
            test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
            use: ['url-loader'],
            include: [srcDir],
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            use: ['url-loader'],
            include: [srcDir],
          },
        ],
      },
    ],
  },
  plugins: [
    // 开启 happypack 的线程池
    // new HappyPack({
    //   id: 'happybabel',
    //   loaders: ['babel-loader?cacheDirectory'],
    //   threadPool: happyThreadPool,
    //   verbose: true,
    // }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: `${srcDir}/index.html`,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${srcDir}/assets/images/nowthen.jpg`,
          to: 'nowthen.jpg',
        },
        {
          from: `${srcDir}/assets/images/logo.png`,
          to: 'logo.png',
        },
      ],
    }),
    // new AntdDayjsWebpackPlugin(),
    new webpack.DefinePlugin({
      nodeEnv: JSON.stringify(process.env.NODE_ENV),
      buildEnv: JSON.stringify(process.env.BUILD_ENV),
      appName: JSON.stringify(process.env.APP_NAME),
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // 进度条
    process.env.BUILD_ENV === 'native-dev' &&
      new ProgressBarPlugin({
        format: `  :msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`,
      }),
    // process.env.BUILD_ENV === 'native-dev' && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': srcDir,
      '@pages': `${srcDir}/pages`,
      react: path.join(__dirname, '../node_modules/react'), // npm link 时 react版本引用问题
      'react-dom': '@hot-loader/react-dom',
    },
    modules: ['node_modules'],
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
    splitChunks: {
      chunks: 'all', // 默认只作用于异步模块，为`all`时对所有模块生效,`initial`对同步模块有效
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules/,
          enforce: true,
          priority: 5,
          name: 'vendor',
        },
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          priority: 15,
          enforce: true,
          name: 'antd',
        },
        styles: {
          test: /\.(scss|css|less})$/,
          minChunks: 1,
          reuseExistingChunk: true,
          enforce: true,
          priority: 20,
          name: 'styles',
        },
        'react-dom': {
          test: /[\\/]node_modules[\\/]react-dom[\\/]/,
          priority: 25,
          enforce: true,
          name: 'react-dom',
        },
        'component-library': {
          test: /[\\/]node_modules[\\/]@zxhj[\\/]component-library[\\/]/,
          priority: 25,
          enforce: true,
          name: 'component-library',
        },
      },
    },
  },
};
