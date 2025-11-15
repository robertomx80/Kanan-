const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      // Ignore HTML and other non-JS files from node-pre-gyp
      new webpack.IgnorePlugin({
        resourceRegExp: /\.html$/,
        contextRegExp: /node-pre-gyp/,
      }),
      // Ignore Playwright binaries and assets
      new webpack.IgnorePlugin({
        resourceRegExp: /\.browser$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /chromium-bidi/,
      }),
      // Also ignore mock_s3 and other test files
      new webpack.IgnorePlugin({
        resourceRegExp: /^mock-aws-s3$|^aws-sdk$|^nock$/,
      }),
    ],
    module: {
      rules: [
        ...options.module.rules,
        {
          // Handle HTML files
          test: /\.html$/,
          type: 'asset/source',
        },
        {
          // Handle CSS files
          test: /\.css$/,
          type: 'asset/source',
        },
        {
          // Handle image files (PNG, JPG, etc.)
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: 'asset/resource',
        },
        {
          // Handle font files
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      ...options.resolve,
      extensions: ['.tsx', '.ts', '.js', '.json'],
      fallback: {
        // Playwright modules that should not be bundled
        'electron': false,
        'chromium-bidi/lib/cjs/bidiMapper/BidiMapper': false,
        'chromium-bidi/lib/cjs/cdp/CdpConnection': false,
      },
    },
    node: {
      __dirname: false,
      __filename: false,
    },
  };
};
