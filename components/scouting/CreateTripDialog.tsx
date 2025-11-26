import { Button } from "@/components/ui/Button";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioItem } from "@/components/ui/RadioGroup";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api.js";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTIVITY_OPTIONS = ["scouting", "hunting", "camping", "hiking"];
const GAME_OPTIONS = [
  "deer",
  "turkey",
  "elk",
  "waterfowl",
  "upland",
  "bear",
  "small_game",
];

export default function CreateTripDialog({
  open,
  onOpenChange,
}: CreateTripDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [state, setState] = useState("");
  const [activityType, setActivityType] = useState("scouting");
  const [gameType, setGameType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [maxParticipants, setMaxParticipants] = useState("");

  const createTrip = useMutation(api.scoutingTrips.createTrip);

  const handleSubmit = async () => {
    if (!title.trim() || !locationName.trim() || !startDate || !endDate) {
      showToast("Please fill in all required fields");
      return;
    }

    if (!lat || !lng) {
      showToast("Please provide location coordinates");
      return;
    }

    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();

    if (endTimestamp < startTimestamp) {
      showToast("End date must be after start date");
      return;
    }

    try {
      await createTrip({
        title: title.trim(),
        description: description.trim() || undefined,
        locationName: locationName.trim(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        state: state.trim() || undefined,
        activityType,
        gameType: gameType.trim() || undefined,
        startDate: startTimestamp,
        endDate: endTimestamp,
        privacy,
        maxParticipants: maxParticipants
          ? parseInt(maxParticipants)
          : undefined,
      });

      showToast("Trip created successfully!");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        showToast(message);
      } else {
        showToast("Failed to create trip");
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocationName("");
    setLat("");
    setLng("");
    setState("");
    setActivityType("scouting");
    setGameType("");
    setStartDate("");
    setEndDate("");
    setPrivacy("public");
    setMaxParticipants("");
  };

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <ScrollView className="max-h-[70vh]" showsVerticalScrollIndicator={true}>
        <View className="flex flex-col gap-2">
          {/* Header */}
          <View className="space-y-1">
            <Text className="text-xl font-bold text-white">
              Create Scouting Trip
            </Text>
            <Text className="text-sm text-gray-400">
              Create a trip to find scouting partners in your area
            </Text>
          </View>

          <View className="space-y-2">
            <Label>
              Trip Title <Text className="text-red-500">*</Text>
            </Label>
            <Input
              placeholder="Early Season Deer Scout"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Looking for partners to scout public land before opening day..."
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 space-y-2">
              <Label>
                Activity Type <Text className="text-red-500">*</Text>
              </Label>
              <Select
                options={ACTIVITY_OPTIONS.map(
                  (opt) => opt.charAt(0).toUpperCase() + opt.slice(1)
                )}
                value={
                  activityType
                    ? activityType.charAt(0).toUpperCase() +
                      activityType.slice(1)
                    : undefined
                }
                onChange={(val) => setActivityType(val.toLowerCase())}
                placeholder="Select activity"
              />
            </View>

            <View className="flex-1 space-y-2">
              <Label>Game Type (optional)</Label>
              <Select
                options={[
                  ...GAME_OPTIONS.map((opt) =>
                    opt
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")
                  ),
                ]}
                value={
                  gameType
                    ? gameType
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")
                    : undefined
                }
                onChange={(val) =>
                  setGameType(val.toLowerCase().replace(/\s+/g, "_"))
                }
                placeholder="Select game"
              />
            </View>
          </View>

          <View className="space-y-2">
            <Label>
              Location Name <Text className="text-red-500">*</Text>
            </Label>
            <Input
              placeholder="Mark Twain National Forest"
              value={locationName}
              onChangeText={setLocationName}
            />
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 space-y-2">
              <Label>
                Latitude <Text className="text-red-500">*</Text>
              </Label>
              <Input
                placeholder="38.5767"
                value={lat}
                onChangeText={setLat}
                keyboardType="numeric"
              />
            </View>

            <View className="flex-1 space-y-2">
              <Label>
                Longitude <Text className="text-red-500">*</Text>
              </Label>
              <Input
                placeholder="-92.1735"
                value={lng}
                onChangeText={setLng}
                keyboardType="numeric"
              />
            </View>

            <View className="flex-1 space-y-2">
              <Label>State</Label>
              <Input
                placeholder="MO"
                value={state}
                onChangeText={setState}
                maxLength={2}
              />
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 space-y-2">
              <Label>
                Start Date <Text className="text-red-500">*</Text>
              </Label>
              <DatePickerInput
                value={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  // Clear end date if it's before the new start date
                  if (endDate && new Date(endDate) < new Date(date)) {
                    setEndDate("");
                  }
                }}
                placeholder="Select start date"
                minimumDate={new Date()}
              />
            </View>

            <View className="flex-1 space-y-2">
              <Label>
                End Date <Text className="text-red-500">*</Text>
              </Label>
              <DatePickerInput
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date"
                minimumDate={startDate ? new Date(startDate) : new Date()}
              />
            </View>
          </View>

          <View className="space-y-2">
            <Label>Max Participants (optional)</Label>
            <Input
              placeholder="No limit"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="numeric"
            />
          </View>

          <View className="space-y-3">
            <Label>Privacy</Label>
            <View className="space-y-2">
              <RadioItem
                value="public"
                selectedValue={privacy}
                onSelect={setPrivacy}
                label="Public - Anyone can see and join"
              />
              <RadioItem
                value="friends_only"
                selectedValue={privacy}
                onSelect={setPrivacy}
                label="Friends Only - Only friends can see and join"
              />
              <RadioItem
                value="private"
                selectedValue={privacy}
                onSelect={setPrivacy}
                label="Private - Only you (for planning)"
              />
            </View>
          </View>

          <View className="flex-row gap-2 pt-4">
            <Button
              type="outline"
              onPress={() => onOpenChange(false)}
              className="flex-1"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </Button>
            <Button type="primary" onPress={handleSubmit} className="flex-1">
              <Text className="text-white font-semibold">Create Trip</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Dialog>
  );
}
