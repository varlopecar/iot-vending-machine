const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configuration pour NativeWind v4
const nativeWindConfig = withNativeWind(config, {
  input: './global.css',
});

// Configuration pour SVG transformer
const { transformer, resolver } = nativeWindConfig;

module.exports = {
  ...nativeWindConfig,
  transformer: {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  },
};