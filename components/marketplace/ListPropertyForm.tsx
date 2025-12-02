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
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const COUNTRIES = ["United States", "Canada", "Mexico"];

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

const LAND_TYPES = [
  { id: "pasture", label: "Pasture" },
  { id: "cropland", label: "Crop Land" },
  { id: "forest", label: "Forest" },
  { id: "wetlands", label: "Wetlands" },
  { id: "rivers_streams", label: "Rivers/Streams" },
  { id: "coastal", label: "Coastal" },
  { id: "desert", label: "Desert" },
  { id: "mountains", label: "Mountains" },
];

const HUNTING_TYPES = [
  { id: "big_game", label: "Big Game Hunting" },
  { id: "lease_game", label: "Lease Game" },
  { id: "small_game_furbearer", label: "Small Game & Furbearer Hunting" },
  { id: "trapping", label: "Trapping" },
  { id: "upland_bird", label: "Upland Bird Hunting" },
  { id: "waterfowl", label: "Waterfowl Hunting" },
];

const AMENITIES = [
  { id: "cabin", label: "Cabin" },
  { id: "deerstands", label: "Deerstands" },
  { id: "duck_blinds", label: "Duck Blinds" },
  { id: "camp_site", label: "Camp Site" },
  { id: "electricity_hookup", label: "Electricity Hookup" },
  { id: "pond", label: "Pond" },
  { id: "food_plots", label: "Food Plots" },
  { id: "atv_access", label: "ATV Access" },
];

const PRICE_TYPES = [
  { value: "per_year", label: "Per Year" },
  { value: "per_day", label: "Per Day" },
  { value: "per_week", label: "Per Week" },
  { value: "per_month", label: "Per Month" },
  { value: "per_season", label: "Per Season" },
  { value: "per_person", label: "Per Person" },
];

interface ListPropertyFormProps {
  onBack: () => void;
}

