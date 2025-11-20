import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  locationName?: string;
  countryCode?: string;
  onStartHunt?: () => void;
  onNotificationPress?: () => void;
}

export function Header({
  locationName = "Marnila",
  countryCode = "CA",
  onStartHunt,
  onNotificationPress,
}: HeaderProps) {
  return (
    <View className="bg-gray-900 px-4 py-3 flex-row items-center justify-between">
      {/* Location Info */}
      <View className="flex-row items-center flex-1">
        <AntDesign name="environment" size={20} color="#f97316" />
        <View className="ml-2">
          <Text className="text-white text-lg font-bold">{locationName}</Text>
          <Text className="text-gray-400 text-sm">{countryCode}</Text>
        </View>
      </View>

      {/* Right Actions */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onStartHunt}
          className="bg-orange-500 rounded-lg px-4 py-2 flex-row items-center"
        >
          <AntDesign name="plus" size={16} color="#000" />
          <Text className="text-black font-semibold ml-2">Start Hunt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
