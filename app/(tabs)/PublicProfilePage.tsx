import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Crosshair,
  Heart,
  MapPin,
  Trophy,
} from "lucide-react-native";
import { Image, ScrollView, Text, View } from "react-native";

interface PublicProfilePageProps {
  userId: Id<"users">;
  onBack: () => void;
}

export default function PublicProfilePage({
  userId,
  onBack,
}: PublicProfilePageProps) {
  const profile = useQuery(api.profile.getPublicProfile, { userId });

  // Get avatar URL from storage if it's a storage ID
  const avatarUrl = useQuery(
    api.profile.getPhotoUrl,
    profile?.avatar && profile.avatar.startsWith("kg")
      ? { storageId: profile.avatar as never }
      : "skip"
  );

  if (profile === undefined) {
    return (
      <View className="flex-1 bg-gray-900 pt-8">
        <View className="border-b border-gray-800 bg-gray-800 px-4 py-3">
          <View className="flex-row items-center gap-3">
            <Button type="ghost" onPress={onBack}>
              <ArrowLeft size={16} color="#fff" />
            </Button>
            <Skeleton className="h-6 w-48" />
          </View>
        </View>
        <ScrollView className="flex-1">
          <View className="space-y-4 p-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </View>
        </ScrollView>
      </View>
    );
  }

  const memberSince = profile._creationTime
    ? format(new Date(profile._creationTime), "MMMM yyyy")
    : "Unknown";

  return (
    <View className="flex-1 bg-gray-900 pt-8">
      {/* Header */}
      <View className="border-b border-gray-800 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-1">
          <Button type="ghost" onPress={onBack}>
            <ArrowLeft size={16} color="#fff" />
          </Button>
          <View>
            <Text className="text-lg font-bold text-white">Member Profile</Text>
            <Text className="text-xs text-gray-400">
              View member information
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
        <View className="flex-col gap-2 p-4">
          {/* Profile Header Card */}
          <View className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <View className="items-center">
              <Avatar
                src={avatarUrl || profile.avatar}
                fallback={
                  profile.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?"
                }
                size={96}
                className="mb-4"
              />
              <Text className="text-2xl font-bold text-white text-center">
                {profile.name || "Unknown"}
              </Text>
              {profile.username && (
                <Text className="text-sm text-gray-400 mt-1">
                  @{profile.username}
                </Text>
              )}
              {(profile.city || profile.state) && (
                <View className="flex-row items-center gap-1 mt-2">
                  <MapPin size={16} color="#9ca3af" />
                  <Text className="text-sm text-gray-400">
                    {[profile.city, profile.state].filter(Boolean).join(", ")}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center gap-1 mt-2">
                <Calendar size={12} color="#9ca3af" />
                <Text className="text-xs text-gray-400">
                  Member since {memberSince}
                </Text>
              </View>
            </View>
          </View>

          {/* Bio Card */}
          {profile.bio && (
            <View className="bg-gray-800 p-4 border border-gray-700 rounded-lg">
              <View>
                <Text className="text-base font-semibold text-white">
                  About
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-sm text-white">{profile.bio}</Text>
              </View>
            </View>
          )}

          {/* Hunting Info Card */}
          {(profile.yearsOfExperience ||
            profile.favoriteSpecies ||
            profile.huntingPreferences ||
            profile.weaponTypes) && (
            <View className="bg-gray-800 p-4 border border-gray-700 rounded-lg">
              <View>
                <View className="flex-row items-center gap-2">
                  <Crosshair size={16} color="#fff" />
                  <Text className="text-base font-semibold text-white">
                    Hunting Profile
                  </Text>
                </View>
              </View>
              <View className="mt-3 flex-col gap-2">
                {profile.yearsOfExperience !== undefined &&
                  profile.yearsOfExperience !== null && (
                    <View>
                      <Text className="text-xs text-gray-400 mb-1">
                        Experience
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Trophy size={16} color="#f59e0b" />
                        <Text className="text-sm font-medium text-white">
                          {profile.yearsOfExperience}{" "}
                          {profile.yearsOfExperience === 1 ? "year" : "years"}
                        </Text>
                      </View>
                    </View>
                  )}
                {profile.favoriteSpecies && (
                  <View>
                    <Text className="text-xs text-gray-400 mb-1">
                      Favorite Species
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Badge type="secondary">{profile.favoriteSpecies}</Badge>
                    </View>
                  </View>
                )}
                {profile.huntingPreferences &&
                  profile.huntingPreferences.length > 0 && (
                    <View>
                      <Text className="text-xs text-gray-400 mb-2">
                        Hunting Interests
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {profile.huntingPreferences.map((pref) => (
                          <Badge key={pref} type="default">
                            {pref}
                          </Badge>
                        ))}
                      </View>
                    </View>
                  )}
                {profile.weaponTypes && profile.weaponTypes.length > 0 && (
                  <View>
                    <Text className="text-xs text-gray-400 mb-2">
                      Weapon Types
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {profile.weaponTypes.map((weapon) => (
                        <Badge key={weapon} type="default">
                          {weapon}
                        </Badge>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Hobbies Card */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <View className="bg-gray-800 p-4 border border-gray-700 rounded-lg">
              <View>
                <View className="flex-row items-center gap-2">
                  <Heart size={16} color="#fff" />
                  <Text className="text-base font-semibold text-white">
                    Hobbies & Interests
                  </Text>
                </View>
              </View>
              <View className="mt-3">
                <View className="flex-row flex-wrap gap-2">
                  {profile.hobbies.map((hobby) => (
                    <Badge key={hobby} type="secondary">
                      {hobby}
                    </Badge>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Photo Gallery Card */}
          {profile.profilePhotos && profile.profilePhotos.length > 0 && (
            <View className="bg-gray-800 p-4 border border-gray-700 rounded-lg">
              <View>
                <Text className="text-base font-semibold text-white">
                  Photos
                </Text>
              </View>
              <View className="mt-3">
                <View className="flex-row flex-wrap gap-3">
                  {profile.profilePhotos.map((photo, idx) => (
                    <View
                      key={idx}
                      className="rounded-lg bg-gray-700 overflow-hidden"
                      style={{ width: "48%", aspectRatio: 1 }}
                    >
                      <Image
                        source={{ uri: photo }}
                        className="w-full h-full"
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
