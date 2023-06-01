const webpack = require("webpack");
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDev = !!env.WEBPACK_SERVE;

  let types = ['module', 'umd'];
  if (isDev) types = types.slice(1);

  return types.map(type => {
    const isModule = type === 'module';
    return {
      mode: 'development',
      entry: {
        main: isDev ? './test/index.js' : './src/index.js'
      },
      output: {
        filename: `swagger.${isModule ? 'mjs' : 'js'}`,
        library: {
          name: isModule ? void 0 : 'SwaggerApi',
          type,
          // export: 'default',
          umdNamedDefine: true
        },
        globalObject: 'this'
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
        allowedHosts: 'auto',
        historyApiFallback: true,
        host: 'local-ip',
        port: 'auto',
        hot: true,
        open: true,
        proxy: {
          '/api': {
            target: 'https://getman.cn/api',
            pathRewrite: {'^/api': ''},
            secure: false, // 如果是https接口，需要配置这个参数
            changeOrigin: true
          }
        }
      },
      experiments: {
        outputModule: isModule
      }
    };
  });
};
