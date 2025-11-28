import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/Empty";
import { Separator } from "@/components/ui/Separator";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  Check,
  DollarSign,
  Eye,
  LandPlot,
  MapPin,
  MessageSquare,
  Send,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface MyLeasesPanelProps {
  onCreateLease: () => void;
}

export default function MyLeasesPanel({ onCreateLease }: MyLeasesPanelProps) {
  const myLeases = useQuery(api.landLeases.getMyLeases);
  const myInquiries = useQuery(api.landLeases.getMyInquiries);
  const mySentInquiries = useQuery(api.landLeases.getMySentInquiries);
  const updateLeaseStatus = useMutation(api.landLeases.updateLeaseStatus);
  const deleteLease = useMutation(api.landLeases.deleteLease);
  const respondToInquiry = useMutation(api.landLeases.respondToInquiry);

  const [activeTab, setActiveTab] = useState<"listings" | "inquiries" | "sent">(
    "listings"
  );
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  const handleStatusChange = async (leaseId: string, status: string) => {
    try {
      await updateLeaseStatus({ leaseId: leaseId as never, status });
      showToast("Lease status updated");
    } catch (error) {
      console.error(error);
      showToast("Failed to update status");
    }
  };

  const handleDelete = async (leaseId: string) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLease({ leaseId: leaseId as never });
              showToast("Lease deleted");
            } catch (error) {
              console.error(error);
              showToast("Failed to delete lease");
            }
          },
        },
      ]
    );
  };

  const handleRespond = async (
    inquiryId: string,
    status: "responded" | "accepted" | "declined"
  ) => {
    const response = responseText[inquiryId] || "";
    if (!response.trim()) {
      showToast("Please enter a response");
      return;
    }

    try {
      await respondToInquiry({
        inquiryId: inquiryId as never,
        response,
        status,
      });
      showToast("Response sent");
      setResponseText((prev) => {
        const updated = { ...prev };
        delete updated[inquiryId];
        return updated;
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to send response");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "listings":
        return (
          <>
            {myLeases === undefined ? (
              <View className="gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </View>
            ) : myLeases.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <LandPlot size={48} color="#9ca3af" />
                  </EmptyMedia>
                  <EmptyTitle>No listings yet</EmptyTitle>
                  <EmptyDescription>
                    Create your first lease listing to start earning from your
                    land
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onPress={onCreateLease}>
                    <Text className="text-white">List Property</Text>
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <View className="gap-4">
                {myLeases.map((lease) => (
                  <Card key={lease._id}>
                    <CardHeader>
                      <View className="flex-row items-start justify-between">
                        <View>
                          <CardTitle className="text-white">
                            {lease.title}
                          </CardTitle>
                          <CardDescription className="mt-1 flex-row items-center gap-1">
                            <MapPin size={12} color="#9ca3af" />
                            <Text className="text-xs text-gray-400">
                              {lease.county}, {lease.state}
                            </Text>
                          </CardDescription>
                        </View>
                        <Badge
                          type={
                            lease.status === "approved"
                              ? "default"
                              : lease.status === "pending"
                                ? "secondary"
                                : lease.status === "rejected"
                                  ? "destructive"
                                  : "default"
                          }
                          className="capitalize"
                        >
                          {lease.status}
                        </Badge>
                      </View>
                    </CardHeader>
                    <CardContent className="gap-3">
                      <View className="flex-row flex-wrap gap-4">
                        <View className="flex-row items-center gap-1">
                          <LandPlot size={16} color="#9ca3af" />
                          <Text className="text-sm text-gray-400">
                            {lease.acreage} acres
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <DollarSign size={16} color="#9ca3af" />
                          <Text className="text-sm text-gray-400">
                            $
                            {(
                              lease.price ||
                              lease.pricePerYear ||
                              0
                            ).toLocaleString()}
                            /yr
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Eye size={16} color="#9ca3af" />
                          <Text className="text-sm text-gray-400">
                            {lease.views} views
                          </Text>
                        </View>
                      </View>

                      <Separator />

                      {lease.status === "rejected" && lease.rejectionReason && (
                        <View className="rounded-md border border-red-700 bg-red-950/20 p-3">
                          <Text className="text-sm font-medium text-red-500">
                            Rejected
                          </Text>
                          <Text className="mt-1 text-sm text-gray-400">
                            {lease.rejectionReason}
                          </Text>
                        </View>
                      )}

                      {lease.status === "pending" && (
                        <View className="rounded-md border border-yellow-700 bg-yellow-950/20 p-3">
                          <Text className="text-sm font-medium text-yellow-500">
                            Pending Admin Approval
                          </Text>
                          <Text className="mt-1 text-sm text-gray-400">
                            Your listing is being reviewed by our team.
                          </Text>
                        </View>
                      )}

                      <View className="flex-row flex-wrap gap-2">
                        {lease.status === "approved" && (
                          <Button
                            type="outline"
                            onPress={() =>
                              handleStatusChange(lease._id, "inactive")
                            }
                          >
                            <Text className="text-white">Mark Inactive</Text>
                          </Button>
                        )}
                        {lease.status === "inactive" && (
                          <Button
                            type="outline"
                            onPress={() =>
                              handleStatusChange(lease._id, "approved")
                            }
                          >
                            <Text className="text-white">Mark Active</Text>
                          </Button>
                        )}
                        {lease.status === "approved" && (
                          <Button
                            type="outline"
                            onPress={() =>
                              handleStatusChange(lease._id, "leased")
                            }
                          >
                            <Text className="text-white">Mark as Leased</Text>
                          </Button>
                        )}
                        <Button
                          type="danger"
                          onPress={() => handleDelete(lease._id)}
                        >
                          <Text className="text-white">Delete</Text>
                        </Button>
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}
          </>
        );

      case "inquiries":
        return (
          <>
            {myInquiries === undefined ? (
              <View className="gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </View>
            ) : myInquiries.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageSquare size={48} color="#9ca3af" />
                  </EmptyMedia>
                  <EmptyTitle>No inquiries yet</EmptyTitle>
                  <EmptyDescription>
                    When hunters inquire about your properties, they will appear
                    here
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <View className="gap-4">
                {myInquiries.map((inquiry) => (
                  <Card key={inquiry._id}>
                    <CardHeader>
                      <View className="flex-row items-start justify-between">
                        <View>
                          <CardTitle className="text-lg text-white">
                            {inquiry.leaseTitle}
                          </CardTitle>
                          <CardDescription>
                            <Text className="text-sm text-gray-400">
                              From: {inquiry.senderName} •{" "}
                              {format(inquiry.createdAt, "MMM d, yyyy")}
                            </Text>
                          </CardDescription>
                        </View>
                        <Badge
                          type={
                            inquiry.status === "pending"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {inquiry.status}
                        </Badge>
                      </View>
                    </CardHeader>
                    <CardContent className="gap-3">
                      <View>
                        <Text className="text-sm font-medium text-white">
                          Message:
                        </Text>
                        <Text className="mt-1 text-sm text-gray-400">
                          {inquiry.message}
                        </Text>
                      </View>

                      {inquiry.contactInfo && (
                        <View>
                          <Text className="text-sm font-medium text-white">
                            Contact:
                          </Text>
                          <Text className="mt-1 text-sm text-gray-400">
                            {inquiry.contactInfo}
                          </Text>
                        </View>
                      )}

                      {(inquiry.startDate || inquiry.endDate) && (
                        <View>
                          <Text className="text-sm font-medium text-white">
                            Desired Dates:
                          </Text>
                          <Text className="mt-1 text-sm text-gray-400">
                            {inquiry.startDate &&
                              format(inquiry.startDate, "MMM d, yyyy")}{" "}
                            -{" "}
                            {inquiry.endDate &&
                              format(inquiry.endDate, "MMM d, yyyy")}
                          </Text>
                        </View>
                      )}

                      {inquiry.numberOfHunters && (
                        <View>
                          <Text className="text-sm font-medium text-white">
                            Number of Hunters:
                          </Text>
                          <Text className="mt-1 text-sm text-gray-400">
                            {inquiry.numberOfHunters}
                          </Text>
                        </View>
                      )}

                      {inquiry.status === "pending" && (
                        <>
                          <Separator />
                          <View className="gap-2">
                            <Text className="text-sm font-medium text-white">
                              Your Response:
                            </Text>
                            <Textarea
                              placeholder="Write your response..."
                              value={responseText[inquiry._id] || ""}
                              onChangeText={(text) =>
                                setResponseText((prev) => ({
                                  ...prev,
                                  [inquiry._id]: text,
                                }))
                              }
                              className="min-h-24"
                            />
                            <View className="flex-row gap-2">
                              <Button
                                onPress={() =>
                                  handleRespond(inquiry._id, "accepted")
                                }
                              >
                                <View className="flex-row items-center gap-1">
                                  <Check size={16} color="#ffffff" />
                                  <Text className="text-white">Accept</Text>
                                </View>
                              </Button>
                              <Button
                                type="outline"
                                onPress={() =>
                                  handleRespond(inquiry._id, "responded")
                                }
                              >
                                <View className="flex-row items-center gap-1">
                                  <Send size={16} color="#ffffff" />
                                  <Text className="text-white">Respond</Text>
                                </View>
                              </Button>
                              <Button
                                type="danger"
                                onPress={() =>
                                  handleRespond(inquiry._id, "declined")
                                }
                              >
                                <View className="flex-row items-center gap-1">
                                  <X size={16} color="#ffffff" />
                                  <Text className="text-white">Decline</Text>
                                </View>
                              </Button>
                            </View>
                          </View>
                        </>
                      )}

                      {inquiry.response && (
                        <>
                          <Separator />
                          <View>
                            <Text className="text-sm font-medium text-white">
                              Your Response:
                            </Text>
                            <Text className="mt-1 text-sm text-gray-400">
                              {inquiry.response}
                            </Text>
                            <Text className="mt-1 text-xs text-gray-400">
                              {inquiry.respondedAt &&
                                `Sent ${format(inquiry.respondedAt, "MMM d, yyyy h:mm a")}`}
                            </Text>
                          </View>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}
          </>
        );

      case "sent":
        return (
          <>
            {mySentInquiries === undefined ? (
              <View className="gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </View>
            ) : mySentInquiries.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageSquare size={48} color="#9ca3af" />
                  </EmptyMedia>
                  <EmptyTitle>No inquiries sent</EmptyTitle>
                  <EmptyDescription>
                    Your inquiries to landowners will appear here
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <View className="gap-4">
                {mySentInquiries.map((inquiry) => (
                  <Card key={inquiry._id}>
                    <CardHeader>
                      <View className="flex-row items-start justify-between">
                        <View>
                          <CardTitle className="text-lg text-white">
                            {inquiry.leaseTitle}
                          </CardTitle>
                          <CardDescription>
                            <Text className="text-sm text-gray-400">
                              To: {inquiry.ownerName} •{" "}
                              {format(inquiry.createdAt, "MMM d, yyyy")}
                            </Text>
                          </CardDescription>
                        </View>
                        <Badge
                          type={
                            inquiry.status === "pending"
                              ? "secondary"
                              : "default"
                          }
                          className="capitalize"
                        >
                          {inquiry.status}
                        </Badge>
                      </View>
                    </CardHeader>
                    <CardContent className="gap-3">
                      <View>
                        <Text className="text-sm font-medium text-white">
                          Your Message:
                        </Text>
                        <Text className="mt-1 text-sm text-gray-400">
                          {inquiry.message}
                        </Text>
                      </View>

                      {inquiry.response && (
                        <>
                          <Separator />
                          <View>
                            <Text className="text-sm font-medium text-white">
                              Response from {inquiry.ownerName}:
                            </Text>
                            <Text className="mt-1 text-sm text-gray-400">
                              {inquiry.response}
                            </Text>
                            <Text className="mt-1 text-xs text-gray-400">
                              {inquiry.respondedAt &&
                                `Received ${format(inquiry.respondedAt, "MMM d, yyyy h:mm a")}`}
                            </Text>
                          </View>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}
          </>
        );
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      <View className="border-b border-gray-700 bg-gray-800 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-white">My Leases</Text>
          <Button onPress={onCreateLease}>
            <Text className="text-white">List Property</Text>
          </Button>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-700 bg-gray-800">
        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "listings" ? "border-[#ff6800]" : "border-transparent"
          }`}
          onPress={() => setActiveTab("listings")}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-sm font-semibold ${
                activeTab === "listings" ? "text-[#ff6800]" : "text-gray-400"
              }`}
            >
              My Listings
            </Text>
            {myLeases && myLeases.length > 0 && (
              <Badge type="secondary">{myLeases.length}</Badge>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "inquiries"
              ? "border-[#ff6800]"
              : "border-transparent"
          }`}
          onPress={() => setActiveTab("inquiries")}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-sm font-semibold ${
                activeTab === "inquiries" ? "text-[#ff6800]" : "text-gray-400"
              }`}
            >
              Inquiries
            </Text>
            {myInquiries &&
              myInquiries.filter((i) => i.status === "pending").length > 0 && (
                <Badge type="default">
                  {myInquiries.filter((i) => i.status === "pending").length}
                </Badge>
              )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "sent" ? "border-[#ff6800]" : "border-transparent"
          }`}
          onPress={() => setActiveTab("sent")}
        >
          <Text
            className={`text-sm font-semibold ${
              activeTab === "sent" ? "text-[#ff6800]" : "text-gray-400"
            }`}
          >
            Sent
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
