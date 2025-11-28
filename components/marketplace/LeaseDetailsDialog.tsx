import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Separator } from "@/components/ui/Separator";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  LandPlot,
  Mail,
  MapPin,
  Phone,
  Trees,
  Users,
  Waves,
} from "lucide-react-native";
import { useEffect } from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LeaseDetailsDialogProps {
  leaseId: Id<"landLeases"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInquire: (leaseId: Id<"landLeases">) => void;
}

export default function LeaseDetailsDialog({
  leaseId,
  open,
  onOpenChange,
  onInquire,
}: LeaseDetailsDialogProps) {
  const lease = useQuery(
    api.landLeases.getLeaseById,
    leaseId ? { leaseId } : "skip"
  );
  const incrementView = useMutation(api.landLeases.incrementLeaseView);

  useEffect(() => {
    if (open && leaseId) {
      incrementView({ leaseId }).catch(console.error);
    }
  }, [open, leaseId, incrementView]);

  if (!leaseId) return null;

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <ScrollView className="max-h-[90vh]">
        {lease === undefined ? (
          <View className="gap-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </View>
        ) : (
          <View className="gap-4">
            <View className="gap-1">
              <Text className="text-2xl font-bold text-white">
                {lease.title}
              </Text>
              <View className="flex-row items-center gap-1">
                <MapPin size={16} color="#9ca3af" />
                <Text className="text-base text-gray-400">
                  {lease.county} County, {lease.state}
                  {lease.address && ` • ${lease.address}`}
                </Text>
              </View>
            </View>

            {/* Pricing */}
            <View className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-3xl font-bold text-white">
                    ${(lease.price || lease.pricePerYear || 0).toLocaleString()}
                  </Text>
                  <Text className="text-sm text-gray-400">per year</Text>
                  {lease.pricePerSeason && (
                    <Text className="mt-1 text-sm text-white">
                      ${lease.pricePerSeason.toLocaleString()} per season
                    </Text>
                  )}
                  {lease.pricePerDay && (
                    <Text className="mt-1 text-sm text-white">
                      ${lease.pricePerDay.toLocaleString()} per day
                    </Text>
                  )}
                </View>
                <Button onPress={() => onInquire(lease._id)}>
                  <Text className="text-white">Send Inquiry</Text>
                </Button>
              </View>
            </View>

            {/* Description */}
            <View>
              <Text className="mb-2 font-semibold text-white">Description</Text>
              <Text className="text-sm text-gray-400">{lease.description}</Text>
            </View>

            <Separator />

            {/* Key Details */}
            <View className="flex-row flex-wrap gap-4">
              <View className="flex-row items-center gap-3">
                <LandPlot size={20} color="#9ca3af" />
                <View>
                  <Text className="text-sm text-gray-400">Acreage</Text>
                  <Text className="font-semibold text-white">
                    {lease.acreage} acres
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <Calendar size={20} color="#9ca3af" />
                <View>
                  <Text className="text-sm text-gray-400">Lease Term</Text>
                  <Text className="font-semibold capitalize text-white">
                    {lease.leaseTerm}
                  </Text>
                </View>
              </View>

              {lease.maxHunters && (
                <View className="flex-row items-center gap-3">
                  <Users size={20} color="#9ca3af" />
                  <View>
                    <Text className="text-sm text-gray-400">Max Hunters</Text>
                    <Text className="font-semibold text-white">
                      {lease.maxHunters}
                    </Text>
                  </View>
                </View>
              )}

              <View className="flex-row items-center gap-3">
                <CheckCircle2 size={20} color="#9ca3af" />
                <View>
                  <Text className="text-sm text-gray-400">Access</Text>
                  <Text className="font-semibold text-white">
                    {lease.exclusiveAccess ? "Exclusive" : "Shared"}
                  </Text>
                </View>
              </View>
            </View>

            <Separator />

            {/* Availability */}
            {lease.availableFrom && lease.availableTo && (
              <View>
                <Text className="mb-2 font-semibold text-white">
                  Availability
                </Text>
                <Text className="text-sm text-gray-400">
                  {new Date(lease.availableFrom).toLocaleDateString()} -{" "}
                  {new Date(lease.availableTo).toLocaleDateString()}
                </Text>
              </View>
            )}

            {/* Game Types */}
            {lease.gameTypes && lease.gameTypes.length > 0 && (
              <View>
                <Text className="mb-2 font-semibold text-white">
                  Available Game
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {lease.gameTypes.map((game) => (
                    <Badge key={game} type="secondary" className="capitalize">
                      {game}
                    </Badge>
                  ))}
                </View>
              </View>
            )}

            {/* Activities */}
            {lease.allowedActivities && lease.allowedActivities.length > 0 && (
              <View>
                <Text className="mb-2 font-semibold text-white">
                  Allowed Activities
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {lease.allowedActivities.map((activity) => (
                    <Badge key={activity} type="default" className="capitalize">
                      {activity.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </View>
              </View>
            )}

            {/* Amenities */}
            {lease.amenities.length > 0 && (
              <View>
                <Text className="mb-2 font-semibold text-white">Amenities</Text>
                <View className="flex-row flex-wrap gap-2">
                  {lease.amenities.map((amenity) => (
                    <View key={amenity} className="flex-row items-center gap-2">
                      <CheckCircle2 size={16} color="#ff6800" />
                      <Text className="text-sm capitalize text-white">
                        {amenity.replace(/_/g, " ")}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Terrain */}
            {lease.terrain && (
              <View>
                <View className="mb-2 flex-row items-center gap-2">
                  <Trees size={20} color="#ffffff" />
                  <Text className="font-semibold text-white">Terrain</Text>
                </View>
                <Text className="text-sm capitalize text-gray-400">
                  {lease.terrain}
                </Text>
              </View>
            )}

            {/* Water Sources */}
            {lease.waterSources && lease.waterSources.length > 0 && (
              <View>
                <View className="mb-2 flex-row items-center gap-2">
                  <Waves size={20} color="#ffffff" />
                  <Text className="font-semibold text-white">
                    Water Sources
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {lease.waterSources.map((water) => (
                    <Badge key={water} type="secondary" className="capitalize">
                      {water.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </View>
              </View>
            )}

            {/* Rules */}
            {lease.rules && (
              <View className="rounded-lg border border-orange-700 bg-orange-950/20 p-4">
                <View className="mb-2 flex-row items-center gap-2">
                  <AlertCircle size={20} color="#ff6800" />
                  <Text className="font-semibold text-orange-300">
                    Rules & Restrictions
                  </Text>
                </View>
                <Text className="text-sm text-orange-400">{lease.rules}</Text>
              </View>
            )}

            <Separator />

            {/* Contact */}
            <View>
              <Text className="mb-3 font-semibold text-white">
                Contact Landowner
              </Text>
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-gray-400">Owner:</Text>
                  <Text className="text-sm font-medium text-white">
                    {lease.ownerName}
                  </Text>
                </View>
                {lease.contactPhone && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${lease.contactPhone}`)}
                    className="flex-row items-center gap-2"
                  >
                    <Phone size={16} color="#9ca3af" />
                    <Text className="text-sm text-[#ff6800] underline">
                      {lease.contactPhone}
                    </Text>
                  </TouchableOpacity>
                )}
                {lease.contactEmail && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`mailto:${lease.contactEmail}`)
                    }
                    className="flex-row items-center gap-2"
                  >
                    <Mail size={16} color="#9ca3af" />
                    <Text className="text-sm text-[#ff6800] underline">
                      {lease.contactEmail}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <Button
                className="mt-4 w-full"
                onPress={() => onInquire(lease._id)}
              >
                <Text className="text-white">Send Inquiry</Text>
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </Dialog>
  );
}
