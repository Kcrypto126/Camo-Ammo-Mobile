import { Checkbox } from "@/components/ui/Checkbox";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useAuth } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

// Constants (same as original)
const profileSetupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Country is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    phone: z.string().min(1, "Emergency contact phone is required"),
    relationship: z.string().min(1, "Relationship is required"),
  }),
  huntingPreferences: z
    .array(z.string())
    .min(1, "Select at least one hunting preference"),
  weaponTypes: z.array(z.string()).min(1, "Select at least one weapon type"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  yearsOfExperience: z.number().min(0, "Years of experience must be 0 or more"),
  favoriteSpecies: z.string().min(1, "Favorite species is required"),
  hobbies: z.string().min(1, "At least one hobby is required"),
});

type ProfileSetupFormData = z.infer<typeof profileSetupSchema>;

const HUNTING_TYPES = [
  { id: "deer", label: "Deer" },
  { id: "elk", label: "Elk" },
  { id: "turkey", label: "Turkey" },
  { id: "waterfowl", label: "Waterfowl" },
  { id: "small_game", label: "Small Game" },
  { id: "predator", label: "Predator" },
];

const WEAPON_TYPES = [
  { id: "rifle", label: "Rifle" },
  { id: "bow", label: "Bow" },
  { id: "shotgun", label: "Shotgun" },
  { id: "muzzle_loader", label: "Muzzle Loader" },
];

const COUNTRIES = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Australia",
  "New Zealand",
  "South Africa",
];

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

// Toast library replacement for React Native
const showToast = (msg: string) => {
  if (Platform.OS === "android") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ToastAndroid = require("react-native").ToastAndroid;
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    // eslint-disable-next-line no-alert
    alert(msg);
  }
};

