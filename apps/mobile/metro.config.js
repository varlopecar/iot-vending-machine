const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, "../..");

const baseConfig = getDefaultConfig(projectRoot);

// Étend la config pour NativeWind
const nativeWindConfig = withNativeWind(baseConfig, {
  input: "./global.css",
});

const { transformer, resolver } = nativeWindConfig;

module.exports = {
  ...nativeWindConfig,
  transformer: {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
    nodeModulesPaths: [projectRoot, workspaceRoot],
    // Add resolver for Stripe React Native web compatibility
    alias: {
      ...resolver.alias,
      // Mock Stripe React Native modules for web builds
      '@stripe/stripe-react-native': path.resolve(__dirname, './stripe-web-mock.js'),
    },
  },
  watchFolders: [workspaceRoot],
};