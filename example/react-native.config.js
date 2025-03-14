const path = require('path');
const pak = require('../package.json');

module.exports = {
  dependencies: {
    'face-recognition-sdk': {
      root: path.join(__dirname, '..'),
      platforms: {
        ios: {},
        android: {},
      },
    },
  },
};
