import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  CheckCircle,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Truck,
  Upload,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

interface VehicleRecoveryPageProps {
  onBack: () => void;
}

export default function VehicleRecoveryPage({
  onBack,
}: VehicleRecoveryPageProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] =
    useState<Id<"vehicleRecoveryRequests"> | null>(null);
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
    api.vehicleRecovery.getRequests,
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
      <View className="px-4 py-3 border-b border-gray-700 bg-gray-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
              <ArrowLeft size={16} color="#fff" />
            </Button>
            <View className="flex-col">
              <Text className="text-lg font-bold text-white">
                Vehicle Recovery
              </Text>
              <Text className="text-xs text-gray-400">
                Get help from nearby hunters
              </Text>
            </View>
          </View>
          <Button type="primary" onPress={() => setShowCreateDialog(true)}>
            <View className="flex-row items-center gap-2">
              <Plus size={16} color="#000" />
              <Text className="">Request Help</Text>
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
              <CardContent>
                <View className="flex-col items-center justify-center pb-2">
                  <Truck
                    size={48}
                    color="#9ca3af"
                    style={{ marginBottom: 12 }}
                  />
                  <Text className="mb-1 font-semibold text-white">
                    No active requests
                  </Text>
                  <Text className="mb-4 text-sm text-gray-400">
                    Need help? Create a recovery request.
                  </Text>
                  <Button
                    type="primary"
                    onPress={() => setShowCreateDialog(true)}
                  >
                    <Text className="text-white font-semibold">
                      Request Help
                    </Text>
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
                        <Text className="font-semibold leading-tight text-white">
                          {request.serviceNeeded}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-2">
                          <Text className="text-xs text-gray-400">
                            {request.user?.name || "Unknown"}
                          </Text>
                          <Text className="text-xs text-gray-400">
                            {"\u2022"}
                          </Text>
                          <Text className="text-xs text-gray-400">
                            {formatDistanceToNow(request.createdAt, {
                              addSuffix: true,
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {request.distance !== undefined && (
                      <Badge type="secondary" className="text-xs">
                        <Text>{request.distance.toFixed(1)} mi</Text>
                      </Badge>
                    )}
                  </View>
                </CardHeader>
                <CardContent className="pt-0">
                  {request.description && (
                    <Text
                      className="mb-3 text-sm text-gray-400"
                      numberOfLines={2}
                    >
                      {request.description}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <Phone size={14} color="#9ca3af" />
                      <Text className="text-xs text-gray-400">
                        {request.phoneNumber}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MessageSquare size={14} color="#9ca3af" />
                      <Text className="text-xs text-gray-400">
                        {request.commentCount}
                      </Text>
                    </View>
                    {request.locationName && (
                      <View className="flex-row items-center gap-1">
                        <MapPin size={14} color="#9ca3af" />
                        <Text className="text-xs text-gray-400 truncate">
                          {request.locationName}
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
          onOpenChange={setShowCreateDialog}
          userLocation={userLocation}
        />
      )}
    </View>
  );
}

// Request History Section Component
function RequestHistorySection({
  onSelectRequest,
}: {
  onSelectRequest: (requestId: Id<"vehicleRecoveryRequests">) => void;
}) {
  const history = useQuery(api.vehicleRecovery.getRequestHistory);
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
                  {request.serviceNeeded}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <Text className="text-xs text-gray-400">Closed</Text>
                  <Text className="text-xs text-gray-400">{"\u2022"}</Text>
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
                <Text>Resolved</Text>
              </Badge>
            </View>
          </CardHeader>
        </Card>
      ))}
    </View>
  );
}

