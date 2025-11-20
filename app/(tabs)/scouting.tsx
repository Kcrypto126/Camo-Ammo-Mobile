import { Text, View } from "react-native";

export default function ScoutingPage() {
  return (
    <View className="flex-1 bg-gray-900">
      <Text className="text-white text-xl font-bold p-4">Scouting</Text>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-gray-400 text-center">
          Scouting content will be displayed here
        </Text>
      </View>
    </View>
  );
}

