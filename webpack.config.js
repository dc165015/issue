const path = require('path');
const { dev, prod } = require('@ionic/app-scripts/config/webpack.config');
const webpackMerge = require('webpack-merge');

const customConfig = {
  resolve   : {
    alias : {
      '@app'        : path.resolve('src/app'),
      '@pages'      : path.resolve('src/app/pages'),
      '@constants'  : path.resolve('src/app/constants'),
      '@components' : path.resolve('src/app/components'),
      '@shared'     : path.resolve('src/app/shared'),
      'api'         : path.resolve(__dirname, 'api/server'),
      'components'  : path.resolve(__dirname, 'src/components'),
      'directives'  : path.resolve(__dirname, 'src/directives'),
      'pages'       : path.resolve(__dirname, 'src/pages'),
      'providers'   : path.resolve(__dirname, 'src/providers'),
    },
  },

  externals : [
    {
      //Since sharp is a server-only package, and it is not supported by the client, so replace it with an empty dummy-object so errors won't occur.
      sharp : '{}',
    },
    resolveExternals,
  ],

  node      : {
    __dirname : true,
  },
};

function resolveExternals(context, request, callback) {
  return resolveMeteor(request, callback) || callback();
}

function resolveMeteor(request, callback) {
  var match = request.match(/^meteor\/(.+)$/);
  var pack = match && match[1];

  if (pack) {
    callback(null, 'Package["' + pack + '"]');
    return true;
  }
}

module.exports = {
  // @ts-ignore
  dev  : webpackMerge(dev, customConfig),
  // @ts-ignore
  prod : webpackMerge(prod, customConfig),
};
