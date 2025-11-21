import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export type RNMapType = "standard" | "satellite" | "hybrid" | "terrain";

const MAP_TYPE_NAMES: Record<RNMapType, string> = {
  standard: "Roadmap",
  satellite: "Satellite",
  hybrid: "Hybrid",
  terrain: "Terrain",
};

const MAP_TYPE_KEYS: RNMapType[] = [
  "standard",
  "satellite",
  "hybrid",
  "terrain",
];

interface MapTypeControlProps {
  mapType: RNMapType;
  onMapTypeChange: (mapType: RNMapType) => void;
}

export function MapTypeControl({
  mapType,
  onMapTypeChange,
}: MapTypeControlProps) {
  return (
    <View className="bg-zinc-800/90 rounded-lg flex-row items-center justify-between py-1 px-2">
      {MAP_TYPE_KEYS.map((type) => (
        <TouchableOpacity
          key={type}
          className={`flex-row items-center px-2 py-1 mx-0.5 rounded-lg ${mapType === type ? "bg-zinc-900/70" : ""}`}
          onPress={() => onMapTypeChange(type)}
        >
          <Ionicons
            name={
              type === "standard"
                ? "map"
                : type === "satellite"
                  ? "planet"
                  : type === "hybrid"
                    ? "layers"
                    : "train"
            }
            size={16}
            color={mapType === type ? "#f97316" : "#bcbcbc"}
          />
          <Text
            className={`ml-1 text-sm ${mapType === type ? "text-orange-500 font-bold" : "text-neutral-400"}`}
          >
            {MAP_TYPE_NAMES[type]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
