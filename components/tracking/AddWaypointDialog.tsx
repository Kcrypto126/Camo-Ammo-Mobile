import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api.js";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

interface AddWaypointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lat: number;
  lng: number;
  altitude?: number;
}

const waypointTypes = [
  "Tree Stand",
  "Blind",
  "Trail Camera",
  "Marker",
  "Parking",
  "Camp",
];

// Map display labels to API values
const typeValueMap: Record<string, string> = {
  "Tree Stand": "stand",
  Blind: "blind",
  "Trail Camera": "camera",
  Marker: "marker",
  Parking: "parking",
  Camp: "camp",
};

export default function AddWaypointDialog({
  open,
  onOpenChange,
  lat,
  lng,
  altitude,
}: AddWaypointDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Marker");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createWaypoint = useMutation(api.waypoints.createWaypoint);

  async function handleSubmit() {
    if (!name.trim()) {
      showToast("Please enter a name");
      return;
    }
    setIsSubmitting(true);
    try {
      // Convert label back to value for API
      const typeValue = typeValueMap[type] || "marker";
      await createWaypoint({
        name: name.trim(),
        description: description.trim() || undefined,
        lat,
        lng,
        altitude,
        type: typeValue,
      });
      showToast("Waypoint added");
      onOpenChange(false);
      setName("");
      setDescription("");
      setType("Marker");
    } catch (error) {
      showToast("Failed to add waypoint");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className=""
      >
        <ScrollView
          contentContainerStyle={{}}
          keyboardShouldPersistTaps="handled"
        >
          <View className="space-y-3">
            {/* Header */}
            <Text className="text-lg font-bold text-white mb-1">
              Add Waypoint
            </Text>
            <Text className="text-xs text-gray-400 mb-4">
              Mark this location for future reference
            </Text>

            {/* Name input */}
            <View className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="e.g., Big Oak Tree Stand"
                className=""
              />
            </View>

            {/* Type select */}
            <View className="space-y-2 mt-2">
              <Label>Type</Label>
              <Select
                options={waypointTypes}
                value={type}
                onChange={setType}
                placeholder="Select type"
              />
            </View>

            {/* Description input */}
            <View className="space-y-2 mt-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes about this location..."
                className=""
                multiline
                numberOfLines={3}
                style={{ minHeight: 60, textAlignVertical: "top" }}
              />
            </View>

            {/* Coordinates etc */}
            <View className="mb-2">
              <Text className="text-xs text-gray-400">
                Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
              </Text>
              {altitude !== undefined && (
                <Text className="text-xs text-gray-400">
                  Altitude: {Math.round(altitude * 3.28084)} ft
                </Text>
              )}
            </View>

            {/* Buttons */}
            <View className="flex-row justify-between mt-4">
              <Button
                type="outline"
                onPress={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Waypoint"}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Dialog>
  );
}
