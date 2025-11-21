import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { api } from "@/convex/_generated/api.js";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// simple Toast substitute for React Native
import { Alert } from "react-native";

interface AddWaypointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lat: number;
  lng: number;
  altitude?: number;
}

const waypointTypes = [
  { value: "stand", label: "Tree Stand" },
  { value: "blind", label: "Blind" },
  { value: "camera", label: "Trail Camera" },
  { value: "marker", label: "Marker" },
  { value: "parking", label: "Parking" },
  { value: "camp", label: "Camp" },
];

export default function AddWaypointDialog({
  open,
  onOpenChange,
  lat,
  lng,
  altitude,
}: AddWaypointDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("marker");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  const createWaypoint = useMutation(api.waypoints.createWaypoint);

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter a name");
      return;
    }
    setIsSubmitting(true);
    try {
      await createWaypoint({
        name: name.trim(),
        description: description.trim() || undefined,
        lat,
        lng,
        altitude,
        type,
      });
      Alert.alert("Success", "Waypoint added");
      onOpenChange(false);
      setName("");
      setDescription("");
      setType("marker");
    } catch (error) {
      Alert.alert("Error", "Failed to add waypoint");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Label (just a <Text> with semibold style and margin)
  const Label = ({ children }: { children: React.ReactNode }) => (
    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
      {children}
    </Text>
  );

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
            <View className="mb-2">
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Add Waypoint
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Mark this location for future reference
              </Text>
            </View>

            {/* Name input */}
            <View className="mb-2">
              <Label>Name *</Label>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="e.g., Big Oak Tree Stand"
                className=""
              />
            </View>

            {/* Type select (custom) */}
            <View className="mb-2">
              <Label>Type</Label>
              <TouchableOpacity
                className="border px-3 py-2 rounded-lg flex-row items-center justify-between bg-gray-50 dark:bg-gray-800"
                onPress={() => setTypeMenuOpen((v) => !v)}
                activeOpacity={0.8}
              >
                <Text className="text-base">
                  {waypointTypes.find((wt) => wt.value === type)?.label ||
                    "Select type"}
                </Text>
                <Text className="text-lg text-gray-400">
                  {typeMenuOpen ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
              {typeMenuOpen && (
                <View className="mt-2 border bg-white dark:bg-gray-800 rounded-lg shadow p-1">
                  {waypointTypes.map((wt) => (
                    <TouchableOpacity
                      key={wt.value}
                      className={`px-3 py-2 rounded ${type === wt.value ? "bg-emerald-100 dark:bg-emerald-800" : ""}`}
                      onPress={() => {
                        setType(wt.value);
                        setTypeMenuOpen(false);
                      }}
                    >
                      <Text className="text-base">{wt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Description input */}
            <View className="mb-2">
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
            <View className="flex-row justify-end gap-2 mt-1">
              <Button
                type="outline"
                onPress={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="mr-2"
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