export default function ListPropertyForm({ onBack }: ListPropertyFormProps) {
  const createListing = useMutation(api.landLeases.createListing);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Location
  const [country, setCountry] = useState("United States");
  const [region, setRegion] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [streetAddressContinued, setStreetAddressContinued] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [county, setCounty] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Step 2: Property Details
  const [acreage, setAcreage] = useState("");
  const [landTypes, setLandTypes] = useState<string[]>([]);
  const [availableHunting, setAvailableHunting] = useState<string[]>([]);
  const [huntingPartySize, setHuntingPartySize] = useState("");

  // Step 3: Amenities & Description
  const [amenities, setAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  // Step 4: Pricing
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("per_year");
  const [isPriceNegotiable, setIsPriceNegotiable] = useState(false);

  const validateStep1 = () => {
    if (!country || !streetAddress || !city || !state || !county || !zipCode) {
      showToast("Please fill in all required location fields");
      return false;
    }
    if (!lat.trim() || !lng.trim()) {
      showToast("Please enter latitude and longitude");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!acreage || parseFloat(acreage) <= 0) {
      showToast("Please enter a valid acreage");
      return false;
    }
    if (landTypes.length === 0) {
      showToast("Please select at least one land type");
      return false;
    }
    if (availableHunting.length === 0) {
      showToast("Please select at least one hunting type");
      return false;
    }
    if (!huntingPartySize || parseInt(huntingPartySize) <= 0) {
      showToast("Please enter a valid hunting party size");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!description.trim()) {
      showToast("Please provide a description of your property");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!price || parseFloat(price) <= 0) {
      showToast("Please enter a valid price");
      return false;
    }
    if (!priceType) {
      showToast("Please select a price type");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    setIsSubmitting(true);
    try {
      await createListing({
        country,
        region: region.trim() || undefined,
        streetAddress,
        streetAddressContinued: streetAddressContinued.trim() || undefined,
        city,
        state,
        county,
        zipCode,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        acreage: parseFloat(acreage),
        landTypes,
        availableHunting,
        huntingPartySize: parseInt(huntingPartySize),
        amenities,
        description,
        price: parseFloat(price),
        priceType,
        isPriceNegotiable,
      });

      showToast("Property listing submitted for review!");
      onBack();
    } catch (error) {
      showToast("Failed to submit listing");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Button type="ghost" onPress={handleBack} className="!px-0 !py-0">
            <ArrowLeft size={16} color="#ffffff" />
          </Button>
          <View>
            <Text className="text-lg font-bold text-white">
              List A Property
            </Text>
            <Text className="text-xs text-gray-400">Step {step} of 4</Text>
          </View>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="border-b border-gray-700 bg-gray-800/50 px-4 py-3">
        <View className="flex-row items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <View key={s} className="flex-row items-center">
              <View
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  s < step
                    ? "border-[#ff6800] bg-[#ff6800]"
                    : s === step
                      ? "border-[#ff6800] bg-gray-900"
                      : "border-gray-600 bg-gray-900"
                }`}
              >
                {s < step ? (
                  <CheckCircle2
                    size={16}
                    color={s < step ? "#ffffff" : "#ff6800"}
                  />
                ) : (
                  <Text
                    className={`text-sm font-medium ${
                      s === step ? "text-[#ff6800]" : "text-gray-400"
                    }`}
                  >
                    {s}
                  </Text>
                )}
              </View>
              {s < 4 && (
                <View
                  className={`ml-2 h-0.5 w-12 ${
                    s < step ? "bg-[#ff6800]" : "bg-gray-600"
                  }`}
                />
              )}
            </View>
          ))}
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-xs text-gray-400">Location</Text>
          <Text className="text-xs text-gray-400">Details</Text>
          <Text className="text-xs text-gray-400">Amenities</Text>
          <Text className="text-xs text-gray-400">Pricing</Text>
        </View>
      </View>

      {/* Form Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Step 1: Location */}
        {step === 1 && (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Property Location</CardTitle>
              <CardDescription>Where is your property located?</CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <View>
                <Label>Country *</Label>
                <Select
                  options={COUNTRIES}
                  value={country}
                  onChange={setCountry}
                />
              </View>

              <View>
                <Label>Region (Optional)</Label>
                <Input
                  placeholder="e.g., Midwest, Southwest"
                  value={region}
                  onChangeText={setRegion}
                />
              </View>

              <View>
                <Label>Street Address *</Label>
                <Input
                  placeholder="Enter street address"
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                />
                <Text className="text-xs text-gray-400">
                  Enter the street address of your property
                </Text>
              </View>

              <View>
                <Label>Street Address Continued (Optional)</Label>
                <Input
                  placeholder="Apt, Suite, Unit, Building, Floor, etc."
                  value={streetAddressContinued}
                  onChangeText={setStreetAddressContinued}
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Label>City *</Label>
                  <Input
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>

                <View className="flex-1">
                  <Label>State *</Label>
                  <Select
                    options={US_STATES}
                    value={state}
                    onChange={setState}
                    placeholder="Select state"
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Label>County *</Label>
                  <Input
                    placeholder="County"
                    value={county}
                    onChangeText={setCounty}
                  />
                </View>

                <View className="flex-1">
                  <Label>Zip Code *</Label>
                  <Input
                    placeholder="Zip Code"
                    value={zipCode}
                    onChangeText={setZipCode}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Label>Latitude *</Label>
                  <Input
                    placeholder="e.g., 38.9517"
                    value={lat}
                    onChangeText={setLat}
                    keyboardType="numeric"
                  />
                </View>

                <View className="flex-1">
                  <Label>Longitude *</Label>
                  <Input
                    placeholder="e.g., -92.3341"
                    value={lng}
                    onChangeText={setLng}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Button type="primary" onPress={handleNext} className="w-full">
                <View className="flex-row items-center gap-2">
                  <Text className="text-white font-semibold">Next</Text>
                  <ChevronRight size={16} color="#ffffff" />
                </View>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Property Details */}
        {step === 2 && (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Property Details</CardTitle>
              <CardDescription>Tell us about your property</CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <View>
                <Label>How Many Acres? *</Label>
                <Input
                  placeholder="e.g., 40"
                  value={acreage}
                  onChangeText={setAcreage}
                  keyboardType="numeric"
                />
              </View>

              <View className="gap-2">
                <Label>Land Types *</Label>
                <View className="flex-row flex-wrap gap-3">
                  {LAND_TYPES.map((type) => (
                    <View
                      key={type.id}
                      className="flex-row items-center gap-2 w-[48%]"
                    >
                      <Checkbox
                        value={landTypes.includes(type.id)}
                        onValueChange={(checked) => {
                          if (checked) {
                            setLandTypes([...landTypes, type.id]);
                          } else {
                            setLandTypes(
                              landTypes.filter((t) => t !== type.id)
                            );
                          }
                        }}
                      />
                      <Label>{type.label}</Label>
                    </View>
                  ))}
                </View>
              </View>

              <View className="gap-2">
                <Label>Available Hunting *</Label>
                <View className="gap-2">
                  {HUNTING_TYPES.map((type) => (
                    <View key={type.id} className="flex-row items-center gap-2">
                      <Checkbox
                        value={availableHunting.includes(type.id)}
                        onValueChange={(checked) => {
                          if (checked) {
                            setAvailableHunting([...availableHunting, type.id]);
                          } else {
                            setAvailableHunting(
                              availableHunting.filter((t) => t !== type.id)
                            );
                          }
                        }}
                      />
                      <Label>{type.label}</Label>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <Label>Hunting Party Size Allowed *</Label>
                <Input
                  placeholder="e.g., 4"
                  value={huntingPartySize}
                  onChangeText={setHuntingPartySize}
                  keyboardType="numeric"
                />
                <Text className="text-xs text-gray-400">
                  Maximum number of hunters allowed at one time
                </Text>
              </View>

              <Button type="primary" onPress={handleNext} className="w-full">
                <View className="flex-row items-center gap-2">
                  <Text className="text-white font-semibold">Next</Text>
                  <ChevronRight size={16} color="#ffffff" />
                </View>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Amenities & Description */}
        {step === 3 && (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Amenities & Description</CardTitle>
              <CardDescription>What does your property offer?</CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="gap-2">
                <Label>Available Amenities</Label>
                <View className="flex-row flex-wrap gap-3">
                  {AMENITIES.map((amenity) => (
                    <View
                      key={amenity.id}
                      className="flex-row items-center gap-2 w-[48%]"
                    >
                      <Checkbox
                        value={amenities.includes(amenity.id)}
                        onValueChange={(checked) => {
                          if (checked) {
                            setAmenities([...amenities, amenity.id]);
                          } else {
                            setAmenities(
                              amenities.filter((a) => a !== amenity.id)
                            );
                          }
                        }}
                      />
                      <Label>{amenity.label}</Label>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <Label>Description of the Property *</Label>
                <Textarea
                  placeholder="Describe your property to hunters..."
                  value={description}
                  onChangeText={setDescription}
                />
                <Text className="text-xs text-gray-400">
                  Include details about terrain, wildlife, access, and what
                  makes your property unique
                </Text>
              </View>

              <Button type="primary" onPress={handleNext} className="w-full">
                <View className="flex-row items-center gap-2">
                  <Text className="text-white font-semibold">Next</Text>
                  <ChevronRight size={16} color="#ffffff" />
                </View>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Pricing */}
        {step === 4 && (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set your lease price</CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <View>
                <Label>Price *</Label>
                <Input
                  placeholder="e.g., 2500"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Label>Price Type *</Label>
                <Select
                  options={PRICE_TYPES.map((t) => t.label)}
                  value={PRICE_TYPES.find((t) => t.value === priceType)?.label}
                  onChange={(value) => {
                    const selected = PRICE_TYPES.find((t) => t.label === value);
                    if (selected) setPriceType(selected.value);
                  }}
                />
              </View>

              <View className="flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4">
                <View className="flex-1 gap-1">
                  <Label className="text-base">Is this price negotiable?</Label>
                  <Text className="text-sm text-gray-400">
                    Allow potential lessees to negotiate the price
                  </Text>
                </View>
                <Switch
                  value={isPriceNegotiable}
                  onValueChange={setIsPriceNegotiable}
                />
              </View>

              <Button
                type="primary"
                onPress={handleSubmit}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Text className="text-white font-semibold">
                    Submitting...
                  </Text>
                ) : (
                  <Text className="text-white font-semibold">
                    Submit Listing
                  </Text>
                )}
              </Button>

              <Text className="text-center text-xs text-gray-400">
                Your listing will be reviewed by our team before going live
              </Text>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
