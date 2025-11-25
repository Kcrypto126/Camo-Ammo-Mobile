import { Button } from "@/components/ui/Button";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Mail, MapPin, Phone, X } from "lucide-react-native";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PropertyDetailsPanelProps {
  property: Doc<"properties"> | null;
  onClose: () => void;
}

export default function PropertyDetailsPanel({
  property,
  onClose,
}: PropertyDetailsPanelProps) {
  if (!property) return null;

  return (
    <View className="absolute top-0 left-0 bottom-0 w-96 bg-gray-900 border-r border-gray-700 z-[1000]">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
        <Text className="text-lg font-bold text-white">Property Details</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <X size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4 space-y-6">
          {/* Owner Information */}
          <View>
            <Text className="font-semibold text-sm text-gray-400 mb-2">
              OWNER INFORMATION
            </Text>
            <View className="space-y-3">
              <View>
                <Text className="font-bold text-lg text-white">
                  {property.ownerName}
                </Text>
                <Text className="text-sm text-gray-400 capitalize">
                  {property.propertyType} Property Owner
                </Text>
              </View>

              {property.ownerPhone && (
                <View className="flex-row items-start gap-3">
                  <Phone size={20} color="#9ca3af" style={{ marginTop: 2 }} />
                  <View>
                    <Text className="text-xs text-gray-400">Phone</Text>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(`tel:${property.ownerPhone}`)
                      }
                    >
                      <Text className="text-orange-500 font-medium">
                        {property.ownerPhone}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {property.ownerEmail && (
                <View className="flex-row items-start gap-3">
                  <Mail size={20} color="#9ca3af" style={{ marginTop: 2 }} />
                  <View>
                    <Text className="text-xs text-gray-400">Email</Text>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(`mailto:${property.ownerEmail}`)
                      }
                    >
                      <Text className="text-orange-500">
                        {property.ownerEmail}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {property.ownerAddress && (
                <View className="flex-row items-start gap-3">
                  <MapPin size={20} color="#9ca3af" style={{ marginTop: 2 }} />
                  <View>
                    <Text className="text-xs text-gray-400">
                      Mailing Address
                    </Text>
                    <Text className="text-sm text-white">
                      {property.ownerAddress}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Property Information */}
          <View className="border-t border-gray-700 pt-4">
            <Text className="font-semibold text-sm text-gray-400 mb-3">
              PROPERTY INFORMATION
            </Text>
            <View className="space-y-3">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-xs text-gray-400">Acreage</Text>
                  <Text className="font-bold text-xl text-white">
                    {property.acreage.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-400">Property Type</Text>
                  <Text className="font-medium capitalize text-white">
                    {property.propertyType}
                  </Text>
                </View>
              </View>

              {property.landUse && (
                <View>
                  <Text className="text-xs text-gray-400">Land Use</Text>
                  <Text className="font-medium text-white">
                    {property.landUse}
                  </Text>
                </View>
              )}

              <View>
                <Text className="text-xs text-gray-400">Location</Text>
                <Text className="font-medium text-white">
                  {property.address || "No address"}
                </Text>
                <Text className="text-sm text-gray-400">
                  {property.county}, {property.state}
                </Text>
              </View>

              <View>
                <Text className="text-xs text-gray-400">Parcel ID</Text>
                <Text className="font-mono text-sm text-white">
                  {property.parcelId}
                </Text>
              </View>

              <View>
                <Text className="text-xs text-gray-400">Coordinates</Text>
                <Text className="text-sm font-mono text-white">
                  {property.centerLat.toFixed(6)},{" "}
                  {property.centerLng.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>

          {/* Verification Status */}
          <View className="border-t border-gray-700 pt-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-400">
                  Verification Status
                </Text>
                <Text
                  className={`font-medium ${
                    property.verified ? "text-green-500" : "text-yellow-500"
                  }`}
                >
                  {property.verified ? "✓ Verified" : "⚠ Unverified"}
                </Text>
              </View>
              {property.lastUpdated && (
                <View className="items-end">
                  <Text className="text-xs text-gray-400">Last Updated</Text>
                  <Text className="text-sm text-white">
                    {new Date(property.lastUpdated).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-2 pt-2">
            <Button type="primary" className="w-full">
              <Text>Request Hunting Permission</Text>
            </Button>
            <Button type="outline" className="w-full">
              <Text>Save to My Properties</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