// Request Detail View Component
function RequestDetailView({
  requestId,
  onBack,
}: {
  requestId: Id<"vehicleRecoveryRequests">;
  onBack: () => void;
}) {
  const [commentText, setCommentText] = useState("");
  const request = useQuery(api.vehicleRecovery.getRequest, { requestId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const addComment = useMutation(api.vehicleRecovery.addComment);
  const closeRequest = useMutation(api.vehicleRecovery.closeRequest);
  const reopenRequest = useMutation(api.vehicleRecovery.reopenRequest);
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

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "owner";
  const isOwner = request?.userId === currentUser?._id;
  const isClosed = request?.closedAt !== undefined;

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await addComment({
        requestId,
        content: commentText,
      });
      setCommentText("");
      showToast("Comment added!");
    } catch (error) {
      showToast("Failed to add comment");
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
          <View className="mb-4 h-8 w-8 rounded-full border-4 border-[#ff6800] border-t-transparent" />
          <Text className="text-gray-400">Loading request...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
            <ArrowLeft size={20} color="#ffffff" />
          </Button>
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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
      >
        <View className="gap-4">
          <Card>
            <CardHeader className="pb-0">
              <View className="mb-2 flex-row items-center gap-3">
                <Avatar
                  size={40}
                  fallback={request.user?.name?.[0]?.toUpperCase() || "?"}
                />
                <View>
                  <Text className="font-semibold text-white">
                    {request.user?.name || "Unknown"}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {formatDistanceToNow(request.createdAt, {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
              </View>
              <Text className="text-xl mb-2 font-bold text-white">
                {request.serviceNeeded}
              </Text>
              <View className="flex-row gap-2">
                <Badge
                  type={request.status === "active" ? "default" : "secondary"}
                >
                  <Text>
                    {isClosed ? (
                      <Text>Closed</Text>
                    ) : (
                      <Text>{request.status}</Text>
                    )}
                  </Text>
                </Badge>
                {request.requestStatus && !isClosed && (
                  <Badge type="default">
                    <Text>
                      {request.requestStatus === "still_waiting" ? (
                        <Text>Still Waiting</Text>
                      ) : (
                        <Text>In Progress</Text>
                      )}
                    </Text>
                  </Badge>
                )}
              </View>
            </CardHeader>
            <CardContent>
              {request.description && (
                <Text className="mb-2 whitespace-pre-wrap text-sm text-white">
                  {request.description}
                </Text>
              )}
              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${request.phoneNumber}`)}
                  className="flex-row items-center gap-2"
                >
                  <Phone size={16} color="#9ca3af" />
                  <Text className="text-sm text-[#ff6800] underline">
                    {request.phoneNumber}
                  </Text>
                </TouchableOpacity>
                {request.locationName && (
                  <View className="flex-row items-center gap-2">
                    <MapPin size={16} color="#9ca3af" />
                    <Text className="text-sm text-white">
                      {request.locationName}
                    </Text>
                  </View>
                )}
              </View>
              {request.photos && request.photos.length > 0 && (
                <View className="mt-4 flex-row flex-wrap gap-2">
                  {request.photos.map((photo, index) => (
                    <PhotoDisplay key={index} storageId={photo} />
                  ))}
                </View>
              )}
            </CardContent>
          </Card>

          {/* {request.lat && request.lng && (
            <Card>
              <CardHeader>
                <Text className="font-semibold text-white">Location</Text>
              </CardHeader>
              <CardContent>
                <View className="h-48 overflow-hidden rounded-lg">
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
          )} */}

          <View className="gap-3">
            <Text className="font-semibold text-white">
              <Text>Comments (</Text>
              <Text>{request.commentCount}</Text>
              <Text>)</Text>
            </Text>
            {request.comments.length === 0 ? (
              <Card>
                <CardContent className="flex-row items-center justify-center">
                  <Text className="text-center text-sm text-gray-400">
                    No comments yet. Be the first to help!
                  </Text>
                </CardContent>
              </Card>
            ) : (
              request.comments.map((comment) => (
                <Card key={comment._id}>
                  <CardContent className="p-4">
                    <View className="mb-2 flex-row items-center gap-2">
                      <Avatar
                        size={24}
                        fallback={comment.user?.name?.[0]?.toUpperCase() || "?"}
                      />
                      <Text className="text-sm font-medium text-white">
                        {comment.user?.name || "Unknown"}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {formatDistanceToNow(comment.createdAt, {
                          addSuffix: true,
                        })}
                      </Text>
                    </View>
                    <Text className="text-sm text-white">
                      {comment.content}
                    </Text>
                  </CardContent>
                </Card>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {request.status === "active" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="border-t border-gray-700 bg-gray-800 p-4"
        >
          <View className="flex-row gap-2">
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handleAddComment}
              className="flex-1"
            />
            <Button
              type="primary"
              onPress={handleAddComment}
              disabled={!commentText.trim()}
            >
              <Send size={16} color="#ffffff" />
            </Button>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

// Create Request Dialog Component
function CreateRequestDialog({
  open,
  onOpenChange,
  userLocation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLocation: { lat: number; lng: number } | null;
}) {
  const profile = useQuery(api.profile.getMyProfile, {});
  const [serviceNeeded, setServiceNeeded] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    userLocation
  );
  const [locationName, setLocationName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.5,
    longitude: -82.5,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const createRequest = useMutation(api.vehicleRecovery.createRequest);
  const generateUploadUrl = useMutation(api.vehicleRecovery.generateUploadUrl);

  useEffect(() => {
    if (userLocation && !location) {
      setLocation(userLocation);
      setMapRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation, location]);

  useEffect(() => {
    if (profile?.phoneNumber) {
      setPhoneNumber(profile.phoneNumber);
    }
  }, [profile]);

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

    if (photos.length >= 4) {
      showToast("Maximum 4 photos allowed");
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
    const remainingSlots = 4 - photos.length;
    const photosToAdd = newPhotos.slice(0, remainingSlots);

    setIsUploading(true);
    try {
      const uploadPromises = photosToAdd.map(async (asset) => {
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          showToast(`${asset.fileName || "Photo"} is too large (max 5MB)`);
          return null;
        }

        const uploadUrl = await generateUploadUrl({});

        const photoResp = await fetch(asset.uri);
        if (!photoResp.ok) {
          throw new Error(`Failed to read image: ${photoResp.status}`);
        }
        const blob = await photoResp.blob();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": asset.mimeType || "image/jpeg" },
          body: blob,
        });

        if (!result.ok) {
          throw new Error("Upload failed");
        }

        const responseText = await result.text();
        const { storageId } = JSON.parse(responseText);
        return storageId as string;
      });

      const storageIds = await Promise.all(uploadPromises);
      const validIds = storageIds.filter((id): id is string => id !== null);

      setPhotos((prev) => [...prev, ...validIds]);
      showToast(`${validIds.length} photo(s) uploaded`);
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload photos");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!serviceNeeded.trim() || !phoneNumber.trim()) {
      showToast("Please fill in all required fields and set your location");
      return;
    }

    // if (!location) {
    //   showToast("Please select a location on the map");
    //   return;
    // }

    try {
      setIsSubmitting(true);
      await createRequest({
        serviceNeeded,
        description,
        phoneNumber,
        lat: location?.lat || 0,
        lng: location?.lng || 0,
        locationName,
        photos: photos.length > 0 ? photos : undefined,
      });
      showToast("Request created! Nearby hunters will be notified.");
      setServiceNeeded("");
      setDescription("");
      setPhoneNumber(profile?.phoneNumber || "");
      setLocationName("");
      setPhotos([]);
      onOpenChange(false);
    } catch (error) {
      showToast("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="max-h-[70vh]"
      >
        <ScrollView className="max-h-[70vh] pr-0.5">
          <View className="gap-4">
            <View className="gap-1">
              <Text className="text-xl font-bold text-white">
                Request Vehicle Recovery
              </Text>
              <Text className="text-sm text-gray-400">
                Get help from nearby hunters within 50 miles
              </Text>
            </View>
            <View>
              <Label>Your Name</Label>
              <Input
                value={profile?.name || "Loading..."}
                onChangeText={() => {}}
                editable={false}
                className="bg-gray-700"
              />
              {profile?.memberNumber && (
                <Badge type="default" className="text-xs text-yellow-500 mt-1">
                  <Text>{profile.memberNumber}</Text>
                </Badge>
              )}
            </View>
            <View>
              <Label>Service Needed *</Label>
              <Input
                placeholder="e.g., Tow, Tire Change, Jump Start"
                value={serviceNeeded}
                onChangeText={setServiceNeeded}
              />
            </View>
            <View>
              <Label>Phone Number *</Label>
              <Input
                placeholder="555-123-4567"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
            <View>
              <Label>Description</Label>
              <Textarea
                placeholder="Provide details about your situation..."
                value={description}
                onChangeText={setDescription}
              />
            </View>
            <View>
              <Label>Location Name</Label>
              <Input
                placeholder="e.g., Highway 54, near Johnson Creek"
                value={locationName}
                onChangeText={setLocationName}
              />
            </View>
            <View>
              <Label>Photos (Optional)</Label>
              <View className="gap-3">
                {photos.length > 0 && (
                  <View className="flex-row flex-wrap gap-2">
                    {photos.map((storageId, index) => (
                      <View key={index} className="relative">
                        <PhotoDisplay storageId={storageId} />
                        <TouchableOpacity
                          onPress={() => removePhoto(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1"
                        >
                          <X size={12} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                <Button
                  type="outline"
                  onPress={handlePhotoSelect}
                  disabled={isUploading || photos.length >= 4}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Upload size={16} color="#ffffff" />
                      <Text className="text-white">
                        Upload Photos ({photos.length}/4)
                      </Text>
                    </View>
                  )}
                </Button>
              </View>
              <Text className="text-xs text-gray-400">
                Upload up to 4 photos (max 5MB each)
              </Text>
            </View>
            <View>
              <Label>Location on Map *</Label>
              {location ? (
                <View className="h-48 overflow-hidden rounded-lg border border-gray-700">
                  <MapView
                    style={{ flex: 1, width: "100%", height: "100%" }}
                    initialRegion={mapRegion}
                    onPress={handleMapPress}
                    mapType="hybrid"
                  >
                    <Marker
                      coordinate={{
                        latitude: location.lat,
                        longitude: location.lng,
                      }}
                    />
                  </MapView>
                </View>
              ) : (
                <View className="flex h-48 items-center justify-center rounded-lg border border-gray-700 bg-gray-700">
                  <Text className="text-sm text-gray-400">Loading map...</Text>
                </View>
              )}
              <Text className="text-xs text-gray-400">
                Tap on the map to set your exact location
              </Text>
            </View>
          </View>
        </ScrollView>
        <View className="flex-row gap-3 mt-4">
          <Button
            type="outline"
            onPress={() => onOpenChange(false)}
            disabled={isSubmitting || isUploading}
            className="flex-1"
          >
            <Text className="text-white font-semibold">Cancel</Text>
          </Button>
          <Button
            type="primary"
            onPress={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="flex-1"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold">Request Help</Text>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Dialog>
  );
}

// Photo Display Component
function PhotoDisplay({ storageId }: { storageId: string }) {
  const photoUrl = useQuery(api.vehicleRecovery.getPhotoUrl, { storageId });

  if (!photoUrl) {
    return (
      <View className="h-32 w-32 items-center justify-center rounded-lg border border-gray-700 bg-gray-700">
        {/* This is an icon, safe to render as JSX */}
        <ImageIcon size={32} color="#9ca3af" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: photoUrl }}
      className="h-32 w-32 rounded-lg"
      resizeMode="cover"
    />
  );
}
