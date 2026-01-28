const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
const config = {
  resolver: {
    // Block Node.js built-in modules that don't exist in React Native
    resolveRequest: (context, moduleName, platform) => {
      // Redirect axios to use browser build
      if (moduleName === 'axios') {
        return context.resolveRequest(context, 'axios/dist/browser/axios.cjs', platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
    // Exclude fabric components from being processed
    blockList: [
      /node_modules\/react-native-screens\/src\/fabric\/.*/,
    ],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
