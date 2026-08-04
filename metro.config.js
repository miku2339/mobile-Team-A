const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// macOS cloud-backed folders can briefly surface conflict copies such as
// "@react-native 2" while dependencies are changing. They are never valid
// package paths and can otherwise crash Metro's native watcher.
const macCloudConflictCopy =
  /node_modules[\\/](?:.*[\\/])?[^\\/]* 2(?:\.[^\\/]+)?(?:[\\/]|$)/;

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : [config.resolver.blockList].filter(Boolean)),
  macCloudConflictCopy
];

module.exports = config;
