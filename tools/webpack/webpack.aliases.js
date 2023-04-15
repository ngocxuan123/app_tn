const { createWebpackAliases } = require('./webpack.helpers');

// Export aliases
module.exports = createWebpackAliases({
  '@assets': 'assets',
  '@components': 'src/renderer/components',
  '@common': 'src/common',
  '@main': 'src/main',
  '@renderer': 'src/renderer',
  '@src': 'src',
  '@modules': 'src/modules',
  '@application': 'src/application',
  '@infrastructure': 'src/infrastructure',
  '@domain': 'src/domain',
  '@misc': 'misc',
});
