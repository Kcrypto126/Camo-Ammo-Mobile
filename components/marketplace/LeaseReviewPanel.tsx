import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/Empty";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  Calendar,
  CheckCircle,
  Clock,
  LandPlot,
  MapPin,
  XCircle,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface LeaseReviewPanelProps {
  onLeaseClick: (leaseId: Id<"landLeases">) => void;
}

export default function LeaseReviewPanel({
  onLeaseClick,
}: LeaseReviewPanelProps) {
  const pendingLeases = useQuery(api.landLeases.getPendingLeases, {});
  const reviewLease = useMutation(api.landLeases.reviewLease);

  const [selectedLease, setSelectedLease] = useState<Id<"landLeases"> | null>(
    null
  );
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewClick = (
    leaseId: Id<"landLeases">,
    action: "approve" | "reject"
  ) => {
    setSelectedLease(leaseId);
    setReviewAction(action);
    setRejectionReason("");
  };

  const handleSubmitReview = async () => {
    if (!selectedLease || !reviewAction) return;

    if (reviewAction === "reject" && !rejectionReason.trim()) {
      showToast("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewLease({
        leaseId: selectedLease,
        action: reviewAction,
        rejectionReason:
          reviewAction === "reject" ? rejectionReason : undefined,
      });

      showToast(
        reviewAction === "approve"
          ? "Lease approved successfully"
          : "Lease rejected"
      );
      setSelectedLease(null);
      setReviewAction(null);
      setRejectionReason("");
    } catch (error) {
      showToast("Failed to review lease");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingLeases === undefined) {
    return (
      <View className="gap-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-gray-900">
        <View className="border-b border-gray-700 bg-gray-800 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-semibold text-white">
                Review Land Leases
              </Text>
              <Text className="text-sm text-gray-400">
                {pendingLeases.length} pending approval
              </Text>
            </View>
            <Badge type="secondary" className="flex-row items-center gap-1">
              <Clock size={12} color="#ffffff" />
              <Text className="text-white">Admin Review</Text>
            </Badge>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        >
          {pendingLeases.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCircle size={48} color="#9ca3af" />
                </EmptyMedia>
                <EmptyTitle>All caught up!</EmptyTitle>
                <EmptyDescription>
                  No leases pending review at the moment
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <View className="gap-4">
              {pendingLeases.map((lease) => (
                <Card key={lease._id}>
                  <CardHeader className="pb-3">
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <CardTitle className="text-white">
                          {lease.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex-row items-center gap-1">
                          <MapPin size={12} color="#9ca3af" />
                          <Text className="text-xs text-gray-400">
                            {lease.state} • {lease.county} County
                          </Text>
                        </CardDescription>
                        <Text className="mt-1 text-xs text-gray-400">
                          Posted by: {lease.ownerName}
                        </Text>
                      </View>
                      <Badge type="default">
                        <Text className="text-white">Pending</Text>
                      </Badge>
                    </View>
                  </CardHeader>
                  <CardContent className="gap-3">
                    <Text className="text-sm text-gray-400" numberOfLines={3}>
                      {lease.description}
                    </Text>

                    <View className="flex-row flex-wrap gap-3">
                      <View className="flex-row items-center gap-1">
                        <LandPlot size={16} color="#9ca3af" />
                        <Text className="text-sm text-gray-400">
                          {lease.acreage} acres
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Calendar size={16} color="#9ca3af" />
                        <Text className="text-sm capitalize text-gray-400">
                          {lease.leaseTerm}
                        </Text>
                      </View>
                      <Text className="font-semibold text-white">
                        $
                        {(
                          lease.price ||
                          lease.pricePerYear ||
                          0
                        ).toLocaleString()}
                        /year
                      </Text>
                    </View>

                    <View className="flex-row flex-wrap gap-1">
                      {(lease.gameTypes || []).slice(0, 4).map((game) => (
                        <View
                          key={game}
                          className="rounded-full bg-[#ff6800]/10 px-2 py-0.5"
                        >
                          <Text className="text-xs font-medium capitalize text-[#ff6800]">
                            {game}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View className="flex-row gap-2 pt-2">
                      <Button
                        type="outline"
                        className="flex-1"
                        onPress={() => onLeaseClick(lease._id)}
                      >
                        <Text className="text-white">View Details</Text>
                      </Button>
                      <Button
                        className="flex-row items-center gap-1"
                        onPress={() => handleReviewClick(lease._id, "approve")}
                      >
                        <CheckCircle size={16} color="#ffffff" />
                        <Text className="text-white">Approve</Text>
                      </Button>
                      <Button
                        type="danger"
                        className="flex-row items-center gap-1"
                        onPress={() => handleReviewClick(lease._id, "reject")}
                      >
                        <XCircle size={16} color="#ffffff" />
                        <Text className="text-white">Reject</Text>
                      </Button>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Review Dialog */}
      <Dialog
        visible={selectedLease !== null}
        onClose={() => {
          setSelectedLease(null);
          setReviewAction(null);
          setRejectionReason("");
        }}
      >
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-xl font-bold text-white">
              {reviewAction === "approve" ? "Approve" : "Reject"} Lease
            </Text>
            <Text className="text-sm text-gray-400">
              {reviewAction === "approve"
                ? "This lease will be published to the marketplace."
                : "Please provide a reason for rejecting this lease."}
            </Text>
          </View>

          {reviewAction === "reject" && (
            <View className="gap-2 py-4">
              <Label>Rejection Reason *</Label>
              <Textarea
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChangeText={setRejectionReason}
                className="min-h-32"
              />
            </View>
          )}

          <View className="flex-row gap-3 mt-4">
            <Button
              type="outline"
              onPress={() => {
                setSelectedLease(null);
                setReviewAction(null);
                setRejectionReason("");
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              <Text className="text-white">Cancel</Text>
            </Button>
            <Button
              type={reviewAction === "approve" ? "primary" : "danger"}
              onPress={handleSubmitReview}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white">
                  {reviewAction === "approve" ? "Approve" : "Reject"}
                </Text>
              )}
            </Button>
          </View>
        </View>
      </Dialog>
    </>
  );
}
