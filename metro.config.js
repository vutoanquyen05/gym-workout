const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Thêm 'wasm' vào danh sách các asset extensions để hỗ trợ expo-sqlite trên Web
config.resolver.assetExts.push('wasm');

module.exports = config;
