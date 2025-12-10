import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ShieldIcon } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface BottomNavProps {
  activeTab: string;
  userRole: "admin" | "owner" | "member" | undefined;
  onTabChange: (tab: string) => void;
}

export function BottomNav({
  activeTab,
  userRole,
  onTabChange,
}: BottomNavProps) {
  const isAdmin = userRole === "admin" || userRole === "owner";
  const tabs = [
    {
      id: "hq",
      label: "HQ",
      icon: (active: boolean) => (
        <MaterialIcons
          name="home"
          size={24}
          color={active ? "#f97316" : "#9ca3af"}
        />
      ),
    },
    {
      id: "map",
      label: "Map",
      icon: (active: boolean) => (
        <MaterialIcons
          name="map"
          size={24}
          color={active ? "#f97316" : "#9ca3af"}
        />
      ),
    },
    {
      id: "scouting",
      label: "Scouting",
      icon: (active: boolean) => (
        <Ionicons
          name="eye-outline"
          size={24}
          color={active ? "#f97316" : "#9ca3af"}
        />
      ),
    },
    {
      id: "friends",
      label: "Friends",
      icon: (active: boolean) => (
        <Ionicons
          name="people-outline"
          size={24}
          color={active ? "#f97316" : "#9ca3af"}
        />
      ),
    },
    {
      id: "mytools",
      label: "My Tools",
      icon: (active: boolean) => (
        <Ionicons
          name="construct-outline"
          size={24}
          color={active ? "#f97316" : "#9ca3af"}
        />
      ),
    },
    ...(isAdmin
      ? [
          {
            id: "members",
            label: "Members",
            icon: (active: boolean) => (
              <ShieldIcon size={24} color={active ? "#f97316" : "#9ca3af"} />
            ),
          },
        ]
      : []),
  ];

  return (
    <View className="bg-gray-900 border-t border-gray-800 flex-row justify-around">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className="items-center flex-1 py-2"
          >
            {tab.icon(isActive)}
            <Text
              className={`text-xs mt-1 ${
                isActive ? "text-orange-500" : "text-gray-400"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