export default function ProfileSetupPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const generateUploadUrl = useMutation(api.profile.generateUploadUrl);
  const updateProfile = useMutation(api.profile.updateProfile);

  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileSetupFormData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      huntingPreferences: [],
      weaponTypes: [],
      yearsOfExperience: 0,
      emergencyContact: {},
    },
  });

  const huntingPreferences = watch("huntingPreferences") || [];
  const weaponTypes = watch("weaponTypes") || [];

  // Pick image via Expo ImagePicker and upload to backend
  const handlePhotoPicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showToast("Media permission is required");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });
    if (pickerResult.canceled) {
      return;
    }
    setIsUploading(true);
    try {
      const asset = pickerResult.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        showToast("Photo must be less than 5MB");
        setIsUploading(false);
        return;
      }
      setUploadedPhoto(asset.uri);

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      if (!uploadUrl) {
        throw new Error("Failed to get upload URL");
      }

      // Prepare file for upload - use mimeType if available, otherwise default to image/jpeg
      const fileType = asset.mimeType || "image/jpeg";

      // Fetch the image file from local URI
      const photoResp = await fetch(asset.uri);
      if (!photoResp.ok) {
        throw new Error(`Failed to read image: ${photoResp.status}`);
      }

      const blob = await photoResp.blob();

      // Upload to Convex storage
      console.log("[ProfileSetupPage] Uploading to Convex...");
      const uploadResp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": fileType },
        body: blob,
      });

      if (!uploadResp.ok) {
        const errorText = await uploadResp.text();
        console.error("[ProfileSetupPage] Upload failed:", errorText);
        throw new Error(`Upload failed: ${uploadResp.status} - ${errorText}`);
      }

      // Parse response - Convex returns the storage ID in the response body
      const responseText = await uploadResp.text();

      let storageId: string;
      try {
        // Try to parse as JSON first
        const responseJson = JSON.parse(responseText);
        storageId = responseJson.storageId || responseJson.id || responseJson;
      } catch {
        // If response is not JSON, it might be the storage ID directly as a string
        storageId = responseText.trim();
      }

      if (!storageId || storageId === "") {
        throw new Error("No storage ID received from upload");
      }

      setPhotoStorageId(storageId as Id<"_storage">);
      showToast("Photo uploaded successfully!");
    } catch (err) {
      showToast("Failed to upload photo");
      // Reset photo state on error
      setUploadedPhoto(null);
      setPhotoStorageId(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle logic for checkbox
  const toggleHuntingPreference = (id: string) => {
    let current = watch("huntingPreferences") || [];
    if (current.includes(id)) {
      setValue(
        "huntingPreferences",
        current.filter((t: string) => t !== id)
      );
    } else {
      setValue("huntingPreferences", [...current, id]);
    }
  };
  const toggleWeaponType = (id: string) => {
    let current = watch("weaponTypes") || [];
    if (current.includes(id)) {
      setValue(
        "weaponTypes",
        current.filter((w: string) => w !== id)
      );
    } else {
      setValue("weaponTypes", [...current, id]);
    }
  };

  // Submit button
  const onSubmit = async (data: ProfileSetupFormData) => {
    if (!photoStorageId) {
      showToast("Please upload a profile photo");
      return;
    }
    try {
      setIsSaving(true);

      // Parse hobbies from comma-separated string
      const hobbiesArray = data.hobbies
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      await updateProfile({
        name: `${data.firstName} ${data.lastName}`,
        avatar: photoStorageId,
        country: data.country,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        emergencyContact1: data.emergencyContact,
        huntingPreferences: data.huntingPreferences,
        weaponTypes: data.weaponTypes,
        bio: data.bio,
        yearsOfExperience: data.yearsOfExperience,
        favoriteSpecies: data.favoriteSpecies,
        hobbies: hobbiesArray,
        profileCompleted: true,
      });

      showToast("Profile setup complete! Welcome to Camo & Ammo!");
    } catch (error) {
      showToast("Failed to complete profile setup");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        contentContainerStyle={{
          padding: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6 items-center">
          <Text className="font-bold text-2xl mb-1 text-white">
            Complete Your Profile
          </Text>
          <Text className="text-gray-400 text-base text-center">
            Welcome! Please complete your profile to get started.
          </Text>
        </View>
        {/* Profile Photo */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <Text className="font-bold text-lg mb-1 text-white">
            Profile Photo (Required)
          </Text>
          <Text className="text-sm text-gray-400 mb-2">
            Upload a clear photo of yourself. This will be visible to other
            members.
          </Text>
          <View className="items-center justify-center mt-2 mb-2">
            {uploadedPhoto ? (
              <Image
                source={{ uri: uploadedPhoto }}
                className="w-[108px] h-[108px] rounded-full border-4 border-orange-500 mb-3 bg-gray-700 items-center justify-center"
              />
            ) : (
              <View className="w-[108px] h-[108px] rounded-full border-4 border-gray-600 mb-3 bg-gray-700 items-center justify-center">
                <Text className="text-[42px] text-gray-400">👤</Text>
              </View>
            )}
            <TouchableOpacity
              className="bg-orange-500 rounded-full py-2 px-6 mb-1"
              onPress={handlePhotoPicker}
              disabled={isUploading}
            >
              <Text className="text-black font-semibold">
                {isUploading ? "Uploading..." : "Upload Photo"}
              </Text>
            </TouchableOpacity>
            {!photoStorageId && (
              <Text className="text-red-400 text-xs mb-1">
                Profile photo is required
              </Text>
            )}
          </View>
        </View>
        {/* Name */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <Text className="font-bold text-lg mb-1 text-white">
            Full Name (Required)
          </Text>
          <View className="flex-row items-start mb-1">
            <View className="flex-1 mr-2">
              <Text className="text-gray-300 mb-1">First Name *</Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                    placeholder="John"
                    placeholderTextColor="#9ca3af"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.firstName && (
                <Text className="text-red-400 text-xs mb-1">
                  {errors.firstName.message}
                </Text>
              )}
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-300 mb-1">Last Name *</Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                    placeholder="Smith"
                    placeholderTextColor="#9ca3af"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.lastName && (
                <Text className="text-red-400 text-xs mb-1">
                  {errors.lastName.message}
                </Text>
              )}
            </View>
          </View>
        </View>
        {/* Address */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <Text className="font-bold text-lg mb-1 text-white">
            Address (Required)
          </Text>
          <Text className="text-sm text-gray-400 mb-2">
            Fill in your address details.
          </Text>
          <Text className="text-gray-300 mb-1">Country *</Text>
          <Controller
            control={control}
            name="country"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  onPress={() => setShowCountryPicker(true)}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-2 flex-row items-center justify-between"
                >
                  <Text
                    className="text-base flex-1"
                    style={{ color: value ? "#fff" : "#9ca3af" }}
                  >
                    {value || "Select country"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#9ca3af"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
                <Modal
                  visible={showCountryPicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowCountryPicker(false)}
                >
                  <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-gray-800 rounded-t-xl max-h-[80%]">
                      <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
                        <Text className="text-white text-lg font-semibold">
                          Select country
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowCountryPicker(false)}
                        >
                          <Text className="text-orange-500 text-base font-semibold">
                            Done
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView className="max-h-[400px]">
                        <TouchableOpacity
                          onPress={() => {
                            onChange("");
                            setShowCountryPicker(false);
                          }}
                          className="px-4 py-3 border-b border-gray-700"
                        >
                          <Text
                            className="text-base"
                            style={{
                              color: value === "" ? "#f97316" : "#9ca3af",
                            }}
                          >
                            Select country
                          </Text>
                        </TouchableOpacity>
                        {COUNTRIES.map((country) => (
                          <TouchableOpacity
                            key={country}
                            onPress={() => {
                              onChange(country);
                              setShowCountryPicker(false);
                            }}
                            className="px-4 py-3 border-b border-gray-700"
                          >
                            <Text
                              className="text-base"
                              style={{
                                color: value === country ? "#f97316" : "#fff",
                              }}
                            >
                              {country}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </Modal>
              </>
            )}
          />
          {errors.country && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.country.message}
            </Text>
          )}
          <Text className="text-gray-300 mb-1">Street Address *</Text>
          <Controller
            control={control}
            name="streetAddress"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                placeholder="123 Main Street"
                placeholderTextColor="#9ca3af"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.streetAddress && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.streetAddress.message}
            </Text>
          )}
          <View className="flex-row items-start mb-1">
            <View className="flex-1 mr-2">
              <Text className="text-gray-300 mb-1">City *</Text>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                    placeholder="Springfield"
                    placeholderTextColor="#9ca3af"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.city && (
                <Text className="text-red-400 text-xs mb-1">
                  {errors.city.message}
                </Text>
              )}
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-300 mb-1">State *</Text>
              <Controller
                control={control}
                name="state"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TouchableOpacity
                      onPress={() => setShowStatePicker(true)}
                      className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-2 flex-row items-center justify-between"
                    >
                      <Text
                        className="text-base flex-1"
                        style={{ color: value ? "#fff" : "#9ca3af" }}
                      >
                        {value || "Select state"}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color="#9ca3af"
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                    <Modal
                      visible={showStatePicker}
                      transparent
                      animationType="slide"
                      onRequestClose={() => setShowStatePicker(false)}
                    >
                      <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-gray-800 rounded-t-xl max-h-[80%]">
                          <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
                            <Text className="text-white text-lg font-semibold">
                              Select state
                            </Text>
                            <TouchableOpacity
                              onPress={() => setShowStatePicker(false)}
                            >
                              <Text className="text-orange-500 text-base font-semibold">
                                Done
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <ScrollView className="max-h-[400px]">
                            <TouchableOpacity
                              onPress={() => {
                                onChange("");
                                setShowStatePicker(false);
                              }}
                              className="px-4 py-3 border-b border-gray-700"
                            >
                              <Text
                                className="text-base"
                                style={{
                                  color: value === "" ? "#f97316" : "#9ca3af",
                                }}
                              >
                                Select state
                              </Text>
                            </TouchableOpacity>
                            {US_STATES.map((state) => (
                              <TouchableOpacity
                                key={state}
                                onPress={() => {
                                  onChange(state);
                                  setShowStatePicker(false);
                                }}
                                className="px-4 py-3 border-b border-gray-700"
                              >
                                <Text
                                  className="text-base"
                                  style={{
                                    color: value === state ? "#f97316" : "#fff",
                                  }}
                                >
                                  {state}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
                  </>
                )}
              />
              {errors.state && (
                <Text className="text-red-400 text-xs mb-1">
                  {errors.state.message}
                </Text>
              )}
            </View>
          </View>
          <Text className="text-gray-300 mb-1">Zip Code *</Text>
          <Controller
            control={control}
            name="zipCode"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                placeholder="32801"
                placeholderTextColor="#9ca3af"
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
              />
            )}
          />
          {errors.zipCode && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.zipCode.message}
            </Text>
          )}
        </View>
        {/* Emergency Contact */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <Text className="font-bold text-lg mb-1 text-white">
            Emergency Contact (Required)
          </Text>
          <Text className="text-sm text-gray-400 mb-2">
            If you're hunting with a friend on the app, they can access this
            contact in case of emergency.
          </Text>
          <Text className="text-gray-300 mb-1">Contact Name *</Text>
          <Controller
            control={control}
            name="emergencyContact.name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                placeholder="Jane Smith"
                placeholderTextColor="#9ca3af"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.emergencyContact?.name && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.emergencyContact.name.message}
            </Text>
          )}
          <Text className="text-gray-300 mb-1">Phone Number *</Text>
          <Controller
            control={control}
            name="emergencyContact.phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                placeholder="555-123-4567"
                placeholderTextColor="#9ca3af"
                onChangeText={onChange}
                value={value}
                keyboardType="phone-pad"
              />
            )}
          />
          {errors.emergencyContact?.phone && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.emergencyContact.phone.message}
            </Text>
          )}
          <Text className="text-gray-300 mb-1">Relationship *</Text>
          <Controller
            control={control}
            name="emergencyContact.relationship"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                placeholder="Spouse, Parent, Friend, etc."
                placeholderTextColor="#9ca3af"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.emergencyContact?.relationship && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.emergencyContact.relationship.message}
            </Text>
          )}
        </View>
        {/* Hunting Preferences */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <Text className="font-bold text-lg mb-1 text-white">
            Hunting Preferences (Required)
          </Text>
          <Text className="text-sm text-gray-400 mb-2">
            Select at least one type of hunting you enjoy.
          </Text>
          <View className="flex-row mt-3">
            <View className="flex-1">
              {HUNTING_TYPES.slice(0, 3).map((type) => (
                <TouchableOpacity
                  className="flex-row items-center mb-4"
                  key={type.id}
                  activeOpacity={0.7}
                  onPress={() => toggleHuntingPreference(type.id)}
                >
                  <Checkbox
                    value={huntingPreferences.includes(type.id)}
                    onValueChange={() => toggleHuntingPreference(type.id)}
                    tintColor="#f97316"
                    boxType="square"
                    disabled={false}
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-sm text-gray-300">{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-1">
              {HUNTING_TYPES.slice(3, 6).map((type) => (
                <TouchableOpacity
                  className="flex-row items-center mb-4"
                  key={type.id}
                  activeOpacity={0.7}
                  onPress={() => toggleHuntingPreference(type.id)}
                >
                  <Checkbox
                    value={huntingPreferences.includes(type.id)}
                    onValueChange={() => toggleHuntingPreference(type.id)}
                    tintColor="#f97316"
                    boxType="square"
                    disabled={false}
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-sm text-gray-300">{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {errors.huntingPreferences && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.huntingPreferences.message}
            </Text>
          )}
        </View>
        {/* Weapon Types */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <Text className="font-bold text-lg mb-1 text-white">
            Weapon Types (Required)
          </Text>
          <Text className="text-sm text-gray-400 mb-2">
            Select at least one weapon type you use.
          </Text>
          <View className="mt-3">
            {/* 1st row */}
            <View className="flex-row">
              {WEAPON_TYPES.slice(0, 2).map((type) => (
                <TouchableOpacity
                  className="flex-1 flex-row items-center mb-4"
                  key={type.id}
                  activeOpacity={0.7}
                  onPress={() => toggleWeaponType(type.id)}
                >
                  <Checkbox
                    value={weaponTypes.includes(type.id)}
                    onValueChange={() => toggleWeaponType(type.id)}
                    tintColor="#f97316"
                    boxType="square"
                    disabled={false}
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-sm text-gray-300">{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* 2nd row */}
            <View className="flex-row">
              {WEAPON_TYPES.slice(2, 4).map((type) => (
                <TouchableOpacity
                  className="flex-1 flex-row items-center mb-4"
                  key={type.id}
                  activeOpacity={0.7}
                  onPress={() => toggleWeaponType(type.id)}
                >
                  <Checkbox
                    value={weaponTypes.includes(type.id)}
                    onValueChange={() => toggleWeaponType(type.id)}
                    tintColor="#f97316"
                    boxType="square"
                    disabled={false}
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-sm text-gray-300">{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {errors.weaponTypes && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.weaponTypes.message}
            </Text>
          )}
        </View>
        {/* About You */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <Text className="font-bold text-lg mb-1 text-white">
            About You (Required)
          </Text>
          <Text className="text-sm text-gray-400 mb-2">
            Tell us about your hunting experience and interests.
          </Text>
          <Text className="text-gray-300 mb-1">
            Bio * (Minimum 10 characters)
          </Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                style={{ height: 100, textAlignVertical: "top" }}
                placeholder="Tell us about yourself, your hunting experience, and what you love about hunting..."
                placeholderTextColor="#9ca3af"
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={5}
              />
            )}
          />
          {errors.bio && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.bio.message}
            </Text>
          )}
          <Text className="text-gray-300 mb-1">
            Years of Hunting Experience *
          </Text>
          <Controller
            control={control}
            name="yearsOfExperience"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={value === 0 || value === undefined ? "" : String(value)}
                onChangeText={(txt) => {
                  const num = txt ? Number(txt) : 0;
                  onChange(num);
                }}
              />
            )}
          />
          {errors.yearsOfExperience && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.yearsOfExperience.message}
            </Text>
          )}
          <Text className="text-gray-300 mb-1">Favorite Species *</Text>
          <Controller
            control={control}
            name="favoriteSpecies"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                placeholder="Whitetail Deer"
                placeholderTextColor="#9ca3af"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.favoriteSpecies && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.favoriteSpecies.message}
            </Text>
          )}
          <Text className="text-gray-300 mb-1">
            Other Hobbies * (comma-separated)
          </Text>
          <Controller
            control={control}
            name="hobbies"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="bg-gray-700 border border-gray-600 rounded-md text-base px-3 py-2 mb-2 text-white"
                placeholder="Fishing, Camping, Photography"
                placeholderTextColor="#9ca3af"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.hobbies && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.hobbies.message}
            </Text>
          )}
        </View>
        {/* Submit Button */}
        <TouchableOpacity
          className={[
            "rounded-xl py-3 items-center mt-2 mb-3",
            isSaving || isUploading || !photoStorageId
              ? "bg-gray-600"
              : "bg-orange-500",
          ].join(" ")}
          onPress={handleSubmit(onSubmit)}
          disabled={isSaving || isUploading || !photoStorageId}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-black font-bold text-md">
              Complete Profile Setup
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={() => {
            console.log("[ProfileSetupPage] Signing out...");
            signOut();
            router.replace("/");
          }}
          className="rounded-xl py-3 items-center mt-4 mb-6 border border-gray-600"
        >
          <Text className="text-gray-300 font-semibold text-md">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
