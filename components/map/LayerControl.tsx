import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface LayerControlProps {
  layers: {
    properties: boolean;
    huntingUnits: boolean;
    publicLand: boolean;
    friends: boolean;
  };
  onLayerToggle: (layer: string, enabled: boolean) => void;
}

const layersIcons: Record<string, string> = {
  properties: "location-outline", // Ionicons alternative for MapPin
  huntingUnits: "map-outline", // Ionicons icon for map/terrain areas
  publicLand: "tree-outline", // Ionicons alternative for Trees
  friends: "people-outline", // Ionicons alternative for Users
};

export default function LayerControl({
  layers,
  onLayerToggle,
}: LayerControlProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="absolute top-12 right-3 z-50">
      <TouchableOpacity
        className="flex-row items-center gap-1 bg-zinc-900/90 px-4 py-2 rounded-lg shadow-lg"
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons
          name="layers-outline"
          size={18}
          color="#fff"
          className="mr-2"
        />
        <Text className="text-white text-base font-semibold">Layers</Text>
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
        className="border"
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.36)" }}
          onPress={() => setVisible(false)}
        >
          <View
            className="absolute right-3 top-[108px] w-[220px] rounded-xl bg-zinc-900 shadow-xl px-0 py-2"
            style={{ elevation: 8 }}
          >
            <Text className="text-orange-400 uppercase px-4 pb-1 font-bold text-xs">
              Map Layers
            </Text>
            <View className="h-px my-1 mx-1 bg-zinc-700" />
            {/* Property Boundaries */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-2"
              activeOpacity={0.7}
              onPress={() => onLayerToggle("properties", !layers.properties)}
            >
              <Ionicons
                name="location-outline"
                size={17}
                color={layers.properties ? "#22c55e" : "#bcbcbc"}
                className="mr-2"
              />
              <Text className="flex-1 text-sm ml-2 text-white">
                Property Boundaries
              </Text>
              <Ionicons
                name={layers.properties ? "checkbox" : "square-outline"}
                size={18}
                color={layers.properties ? "#22c55e" : "#bcbcbc"}
              />
            </TouchableOpacity>
            {/* WMAs & Hunting Units */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-2"
              activeOpacity={0.7}
              onPress={() =>
                onLayerToggle("huntingUnits", !layers.huntingUnits)
              }
            >
              <Ionicons
                name="map-outline"
                size={17}
                color={layers.huntingUnits ? "#0ea5e9" : "#bcbcbc"}
                className="mr-2"
              />
              <Text className="flex-1 text-sm ml-2 text-white">
                WMAs & Hunting Units
              </Text>
              <Ionicons
                name={layers.huntingUnits ? "checkbox" : "square-outline"}
                size={18}
                color={layers.huntingUnits ? "#0ea5e9" : "#bcbcbc"}
              />
            </TouchableOpacity>
            {/* Friends' Locations */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-2"
              activeOpacity={0.7}
              onPress={() => onLayerToggle("friends", !layers.friends)}
            >
              <Ionicons
                name="people-outline"
                size={17}
                color={layers.friends ? "#a21caf" : "#bcbcbc"}
                className="mr-2"
              />
              <Text className="flex-1 text-sm ml-2 text-white">
                Friends' Locations
              </Text>
              <Ionicons
                name={layers.friends ? "checkbox" : "square-outline"}
                size={18}
                color={layers.friends ? "#a21caf" : "#bcbcbc"}
              />
            </TouchableOpacity>

            {/* Legend - Property Colors */}
            <View className="h-px my-2 mx-1 bg-zinc-700" />
            <Text className="px-4 pb-1 text-xs text-neutral-400 font-normal">
              Property Colors
            </Text>
            <View className="px-4 pb-2 space-y-1 mt-1">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 bg-green-500 rounded mr-2" />
                <Text className="text-xs text-white">Public Property</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 bg-red-500 rounded mr-2" />
                <Text className="text-xs text-white">Private Property</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 bg-blue-500 rounded mr-2" />
                <Text className="text-xs text-white">State Property</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 bg-purple-500 rounded mr-2" />
                <Text className="text-xs text-white">Federal Property</Text>
              </View>
            </View>
            {/* Legend - Hunting Unit Colors */}
            <View className="h-px my-2 mx-1 bg-zinc-700" />
            <Text className="px-4 pb-1 text-xs text-neutral-400 font-normal">
              Hunting Unit Colors
            </Text>
            <View className="px-4 pb-2 space-y-1 mt-1">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 bg-emerald-500 rounded mr-2" />
                <Text className="text-xs text-white">WMA</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 bg-teal-500 rounded mr-2" />
                <Text className="text-xs text-white">State Park</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 bg-emerald-700 rounded mr-2" />
                <Text className="text-xs text-white">National Forest</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
