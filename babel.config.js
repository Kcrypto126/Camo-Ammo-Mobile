module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }], // Use nativewind as jsxImportSource
      "nativewind/babel", // Add nativewind as a preset
    ],
    plugins: [
      "expo-router/babel", // Ensure expo-router is in plugins array
      "react-native-reanimated/plugin", // Add other plugins if you use them
    ],
  };
};
