import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import {
  Calendar,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react-native";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HuntingUnitPanelProps {
  unit: Doc<"huntingUnits"> | null;
  onClose: () => void;
}

export default function HuntingUnitPanel({
  unit,
  onClose,
}: HuntingUnitPanelProps) {
  if (!unit) return null;

  const getTypeBadgeVariant = (
    type: string
  ): "default" | "secondary" | "destructive" | "success" | undefined => {
    switch (type) {
      case "WMA":
        return "default";
      case "National Forest":
        return "secondary";
      case "State Park":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <View className="absolute top-0 left-0 bottom-0 w-96 bg-gray-900 border-r border-gray-700 z-[1000]">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
        <Text className="text-lg font-bold text-white">
          Hunting Unit Details
        </Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <X size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4 space-y-6">
          {/* Header */}
          <View>
            <View className="flex-row items-start justify-between gap-2 mb-2">
              <Text className="font-bold text-xl text-white flex-1">
                {unit.name}
              </Text>
              <Badge type={getTypeBadgeVariant(unit.type)}>{unit.type}</Badge>
            </View>
            <Text className="text-sm text-gray-400">{unit.state}</Text>
            <Text className="text-xs font-mono text-gray-400 mt-1">
              ID: {unit.unitId}
            </Text>
          </View>

          {/* Description */}
          {unit.description && (
            <View className="border-t border-gray-700 pt-4">
              <Text className="font-semibold text-sm text-gray-400 mb-2">
                ABOUT THIS AREA
              </Text>
              <Text className="text-sm leading-relaxed text-white">
                {unit.description}
              </Text>
            </View>
          )}

          {/* Hunting Status */}
          <View className="border-t border-gray-700 pt-4">
            <Text className="font-semibold text-sm text-gray-400 mb-3">
              HUNTING STATUS
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-start gap-3">
                <ShieldCheck
                  size={20}
                  color={unit.allowsHunting ? "#22c55e" : "#ef4444"}
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="font-medium text-white">
                    {unit.allowsHunting
                      ? "Hunting Allowed"
                      : "No Hunting Permitted"}
                  </Text>
                  {unit.allowsHunting && unit.permitRequired && (
                    <Text className="text-sm text-gray-400 mt-1">
                      ⚠️ Permit or reservation required
                    </Text>
                  )}
                  {unit.allowsHunting && !unit.permitRequired && (
                    <Text className="text-sm text-gray-400 mt-1">
                      ✓ No special permit required (state license needed)
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Season Dates */}
          {unit.seasonDates && (
            <View className="border-t border-gray-700 pt-4">
              <Text className="font-semibold text-sm text-gray-400 mb-3">
                HUNTING SEASONS
              </Text>
              <View className="flex-row items-start gap-3">
                <Calendar size={20} color="#9ca3af" style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-sm text-white whitespace-pre-line">
                    {unit.seasonDates}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Regulations */}
          {unit.regulations && (
            <View className="border-t border-gray-700 pt-4">
              <Text className="font-semibold text-sm text-gray-400 mb-3">
                REGULATIONS & RULES
              </Text>
              <View className="flex-row items-start gap-3">
                <FileText size={20} color="#9ca3af" style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-sm leading-relaxed text-white">
                    {unit.regulations}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Location Information */}
          <View className="border-t border-gray-700 pt-4">
            <Text className="font-semibold text-sm text-gray-400 mb-3">
              LOCATION
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <MapPin size={16} color="#9ca3af" />
                <Text className="text-sm text-white">Center Point</Text>
              </View>
              <Text className="text-sm font-mono pl-6 text-white">
                {unit.centerLat.toFixed(6)}, {unit.centerLng.toFixed(6)}
              </Text>
              <Button
                type="outline"
                className="w-full mt-2"
                onPress={() => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${unit.centerLat},${unit.centerLng}`;
                  Linking.openURL(url);
                }}
              >
                <ExternalLink size={16} color="#fff" />
                <Text className="text-white ml-2">Open in Google Maps</Text>
              </Button>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-2 pt-2">
            <Button type="primary" className="w-full">
              <Text>Save to My Hunting Areas</Text>
            </Button>
            <Button type="outline" className="w-full">
              <Text>Share Location</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
