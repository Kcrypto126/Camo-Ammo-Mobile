import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

interface CreateLeaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTIVITIES = [
  "deer_hunting",
  "turkey_hunting",
  "waterfowl",
  "small_game",
  "fishing",
  "camping",
];
const GAME_TYPES = [
  "deer",
  "turkey",
  "duck",
  "goose",
  "elk",
  "rabbit",
  "squirrel",
  "dove",
];
const AMENITIES_LIST = [
  "cabin",
  "electricity",
  "water",
  "food_plots",
  "stands",
  "blinds",
  "atv_trails",
  "camping_allowed",
];
const TERRAIN_TYPES = [
  "hardwoods",
  "pines",
  "mixed",
  "open_fields",
  "bottomland",
];
const LEASE_TERMS = ["annual", "seasonal", "daily"];

export default function CreateLeaseDialog({
  open,
  onOpenChange,
}: CreateLeaseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowedActivities, setAllowedActivities] = useState<string[]>([]);
  const [gameTypes, setGameTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [exclusiveAccess, setExclusiveAccess] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acreage, setAcreage] = useState("");
  const [state, setState] = useState("");
  const [county, setCounty] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [pricePerYear, setPricePerYear] = useState("");
  const [pricePerSeason, setPricePerSeason] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [leaseTerm, setLeaseTerm] = useState("annual");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [maxHunters, setMaxHunters] = useState("");
  const [terrain, setTerrain] = useState("");
  const [rules, setRules] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const createLease = useMutation(api.landLeases.createLease);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAcreage("");
    setState("");
    setCounty("");
    setAddress("");
    setLat("");
    setLng("");
    setPricePerYear("");
    setPricePerSeason("");
    setPricePerDay("");
    setLeaseTerm("annual");
    setAvailableFrom("");
    setAvailableTo("");
    setMaxHunters("");
    setTerrain("");
    setRules("");
    setContactPhone("");
    setContactEmail("");
    setAllowedActivities([]);
    setGameTypes([]);
    setAmenities([]);
    setExclusiveAccess(true);
  };

  const onSubmit = async () => {
    // Validation
    if (!title.trim() || title.length < 5) {
      showToast("Title must be at least 5 characters");
      return;
    }
    if (!description.trim() || description.length < 20) {
      showToast("Description must be at least 20 characters");
      return;
    }
    if (!acreage.trim()) {
      showToast("Acreage is required");
      return;
    }
    if (!state.trim()) {
      showToast("State is required");
      return;
    }
    if (!county.trim()) {
      showToast("County is required");
      return;
    }
    if (!lat.trim()) {
      showToast("Latitude is required");
      return;
    }
    if (!lng.trim()) {
      showToast("Longitude is required");
      return;
    }
    if (!pricePerYear.trim()) {
      showToast("Annual price is required");
      return;
    }
    if (!leaseTerm.trim()) {
      showToast("Lease term is required");
      return;
    }
    if (!availableFrom.trim()) {
      showToast("Start date is required");
      return;
    }
    if (!availableTo.trim()) {
      showToast("End date is required");
      return;
    }
    if (allowedActivities.length === 0) {
      showToast("Please select at least one allowed activity");
      return;
    }
    if (gameTypes.length === 0) {
      showToast("Please select at least one game type");
      return;
    }

    setIsSubmitting(true);
    try {
      await createLease({
        title: title.trim(),
        description: description.trim(),
        acreage: parseFloat(acreage),
        state: state.trim(),
        county: county.trim(),
        address: address.trim() || undefined,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        pricePerYear: parseFloat(pricePerYear),
        pricePerSeason: pricePerSeason.trim()
          ? parseFloat(pricePerSeason)
          : undefined,
        pricePerDay: pricePerDay.trim() ? parseFloat(pricePerDay) : undefined,
        leaseTerm,
        availableFrom: new Date(availableFrom).getTime(),
        availableTo: new Date(availableTo).getTime(),
        allowedActivities,
        gameTypes,
        maxHunters: maxHunters.trim() ? parseInt(maxHunters) : undefined,
        amenities,
        terrain: terrain.trim() || undefined,
        rules: rules.trim() || undefined,
        exclusiveAccess,
        contactPhone: contactPhone.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      });

      showToast("Lease created successfully!");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create lease:", error);
      showToast("Failed to create lease. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActivity = (activity: string) => {
    setAllowedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const toggleGame = (game: string) => {
    setGameTypes((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="max-h-[90vh]"
      >
        <ScrollView className="max-h-[90vh]">
          <View className="gap-6">
            <View className="gap-1">
              <Text className="text-xl font-bold text-white">
                List Your Property for Lease
              </Text>
              <Text className="text-sm text-gray-400">
                Create a listing to lease your hunting land to other hunters
              </Text>
            </View>

            {/* Basic Info */}
            <View className="gap-4">
              <Text className="font-semibold text-white">
                Basic Information
              </Text>

              <View className="gap-2">
                <Label>
                  Listing Title <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  placeholder="e.g., Premium 200-Acre Deer Hunting Property"
                  value={title}
                  onChangeText={setTitle}
                />
                {title.length > 0 && title.length < 5 && (
                  <Text className="text-sm text-red-500">
                    Title must be at least 5 characters
                  </Text>
                )}
              </View>

              <View className="gap-2">
                <Label>
                  Description <Text className="text-red-500">*</Text>
                </Label>
                <Textarea
                  placeholder="Describe your property, amenities, game population, etc."
                  value={description}
                  onChangeText={setDescription}
                  className="min-h-32"
                />
                {description.length > 0 && description.length < 20 && (
                  <Text className="text-sm text-red-500">
                    Description must be at least 20 characters
                  </Text>
                )}
              </View>
            </View>

            {/* Location */}
            <View className="gap-4">
              <Text className="font-semibold text-white">Location</Text>
              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Label>
                    State <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="Missouri"
                    value={state}
                    onChangeText={setState}
                  />
                </View>

                <View className="flex-1 gap-2">
                  <Label>
                    County <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="Boone"
                    value={county}
                    onChangeText={setCounty}
                  />
                </View>
              </View>

              <View className="gap-2">
                <Label>Address (Optional)</Label>
                <Input
                  placeholder="Near Columbia, MO"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Label>
                    Latitude <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="38.9517"
                    value={lat}
                    onChangeText={setLat}
                    keyboardType="numeric"
                  />
                </View>

                <View className="flex-1 gap-2">
                  <Label>
                    Longitude <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="-92.3341"
                    value={lng}
                    onChangeText={setLng}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="gap-2">
                <Label>
                  Acreage <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  placeholder="200"
                  value={acreage}
                  onChangeText={setAcreage}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Pricing */}
            <View className="gap-4">
              <Text className="font-semibold text-white">Pricing</Text>
              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Label>
                    Lease Term <Text className="text-red-500">*</Text>
                  </Label>
                  <Select
                    options={LEASE_TERMS.map(
                      (term) => term.charAt(0).toUpperCase() + term.slice(1)
                    )}
                    value={
                      leaseTerm.charAt(0).toUpperCase() + leaseTerm.slice(1)
                    }
                    onChange={(value) => setLeaseTerm(value.toLowerCase())}
                  />
                </View>

                <View className="flex-1 gap-2">
                  <Label>
                    Price Per Year ($) <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="5000"
                    value={pricePerYear}
                    onChangeText={setPricePerYear}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Label>Price Per Season ($)</Label>
                  <Input
                    placeholder="2000"
                    value={pricePerSeason}
                    onChangeText={setPricePerSeason}
                    keyboardType="numeric"
                  />
                </View>

                <View className="flex-1 gap-2">
                  <Label>Price Per Day ($)</Label>
                  <Input
                    placeholder="100"
                    value={pricePerDay}
                    onChangeText={setPricePerDay}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Availability */}
            <View className="gap-4">
              <Text className="font-semibold text-white">Availability</Text>
              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Label>
                    Available From <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="YYYY-MM-DD"
                    value={availableFrom}
                    onChangeText={setAvailableFrom}
                  />
                </View>

                <View className="flex-1 gap-2">
                  <Label>
                    Available To <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="YYYY-MM-DD"
                    value={availableTo}
                    onChangeText={setAvailableTo}
                  />
                </View>
              </View>
            </View>

            {/* Hunting Details */}
            <View className="gap-4">
              <Text className="font-semibold text-white">Hunting Details</Text>

              <View className="gap-2">
                <Label>
                  Allowed Activities <Text className="text-red-500">*</Text>
                </Label>
                <View className="flex-row flex-wrap gap-2">
                  {ACTIVITIES.map((activity) => (
                    <View
                      key={activity}
                      className="flex-row items-center gap-2 w-[48%]"
                    >
                      <Checkbox
                        value={allowedActivities.includes(activity)}
                        onValueChange={() => toggleActivity(activity)}
                      />
                      <Label className="capitalize">
                        {activity.replace(/_/g, " ")}
                      </Label>
                    </View>
                  ))}
                </View>
              </View>

              <View className="gap-2">
                <Label>
                  Game Types <Text className="text-red-500">*</Text>
                </Label>
                <View className="flex-row flex-wrap gap-2">
                  {GAME_TYPES.map((game) => (
                    <View
                      key={game}
                      className="flex-row items-center gap-2 w-[48%]"
                    >
                      <Checkbox
                        value={gameTypes.includes(game)}
                        onValueChange={() => toggleGame(game)}
                      />
                      <Label className="capitalize">{game}</Label>
                    </View>
                  ))}
                </View>
              </View>

              <View className="gap-2">
                <Label>Maximum Number of Hunters</Label>
                <Input
                  placeholder="4"
                  value={maxHunters}
                  onChangeText={setMaxHunters}
                  keyboardType="numeric"
                />
              </View>

              <View className="flex-row items-center gap-2">
                <Checkbox
                  value={exclusiveAccess}
                  onValueChange={setExclusiveAccess}
                />
                <Label>Exclusive access (only one lessee at a time)</Label>
              </View>
            </View>

            {/* Amenities */}
            <View className="gap-4">
              <Text className="font-semibold text-white">Amenities</Text>
              <View className="flex-row flex-wrap gap-2">
                {AMENITIES_LIST.map((amenity) => (
                  <View
                    key={amenity}
                    className="flex-row items-center gap-2 w-[48%]"
                  >
                    <Checkbox
                      value={amenities.includes(amenity)}
                      onValueChange={() => toggleAmenity(amenity)}
                    />
                    <Label className="capitalize">
                      {amenity.replace(/_/g, " ")}
                    </Label>
                  </View>
                ))}
              </View>
            </View>

            {/* Property Features */}
            <View className="gap-4">
              <Text className="font-semibold text-white">
                Property Features
              </Text>
              <View className="gap-2">
                <Label>Terrain Type</Label>
                <Select
                  options={TERRAIN_TYPES.map(
                    (t) =>
                      t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, " ")
                  )}
                  value={
                    terrain
                      ? terrain.charAt(0).toUpperCase() +
                        terrain.slice(1).replace(/_/g, " ")
                      : undefined
                  }
                  onChange={(value) =>
                    setTerrain(value.toLowerCase().replace(/\s/g, "_"))
                  }
                  placeholder="Select terrain type"
                />
              </View>
            </View>

            {/* Rules */}
            <View className="gap-4">
              <Text className="font-semibold text-white">
                Rules & Restrictions
              </Text>
              <View className="gap-2">
                <Label>Property Rules</Label>
                <Textarea
                  placeholder="e.g., QDM practices required, no ATVs, steel shot only..."
                  value={rules}
                  onChangeText={setRules}
                  className="min-h-24"
                />
              </View>
            </View>

            {/* Contact */}
            <View className="gap-4">
              <Text className="font-semibold text-white">
                Contact Information
              </Text>
              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View className="flex-1 gap-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="landowner@example.com"
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    keyboardType="email-address"
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <View className="flex-row gap-2 mt-4">
          <Button
            type="outline"
            onPress={() => onOpenChange(false)}
            className="flex-1"
            disabled={isSubmitting}
          >
            <Text className="text-white">Cancel</Text>
          </Button>
          <Button onPress={onSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white">Create Listing</Text>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Dialog>
  );
}
