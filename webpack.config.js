const path = require('path');
const slsw = require('serverless-webpack');
const WebpackPluginCopy = require('webpack-plugin-copy');

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
  plugins: [
    new WebpackPluginCopy([
      {
        from: 'node_modules/pdffiller-aws-lambda/bin',
        to: 'node_modules/pdffiller-aws-lambda/bin',
        copyPermissions: true
      },
      {
        from: 'pdf',
        to: 'pdf'
      }
    ])
  ]
};
