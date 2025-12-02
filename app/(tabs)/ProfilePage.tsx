import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { NotificationBell } from "@/components/ui/notification-bell";
import { Select } from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Fingerprint,
  LogOut,
  Mail,
  MapPin,
  Save,
  Shield,
  Target,
  UserCircle,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const profile = useQuery(api.profile.getMyProfile);
  const updateProfile = useMutation(api.profile.updateProfile);
  const { isAvailable, isEnabled, enableBiometric, disableBiometric } =
    useBiometricAuth();

  // Get avatar URL from storage if it's a storage ID
  const avatarUrl = useQuery(
    api.profile.getPhotoUrl,
    profile?.avatar && profile.avatar.startsWith("kg")
      ? { storageId: profile.avatar as never }
      : "skip"
  );

  const [contact1Open, setContact1Open] = useState(false);
  const [contact2Open, setContact2Open] = useState(false);
  const [contact3Open, setContact3Open] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnablingBiometric, setIsEnablingBiometric] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [emergencyContact1, setEmergencyContact1] = useState<EmergencyContact>({
    name: "",
    phone: "",
    relationship: "",
  });
  const [emergencyContact2, setEmergencyContact2] = useState<EmergencyContact>({
    name: "",
    phone: "",
    relationship: "",
  });
  const [emergencyContact3, setEmergencyContact3] = useState<EmergencyContact>({
    name: "",
    phone: "",
    relationship: "",
  });
  const [huntingPreferences, setHuntingPreferences] = useState<string[]>([]);
  const [weaponTypes, setWeaponTypes] = useState<string[]>([]);
  const [interestedInSpecialEvents, setInterestedInSpecialEvents] =
    useState(false);

  const userName = profile?.name || user?.name || "Hunter";
  const userAvatar =
    avatarUrl ||
    profile?.avatar ||
    (typeof user?.avatar === "string" ? user.avatar : undefined);
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setCountry(profile.country || "");
      setStreetAddress(profile.streetAddress || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setZipCode(profile.zipCode || "");

      if (profile.emergencyContact1) {
        setEmergencyContact1(profile.emergencyContact1);
        setContact1Open(true);
      }
      if (profile.emergencyContact2) {
        setEmergencyContact2(profile.emergencyContact2);
        setContact2Open(true);
      }
      if (profile.emergencyContact3) {
        setEmergencyContact3(profile.emergencyContact3);
        setContact3Open(true);
      }

      setHuntingPreferences(profile.huntingPreferences || []);
      setWeaponTypes(profile.weaponTypes || []);
      setInterestedInSpecialEvents(profile.interestedInSpecialEvents || false);
    }
  }, [profile]);

  const onSubmit = async () => {
    try {
      setIsSaving(true);

      // Filter out empty emergency contacts
      const contact1 = emergencyContact1.name ? emergencyContact1 : undefined;
      const contact2 = emergencyContact2.name ? emergencyContact2 : undefined;
      const contact3 = emergencyContact3.name ? emergencyContact3 : undefined;

      await updateProfile({
        name,
        country,
        streetAddress,
        city,
        state,
        zipCode,
        emergencyContact1: contact1,
        emergencyContact2: contact2,
        emergencyContact3: contact3,
        huntingPreferences,
        weaponTypes,
        interestedInSpecialEvents,
      });
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast("Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHuntingPreference = (id: string) => {
    if (huntingPreferences.includes(id)) {
      setHuntingPreferences(huntingPreferences.filter((p) => p !== id));
    } else {
      setHuntingPreferences([...huntingPreferences, id]);
    }
  };

  const toggleWeaponType = (id: string) => {
    if (weaponTypes.includes(id)) {
      setWeaponTypes(weaponTypes.filter((w) => w !== id));
    } else {
      setWeaponTypes([...weaponTypes, id]);
    }
  };

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <View className="items-center">
          <ActivityIndicator size="large" color="#ff6800" />
          <Text className="mt-4 text-gray-400">Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Profile Header */}
      <View className="relative h-32 bg-[#ff6800]/10">
        <View className="absolute top-4 right-4">
          <NotificationBell />
        </View>
        <View className="absolute -bottom-12 left-4">
          <Avatar
            src={userAvatar}
            fallback={userInitials}
            size={96}
            className="border-4 border-gray-900"
          />
        </View>
      </View>

      <View className="mt-16 px-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-bold text-white">{userName}</Text>
          {profile?.memberNumber && (
            <Badge type="default" className="text-xs text-yellow-500">
              {profile.memberNumber}
            </Badge>
          )}
        </View>
        {user?.email && (
          <View className="mt-1 flex-row items-center gap-2">
            <Mail size={16} color="#9ca3af" />
            <Text className="text-sm text-gray-400">{user.email}</Text>
          </View>
        )}
      </View>

      <View className="mt-6 gap-4 px-4">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-0">
            <View className="flex-row items-center gap-2">
              <UserCircle size={20} color="#ffffff" />
              <CardTitle>Personal Information</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Label>Full Name</Label>
              <Input
                placeholder="John Smith"
                value={name}
                onChangeText={setName}
              />
            </View>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-0">
            <View className="flex-row items-center gap-2">
              <MapPin size={20} color="#ffffff" />
              <CardTitle>Address</CardTitle>
            </View>
            <CardDescription>Enter your address information</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Label>Country</Label>
              <Select
                options={COUNTRIES}
                value={country}
                onChange={setCountry}
                placeholder="Select country"
              />
            </View>
            <View>
              <Label>Street Address</Label>
              <Input
                placeholder="123 Main Street"
                value={streetAddress}
                onChangeText={setStreetAddress}
              />
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Label>City</Label>
                <Input
                  placeholder="Springfield"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View className="flex-1">
                <Label>State</Label>
                <Select
                  options={US_STATES}
                  value={state}
                  onChange={setState}
                  placeholder="Select state"
                />
              </View>
            </View>
            <View>
              <Label>Zip Code</Label>
              <Input
                placeholder="65801"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
              />
            </View>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader className="pb-0">
            <View className="flex-row items-center gap-2">
              <AlertCircle size={20} color="#ffffff" />
              <CardTitle>Emergency Contacts</CardTitle>
            </View>
            <CardDescription>
              Optional - Add up to 3 emergency contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            {/* Contact 1 */}
            <View>
              <TouchableOpacity
                onPress={() => setContact1Open(!contact1Open)}
                className="flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <Text className="text-white">Emergency Contact 1</Text>
                {contact1Open ? (
                  <ChevronUp size={16} color="#ffffff" />
                ) : (
                  <ChevronDown size={16} color="#ffffff" />
                )}
              </TouchableOpacity>
              {contact1Open && (
                <View className="mt-2 gap-4 pl-2">
                  <View>
                    <Label>Name</Label>
                    <Input
                      placeholder="Jane Smith"
                      value={emergencyContact1.name}
                      onChangeText={(text) =>
                        setEmergencyContact1({
                          ...emergencyContact1,
                          name: text,
                        })
                      }
                    />
                  </View>
                  <View>
                    <Label>Phone</Label>
                    <Input
                      placeholder="555-123-4567"
                      value={emergencyContact1.phone}
                      onChangeText={(text) =>
                        setEmergencyContact1({
                          ...emergencyContact1,
                          phone: text,
                        })
                      }
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View>
                    <Label>Relationship</Label>
                    <Input
                      placeholder="Spouse"
                      value={emergencyContact1.relationship}
                      onChangeText={(text) =>
                        setEmergencyContact1({
                          ...emergencyContact1,
                          relationship: text,
                        })
                      }
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Contact 2 */}
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => setContact2Open(!contact2Open)}
                className="flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <Text className="text-white">Emergency Contact 2</Text>
                {contact2Open ? (
                  <ChevronUp size={16} color="#ffffff" />
                ) : (
                  <ChevronDown size={16} color="#ffffff" />
                )}
              </TouchableOpacity>
              {contact2Open && (
                <View className="mt-2 gap-4 pl-2">
                  <View className="gap-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Bob Johnson"
                      value={emergencyContact2.name}
                      onChangeText={(text) =>
                        setEmergencyContact2({
                          ...emergencyContact2,
                          name: text,
                        })
                      }
                    />
                  </View>
                  <View className="gap-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="555-123-4567"
                      value={emergencyContact2.phone}
                      onChangeText={(text) =>
                        setEmergencyContact2({
                          ...emergencyContact2,
                          phone: text,
                        })
                      }
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View className="gap-2">
                    <Label>Relationship</Label>
                    <Input
                      placeholder="Friend"
                      value={emergencyContact2.relationship}
                      onChangeText={(text) =>
                        setEmergencyContact2({
                          ...emergencyContact2,
                          relationship: text,
                        })
                      }
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Contact 3 */}
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => setContact3Open(!contact3Open)}
                className="flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <Text className="text-white">Emergency Contact 3</Text>
                {contact3Open ? (
                  <ChevronUp size={16} color="#ffffff" />
                ) : (
                  <ChevronDown size={16} color="#ffffff" />
                )}
              </TouchableOpacity>
              {contact3Open && (
                <View className="mt-2 gap-4 pl-2">
                  <View className="gap-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Mary Williams"
                      value={emergencyContact3.name}
                      onChangeText={(text) =>
                        setEmergencyContact3({
                          ...emergencyContact3,
                          name: text,
                        })
                      }
                    />
                  </View>
                  <View className="gap-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="555-123-4567"
                      value={emergencyContact3.phone}
                      onChangeText={(text) =>
                        setEmergencyContact3({
                          ...emergencyContact3,
                          phone: text,
                        })
                      }
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View className="gap-2">
                    <Label>Relationship</Label>
                    <Input
                      placeholder="Parent"
                      value={emergencyContact3.relationship}
                      onChangeText={(text) =>
                        setEmergencyContact3({
                          ...emergencyContact3,
                          relationship: text,
                        })
                      }
                    />
                  </View>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Hunting Preferences */}
        <Card>
          <CardHeader className="pb-0">
            <View className="flex-row items-center gap-2">
              <Target size={20} color="#ffffff" />
              <CardTitle>What do you like to hunt?</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex-row flex-wrap gap-4">
              {HUNTING_TYPES.map((type) => (
                <View
                  key={type.id}
                  className="flex-row items-center gap-2 w-[45%]"
                >
                  <Checkbox
                    value={huntingPreferences.includes(type.id)}
                    onValueChange={() => toggleHuntingPreference(type.id)}
                  />
                  <Label>{type.label}</Label>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Weapon Types */}
        <Card>
          <CardHeader className="pb-0">
            <View className="flex-row items-center gap-2">
              <Crosshair size={20} color="#ffffff" />
              <CardTitle>Weapon Types</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex-row flex-wrap gap-4">
              {WEAPON_TYPES.map((weapon) => (
                <View
                  key={weapon.id}
                  className="flex-row items-center gap-2 w-[45%]"
                >
                  <Checkbox
                    value={weaponTypes.includes(weapon.id)}
                    onValueChange={() => toggleWeaponType(weapon.id)}
                  />
                  <Label>{weapon.label}</Label>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Special Events */}
        <Card>
          <CardHeader className="pb-0">
            <View className="flex-row items-center gap-2">
              <Calendar size={20} color="#ffffff" />
              <CardTitle>Special Hunting Events</CardTitle>
            </View>
            <CardDescription>
              Interested in tournaments, guided hunts, conservation events, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center justify-between">
              <Label>Interested in special events</Label>
              <Switch
                value={interestedInSpecialEvents}
                onValueChange={setInterestedInSpecialEvents}
              />
            </View>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          type="primary"
          onPress={onSubmit}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Save size={16} color="#ffffff" />
              <Text className="text-white font-semibold">Save Profile</Text>
            </View>
          )}
        </Button>
      </View>

      <View className="mt-6 gap-4 px-4 pb-6">
        {/* Security Settings */}
        {isAvailable && (
          <Card>
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Shield size={20} color="#ffffff" />
                <CardTitle>Security</CardTitle>
              </View>
              <CardDescription>
                Manage your security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Fingerprint size={16} color="#9ca3af" />
                    <Label className="text-base">Biometric Sign-In</Label>
                  </View>
                  <Text className="text-sm text-gray-400">
                    Use fingerprint or Face ID to sign in quickly
                  </Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={async (checked) => {
                    if (checked && user?._id) {
                      setIsEnablingBiometric(true);
                      const success = await enableBiometric(user._id);
                      if (success) {
                        showToast("Biometric authentication enabled!");
                      } else {
                        showToast("Failed to enable biometric authentication");
                      }
                      setIsEnablingBiometric(false);
                    } else {
                      disableBiometric();
                      showToast("Biometric authentication disabled");
                    }
                  }}
                  disabled={isEnablingBiometric}
                />
              </View>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Sign Out */}
        <Button type="outline" onPress={() => signOut()} className="w-full">
          <View className="flex-row items-center gap-3">
            <LogOut size={16} color="#ef4444" />
            <Text className="text-red-500 font-semibold">Sign Out</Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  );
}
