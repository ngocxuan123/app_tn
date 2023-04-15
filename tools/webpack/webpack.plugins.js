const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const { inDev } = require('./webpack.helpers');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  inDev() && new webpack.HotModuleReplacementPlugin(),
  inDev() && new ReactRefreshWebpackPlugin(),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve('src/main', 'proxier'),
        to: path.resolve('.webpack/main', 'proxier'),
      },
    ],
  }),
].filter(Boolean);
