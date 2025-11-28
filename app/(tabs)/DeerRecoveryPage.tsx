import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioItem } from "@/components/ui/RadioGroup";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import {
  CheckCircle,
  ChevronLeft,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Target,
  Upload,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

interface DeerRecoveryPageProps {
  onBack: () => void;
}

export default function DeerRecoveryPage({ onBack }: DeerRecoveryPageProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] =
    useState<Id<"deerRecoveryRequests"> | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get user's location
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const requests = useQuery(
    api.deerRecovery.getRequests,
    userLocation
      ? {
          userLat: userLocation.lat,
          userLng: userLocation.lng,
          maxDistance: 50,
        }
      : {}
  );

  if (selectedRequestId) {
    return (
      <RequestDetailView
        requestId={selectedRequestId}
        onBack={() => setSelectedRequestId(null)}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack}>
            <ChevronLeft size={20} color="#ffffff" />
          </Button>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">Deer Recovery</Text>
            <Text className="text-xs text-gray-400">
              Need Help Recovering A Deer
            </Text>
          </View>
          <Button onPress={() => setShowCreateDialog(true)}>
            <View className="flex-row items-center gap-2">
              <Plus size={16} color="#ffffff" />
              <Text className="text-white">Request Help</Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Active Requests List */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="gap-3">
          <Text className="text-sm font-semibold text-gray-400">
            Active Requests
          </Text>
          {!requests ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <View className="items-center">
                  <Target
                    size={48}
                    color="#9ca3af"
                    style={{ marginBottom: 12 }}
                  />
                  <Text className="mb-1 font-semibold text-white">
                    No active requests
                  </Text>
                  <Text className="mb-4 text-sm text-gray-400">
                    Need help recovering a deer? Create a request.
                  </Text>
                  <Button onPress={() => setShowCreateDialog(true)}>
                    <Text className="text-white">Request Help</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card
                key={request._id}
                onPress={() => setSelectedRequestId(request._id)}
              >
                <CardHeader className="pb-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-row items-start gap-3">
                      <Avatar
                        size={40}
                        fallback={request.user?.name?.[0]?.toUpperCase() || "?"}
                      />
                      <View className="flex-1">
                        <Text className="font-semibold text-sm text-white">
                          {request.user?.name || "Unknown Hunter"}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {formatDistanceToNow(request.createdAt, {
                            addSuffix: true,
                          })}
                        </Text>
                      </View>
                    </View>
                    {request.distance && (
                      <Badge type="secondary" className="text-xs">
                        {request.distance.toFixed(1)} mi
                      </Badge>
                    )}
                  </View>
                </CardHeader>
                <CardContent className="gap-2">
                  <Text className="text-sm text-white" numberOfLines={2}>
                    {request.notes}
                  </Text>
                  <View className="flex-row flex-wrap items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <MapPin size={12} color="#9ca3af" />
                      <Text className="text-xs text-gray-400">
                        {request.locationName || "Location shared"}
                      </Text>
                    </View>
                    {request.shotPlacement && (
                      <Badge type="default" className="text-xs">
                        {request.shotPlacement === "quartered_away" &&
                          "Quartered Away"}
                        {request.shotPlacement === "quartering_to" &&
                          "Quartering To"}
                        {request.shotPlacement === "broadside" && "Broadside"}
                      </Badge>
                    )}
                    {request.yardsFromHit && (
                      <Badge type="default" className="text-xs">
                        {request.yardsFromHit} from hit
                      </Badge>
                    )}
                    {request.commentCount > 0 && (
                      <View className="flex-row items-center gap-1">
                        <MessageSquare size={12} color="#9ca3af" />
                        <Text className="text-xs text-gray-400">
                          {request.commentCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Ticket History */}
      <RequestHistorySection onSelectRequest={setSelectedRequestId} />

      {/* Create Request Dialog */}
      {showCreateDialog && (
        <CreateRequestDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </View>
  );
}

// Request History Section Component
function RequestHistorySection({
  onSelectRequest,
}: {
  onSelectRequest: (requestId: Id<"deerRecoveryRequests">) => void;
}) {
  const history = useQuery(api.deerRecovery.getRequestHistory);
  const currentUser = useQuery(api.users.getCurrentUser);
  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "owner";

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <View className="gap-3 p-4 pb-6 border-t border-gray-700">
      <Text className="text-sm font-semibold text-gray-400">
        {isAdmin ? "Ticket History" : "Recent Closed Tickets"}
      </Text>
      <Text className="text-xs text-gray-400 -mt-2">
        {isAdmin
          ? "View and reopen closed tickets"
          : "Visible for 10 minutes after closing"}
      </Text>
      {history.map((request) => (
        <Card
          key={request._id}
          onPress={() => onSelectRequest(request._id)}
          className="opacity-75"
        >
          <CardHeader className="pb-3">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="font-semibold leading-tight text-white">
                  Deer Recovery Request
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <Text className="text-xs text-gray-400">Closed</Text>
                  <Text className="text-xs text-gray-400">•</Text>
                  <Text className="text-xs text-gray-400">
                    {formatDistanceToNow(
                      request.closedAt || request.createdAt,
                      {
                        addSuffix: true,
                      }
                    )}
                  </Text>
                </View>
              </View>
              <Badge type="secondary" className="text-xs">
                Resolved
              </Badge>
            </View>
          </CardHeader>
        </Card>
      ))}
    </View>
  );
}

function CreateRequestDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const profile = useQuery(api.profile.getMyProfile, {});
  const createRequest = useMutation(api.deerRecovery.createRequest);
  const generateUploadUrl = useMutation(api.deerRecovery.generateUploadUrl);

  const [notes, setNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shotPlacement, setShotPlacement] = useState<string>("");
  const [yardsFromHit, setYardsFromHit] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationName, setLocationName] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<
    { uri: string; type?: string; name?: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.5,
    longitude: -82.5,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Set phone number from profile when loaded
  useEffect(() => {
    if (profile?.phoneNumber) {
      setPhoneNumber(profile.phoneNumber);
    }
  }, [profile]);

  // Get user's location
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.geolocation &&
      !location
    ) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(pos);
          setMapRegion({
            latitude: pos.lat,
            longitude: pos.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Florida center if location unavailable
          setLocation({ lat: 28.5, lng: -82.5 });
        }
      );
    }
  }, [location]);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ lat: latitude, lng: longitude });
  };

  const handlePhotoSelect = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showToast("Media permission is required");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: false,
    });

    if (pickerResult.canceled) return;

    const newPhotos = pickerResult.assets || [];

    if (selectedPhotos.length + newPhotos.length > 4) {
      showToast("You can only upload up to 4 photos");
      return;
    }

    const validPhotos = newPhotos.filter((asset) => {
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        showToast(`${asset.fileName || "Photo"} is larger than 5MB`);
        return false;
      }
      return true;
    });

    setSelectedPhotos((prev) => [
      ...prev,
      ...validPhotos.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || "photo.jpg",
      })),
    ]);
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!notes.trim()) {
      showToast("Please describe what help you need");
      return;
    }

    if (!phoneNumber.trim()) {
      showToast("Please provide a phone number");
      return;
    }

    if (!location) {
      showToast("Please select a location on the map");
      return;
    }

    try {
      setUploading(true);

      // Upload photos if any
      const photoIds: string[] = [];
      for (const photo of selectedPhotos) {
        const uploadUrl = await generateUploadUrl();

        // Fetch the image file from local URI
        const photoResp = await fetch(photo.uri);
        if (!photoResp.ok) {
          throw new Error(`Failed to read image: ${photoResp.status}`);
        }
        const blob = await photoResp.blob();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": photo.type || "image/jpeg" },
          body: blob,
        });

        if (!result.ok) {
          throw new Error(`Upload failed: ${result.status}`);
        }

        const responseText = await result.text();
        const { storageId } = JSON.parse(responseText);
        photoIds.push(storageId);
      }

      await createRequest({
        notes: notes.trim(),
        phoneNumber: phoneNumber.trim(),
        lat: location.lat,
        lng: location.lng,
        locationName: locationName.trim() || undefined,
        shotPlacement: shotPlacement || undefined,
        yardsFromHit: yardsFromHit.trim() || undefined,
        photos: photoIds.length > 0 ? photoIds : undefined,
      });

      showToast("Recovery request created successfully");
      onClose();
      // Reset form
      setNotes("");
      setPhoneNumber(profile?.phoneNumber || "");
      setShotPlacement("");
      setYardsFromHit("");
      setLocationName("");
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Error creating request:", error);
      showToast("Failed to create request. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog visible={open} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="max-h-[90vh]"
      >
        <ScrollView className="max-h-[90vh]">
          <View className="gap-4">
            <View className="gap-1">
              <Text className="text-xl font-bold text-white">
                Request Deer Recovery Help
              </Text>
              <Text className="text-sm text-gray-400">
                Request help from nearby hunters to recover your deer
              </Text>
            </View>

            {/* Name (auto-filled from profile) */}
            <View className="gap-2">
              <Label>Your Name</Label>
              <Input
                value={profile?.name || "Loading..."}
                onChangeText={() => {}}
                editable={false}
                className="bg-gray-700"
              />
              {profile?.memberNumber && (
                <Badge type="default" className="text-xs text-yellow-500 mt-1">
                  {profile.memberNumber}
                </Badge>
              )}
            </View>

            {/* Phone Number */}
            <View className="gap-2">
              <Label>Phone Number *</Label>
              <Input
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Notes */}
            <View className="gap-2">
              <Label>What do you need help with? *</Label>
              <Textarea
                placeholder="Describe the situation and what assistance you need..."
                value={notes}
                onChangeText={setNotes}
                className="min-h-32"
              />
            </View>

            {/* Shot Placement */}
            <View className="gap-2">
              <Label>Shot Placement</Label>
              <RadioGroup
                value={shotPlacement}
                onValueChange={setShotPlacement}
              >
                <RadioItem
                  value="quartered_away"
                  selectedValue={shotPlacement}
                  onSelect={setShotPlacement}
                  label="Quartered Away"
                />
                <RadioItem
                  value="quartering_to"
                  selectedValue={shotPlacement}
                  onSelect={setShotPlacement}
                  label="Quartering To"
                />
                <RadioItem
                  value="broadside"
                  selectedValue={shotPlacement}
                  onSelect={setShotPlacement}
                  label="Broadside"
                />
              </RadioGroup>
            </View>

            {/* Yards From Hit */}
            <View className="gap-2">
              <Label>How many yards walked from the hit site?</Label>
              <Input
                placeholder="e.g., 50 yards"
                value={yardsFromHit}
                onChangeText={setYardsFromHit}
                keyboardType="numeric"
              />
            </View>

            {/* Photos */}
            <View className="gap-2">
              <Label>Photos of Blood Trail</Label>
              <View className="gap-2">
                {selectedPhotos.length > 0 && (
                  <View className="flex-row flex-wrap gap-2">
                    {selectedPhotos.map((photo, index) => (
                      <View key={index} className="relative">
                        <Image
                          source={{ uri: photo.uri }}
                          className="h-24 w-24 rounded-md"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => handleRemovePhoto(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1"
                        >
                          <X size={12} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                {selectedPhotos.length < 4 && (
                  <Button type="outline" onPress={handlePhotoSelect}>
                    <View className="flex-row items-center gap-2">
                      <Upload size={16} color="#ffffff" />
                      <Text className="text-white">
                        Upload Photos ({selectedPhotos.length}/4)
                      </Text>
                    </View>
                  </Button>
                )}
                <Text className="text-xs text-gray-400">
                  Upload up to 4 photos (max 5MB each)
                </Text>
              </View>
            </View>

            {/* Location Picker */}
            <View className="gap-2">
              <Label>Drop a Pin for Location *</Label>
              <Input
                value={locationName}
                onChangeText={setLocationName}
                placeholder="Location name (optional)"
              />
              {location && (
                <View className="h-64 overflow-hidden rounded-md border border-gray-700">
                  <MapView
                    style={{ flex: 1, width: "100%", height: "100%" }}
                    initialRegion={mapRegion}
                    onPress={handleMapPress}
                    mapType="hybrid"
                  >
                    {location && (
                      <Marker
                        coordinate={{
                          latitude: location.lat,
                          longitude: location.lng,
                        }}
                      />
                    )}
                  </MapView>
                </View>
              )}
              <Text className="text-xs text-gray-400">
                Tap on the map to set your location
              </Text>
            </View>
          </View>
        </ScrollView>
        <View className="flex-row gap-3 mt-4">
          <Button
            type="outline"
            onPress={onClose}
            className="flex-1"
            disabled={uploading}
          >
            <Text className="text-white">Cancel</Text>
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white">Request Help</Text>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Dialog>
  );
}

function RequestDetailView({
  requestId,
  onBack,
}: {
  requestId: Id<"deerRecoveryRequests">;
  onBack: () => void;
}) {
  const request = useQuery(api.deerRecovery.getRequest, { requestId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const addComment = useMutation(api.deerRecovery.addComment);
  const closeRequest = useMutation(api.deerRecovery.closeRequest);
  const reopenRequest = useMutation(api.deerRecovery.reopenRequest);
  const profile = useQuery(api.profile.getMyProfile, {});

  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.5,
    longitude: -82.5,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (request) {
      setMapRegion({
        latitude: request.lat,
        longitude: request.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [request]);

  const isOwner = profile && request && request.userId === profile._id;
  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "owner";
  const isClosed = request?.closedAt !== undefined;

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      await addComment({
        requestId,
        content: commentText.trim(),
      });
      setCommentText("");
      showToast("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    try {
      await closeRequest({ requestId });
      showToast("Request closed successfully");
      onBack();
    } catch (error) {
      showToast("Failed to close request");
    }
  };

  const handleReopen = async () => {
    try {
      await reopenRequest({ requestId });
      showToast("Request reopened successfully");
    } catch (error) {
      showToast("Failed to reopen request");
    }
  };

  if (!request) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <View className="items-center">
          <Skeleton className="mb-4 h-12 w-12 rounded-full" />
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack}>
            <ChevronLeft size={20} color="#ffffff" />
          </Button>
          <Avatar
            size={40}
            fallback={request.user?.name?.[0]?.toUpperCase() || "?"}
          />
          <View className="flex-1">
            <Text className="font-semibold text-white">
              {request.user?.name || "Unknown Hunter"}
            </Text>
            <Text className="text-xs text-gray-400">
              {formatDistanceToNow(request.createdAt, { addSuffix: true })}
            </Text>
          </View>
          <View className="flex-row gap-2">
            {isOwner && !isClosed && (
              <Button onPress={handleClose} className="bg-green-500">
                <View className="flex-row items-center gap-2">
                  <CheckCircle size={16} color="#ffffff" />
                  <Text className="text-white">Close Request</Text>
                </View>
              </Button>
            )}
            {isAdmin && isClosed && (
              <Button type="outline" onPress={handleReopen}>
                <Text className="text-white">Reopen Request</Text>
              </Button>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="gap-4">
          {/* Notes */}
          <Card>
            <CardHeader>
              <Text className="font-semibold text-white">Request Details</Text>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="flex-row flex-wrap gap-2 mb-3">
                <Badge type={isClosed ? "secondary" : "default"}>
                  {isClosed ? "Closed" : "Active"}
                </Badge>
                {request.requestStatus && !isClosed && (
                  <Badge type="default">
                    {request.requestStatus === "still_waiting"
                      ? "Still Waiting"
                      : "In Progress"}
                  </Badge>
                )}
              </View>
              <Text className="text-sm text-white">{request.notes}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Badge type="default">
                  <View className="flex-row items-center gap-1">
                    <Phone size={12} color="#ffffff" />
                    <Text className="text-white">{request.phoneNumber}</Text>
                  </View>
                </Badge>
                {request.shotPlacement && (
                  <Badge type="secondary">
                    {request.shotPlacement === "quartered_away" &&
                      "Shot: Quartered Away"}
                    {request.shotPlacement === "quartering_to" &&
                      "Shot: Quartering To"}
                    {request.shotPlacement === "broadside" && "Shot: Broadside"}
                  </Badge>
                )}
                {request.yardsFromHit && (
                  <Badge type="secondary">
                    Distance: {request.yardsFromHit} from hit
                  </Badge>
                )}
              </View>
            </CardContent>
          </Card>

          {/* Photos */}
          {request.photos && request.photos.length > 0 && (
            <Card>
              <CardHeader>
                <Text className="font-semibold text-white">
                  Blood Trail Photos
                </Text>
              </CardHeader>
              <CardContent>
                <PhotoDisplay photos={request.photos} />
              </CardContent>
            </Card>
          )}

          {/* Location Map */}
          <Card>
            <CardHeader>
              <Text className="font-semibold text-white">Location</Text>
              {request.locationName && (
                <Text className="text-sm text-gray-400">
                  {request.locationName}
                </Text>
              )}
            </CardHeader>
            <CardContent>
              <View className="h-48 overflow-hidden rounded-md">
                <MapView
                  style={{ flex: 1, width: "100%", height: "100%" }}
                  initialRegion={mapRegion}
                  mapType="hybrid"
                >
                  <Marker
                    coordinate={{
                      latitude: request.lat,
                      longitude: request.lng,
                    }}
                  />
                </MapView>
              </View>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <Text className="font-semibold text-white">
                Comments ({request.comments.length})
              </Text>
            </CardHeader>
            <CardContent className="gap-3">
              {request.comments.length === 0 ? (
                <Text className="text-center text-sm text-gray-400 py-4">
                  No comments yet
                </Text>
              ) : (
                request.comments.map((comment) => (
                  <View key={comment._id} className="flex-row gap-3">
                    <Avatar
                      size={32}
                      fallback={comment.user?.name?.[0]?.toUpperCase() || "?"}
                    />
                    <View className="flex-1">
                      <View className="flex-row items-baseline gap-2">
                        <Text className="text-sm font-medium text-white">
                          {comment.user?.name || "Unknown"}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {formatDistanceToNow(comment.createdAt, {
                            addSuffix: true,
                          })}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-400">
                        {comment.content}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      {/* Comment Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="border-t border-gray-700 bg-gray-800 p-4"
      >
        <View className="flex-row gap-2">
          <Input
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Write a comment..."
            onSubmitEditing={handleAddComment}
            className="flex-1"
            editable={!submitting}
          />
          <Button
            onPress={handleAddComment}
            disabled={submitting || !commentText.trim()}
          >
            <Send size={16} color="#ffffff" />
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function PhotoDisplay({ photos }: { photos: string[] }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {photos.map((photoId, index) => (
        <PhotoItem key={photoId} storageId={photoId} />
      ))}
    </View>
  );
}

function PhotoItem({ storageId }: { storageId: string }) {
  const photoUrl = useQuery(api.deerRecovery.getPhotoUrl, { storageId });

  if (!photoUrl) {
    return (
      <View className="h-32 w-32 items-center justify-center rounded-md bg-gray-700">
        <ImageIcon size={32} color="#9ca3af" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: photoUrl }}
      className="h-32 w-32 rounded-md"
      resizeMode="cover"
    />
  );
}
