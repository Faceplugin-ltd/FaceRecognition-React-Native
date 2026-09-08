const path = require('path');
const pak = require('../package.json');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          // More specific subpath first. Map package root to `src/` (not
          // `src/index`) so `face-recognition-sdk/capture` → `src/capture`.
          [`${pak.name}/capture`]: path.join(__dirname, '..', 'src', 'capture'),
          [`${pak.name}/identify`]: path.join(__dirname, '..', 'src', 'identify'),
          [`${pak.name}/result`]: path.join(__dirname, '..', 'src', 'resultDetails'),
          [pak.name]: path.join(__dirname, '..', 'src'),
        },
      },
    ],
  ],
};
