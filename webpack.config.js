const webpack = require("webpack");
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDev = process.env.NODE_ENV === 'dev';

module.exports = {
  entry: {
    main: isDev ? './test/index.js' : './src/index.js'
  },
  output: {
    filename: 'swagger.min.js',
    library: 'SwaggerApi',
    libraryTarget: 'umd',
    libraryExport: 'default',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
    ]
  },
  plugins: (isDev ? [
    new HtmlWebpackPlugin({ template: path.join(__dirname, 'test/index.html') })
  ] : []).concat([
    new webpack.DefinePlugin({
      noop: () => void 0
    })
  ]),
  resolve: {
    extensions: ['.js']
  },
  devtool: isDev && 'eval-source-map',
  externals: isDev ? {
    'vue': 'Vue',
    'element-ui': 'ELEMENT'
  } : {},
  devServer: {
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 8888,
    useLocalIp: true,
    disableHostCheck: true,
    open: true,
    hot: true,
    proxy: {
      '/api': {
        target: 'https://getman.cn/api',
        pathRewrite: {'^/api': ''},
        secure: false, // 如果是https接口，需要配置这个参数
        changeOrigin: true
      }
    }
  }
};
