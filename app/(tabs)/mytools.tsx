import { Text, View } from "react-native";

export default function MyToolsPage() {
  return (
    <View className="flex-1 bg-gray-900">
      <Text className="text-white text-xl font-bold p-4">My Tools</Text>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-gray-400 text-center">
          My Tools content will be displayed here
        </Text>
      </View>
    </View>
  );
}

