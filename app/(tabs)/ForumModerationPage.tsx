import { ActiveViewers } from "@/components/ui/ActiveViewers";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  EyeOff,
  Lock,
  Unlock,
  XCircle,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface ForumModerationPageProps {
  onBack: () => void;
}

export default function ForumModerationPage({
  onBack,
}: ForumModerationPageProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<Id<"forumPosts"> | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingPosts = useQuery(api.forums.getPendingPosts);
  const reportedPosts = useQuery(api.forums.getReportedPosts);

  const approvePost = useMutation(api.forums.approvePost);
  const rejectPost = useMutation(api.forums.rejectPost);
  const hidePost = useMutation(api.forums.hidePost);
  const lockPost = useMutation(api.forums.lockPost);
  const dismissReport = useMutation(api.forums.dismissReport);

  const handleApprove = async (postId: Id<"forumPosts">) => {
    try {
      await approvePost({ postId });
      showToast("Post approved");
    } catch (error) {
      showToast("Failed to approve post");
      console.error(error);
    }
  };

  const handleRejectClick = (postId: Id<"forumPosts">) => {
    setSelectedPostId(postId);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedPostId || !rejectionReason.trim()) {
      showToast("Please provide a rejection reason");
      return;
    }

    try {
      await rejectPost({ postId: selectedPostId, reason: rejectionReason });
      showToast("Post rejected");
      setShowRejectDialog(false);
      setSelectedPostId(null);
      setRejectionReason("");
    } catch (error) {
      showToast("Failed to reject post");
      console.error(error);
    }
  };

  const handleHide = async (postId: Id<"forumPosts">) => {
    try {
      await hidePost({ postId });
      showToast("Post hidden");
    } catch (error) {
      showToast("Failed to hide post");
      console.error(error);
    }
  };

  const handleLock = async (postId: Id<"forumPosts">, locked: boolean) => {
    try {
      await lockPost({ postId, locked });
      showToast(locked ? "Post locked" : "Post unlocked");
    } catch (error) {
      showToast(`Failed to ${locked ? "lock" : "unlock"} post`);
      console.error(error);
    }
  };

  const handleDismissReport = async (reportId: Id<"forumReports">) => {
    try {
      await dismissReport({ reportId });
      showToast("Report dismissed");
    } catch (error) {
      showToast("Failed to dismiss report");
      console.error(error);
    }
  };

  const getReasonBadgeType = (
    reason: string
  ): "default" | "destructive" | "secondary" => {
    switch (reason) {
      case "spam":
        return "secondary";
      case "hate_speech":
      case "violence":
      case "harassment":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatReason = (reason: string) => {
    return reason
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
            <ArrowLeft size={16} color="#ffffff" />
          </Button>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">
              Forum Moderation
            </Text>
            <Text className="text-xs text-gray-400">
              Review and moderate forum posts
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          {/* Pending Posts */}
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <AlertTriangle size={20} color="#f59e0b" />
                  <CardTitle className="text-base">Pending Approval</CardTitle>
                </View>
                {pendingPosts && pendingPosts.length > 0 && (
                  <Badge type="secondary" className="text-xs">
                    {pendingPosts.length}
                  </Badge>
                )}
              </View>
            </CardHeader>
            <CardContent>
              {pendingPosts === undefined ? (
                <View className="gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </View>
              ) : pendingPosts.length === 0 ? (
                <View className="py-12">
                  <Text className="text-center text-sm text-gray-400">
                    No pending posts
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {pendingPosts.map((post) => (
                    <Card key={post._id} className="border-amber-500/20">
                      <CardContent className="p-4">
                        <View className="gap-3">
                          <View>
                            <View className="flex-row items-start justify-between">
                              <View className="flex-1">
                                <Text className="font-semibold text-white">
                                  {post.title}
                                </Text>
                                <Text className="mt-1 text-sm text-gray-400">
                                  by {post.author?.name || "Unknown"}
                                </Text>
                              </View>
                              <Badge type="secondary" className="text-xs">
                                {post.category || "general"}
                              </Badge>
                            </View>
                            <ActiveViewers
                              entityType="forumPost"
                              entityId={post._id}
                            />
                            <Text className="mt-2 text-sm" numberOfLines={3}>
                              {post.content}
                            </Text>
                            <Text className="mt-2 text-xs text-gray-400">
                              Posted{" "}
                              {format(
                                new Date(post.createdAt),
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </Text>
                          </View>
                          <View className="flex-row gap-2">
                            <Button
                              type="primary"
                              className="flex-1"
                              onPress={() => handleApprove(post._id)}
                            >
                              <View className="flex-row items-center">
                                <CheckCircle2
                                  size={16}
                                  color="#ffffff"
                                  style={{ marginRight: 8 }}
                                />
                                <Text className="text-white">Approve</Text>
                              </View>
                            </Button>
                            <Button
                              type="danger"
                              className="flex-1"
                              onPress={() => handleRejectClick(post._id)}
                            >
                              <View className="flex-row items-center">
                                <XCircle
                                  size={16}
                                  color="#ef4444"
                                  style={{ marginRight: 8 }}
                                />
                                <Text className="text-red-400">Reject</Text>
                              </View>
                            </Button>
                          </View>
                        </View>
                      </CardContent>
                    </Card>
                  ))}
                </View>
              )}
            </CardContent>
          </Card>

          {/* Reported Posts */}
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <AlertTriangle size={20} color="#ef4444" />
                  <CardTitle className="text-base">Reported Posts</CardTitle>
                </View>
                {reportedPosts && reportedPosts.length > 0 && (
                  <Badge type="destructive" className="text-xs">
                    {reportedPosts.length}
                  </Badge>
                )}
              </View>
            </CardHeader>
            <CardContent>
              {reportedPosts === undefined ? (
                <View className="gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </View>
              ) : reportedPosts.length === 0 ? (
                <View className="py-12">
                  <Text className="text-center text-sm text-gray-400">
                    No reported posts
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {reportedPosts.map((report) => (
                    <Card key={report._id} className="border-red-500/20">
                      <CardContent className="p-4">
                        <View className="gap-3">
                          <View>
                            <View className="flex-row items-start justify-between">
                              <View className="flex-1">
                                <Badge
                                  type={getReasonBadgeType(report.reason)}
                                  className="mb-2"
                                >
                                  <Text className="text-xs text-white">
                                    {formatReason(report.reason)}
                                  </Text>
                                </Badge>
                                <Text className="font-semibold text-white">
                                  {report.post?.title || "Deleted Post"}
                                </Text>
                                <Text className="mt-1 text-sm text-gray-400">
                                  by {report.post?.author?.name || "Unknown"}
                                </Text>
                              </View>
                            </View>
                            {report.post && (
                              <ActiveViewers
                                entityType="forumPost"
                                entityId={report.post._id}
                              />
                            )}
                            {report.post && (
                              <Text className="mt-2 text-sm" numberOfLines={3}>
                                {report.post.content}
                              </Text>
                            )}
                            <View className="mt-2">
                              <Text className="text-xs text-gray-400">
                                Reported by {report.reporter?.name || "Unknown"}
                              </Text>
                              <Text className="text-xs text-gray-400">
                                on{" "}
                                {format(
                                  new Date(report.createdAt),
                                  "MMM d, yyyy 'at' h:mm a"
                                )}
                              </Text>
                              {report.description && (
                                <Text className="mt-1 text-xs italic text-gray-400">
                                  "{report.description}"
                                </Text>
                              )}
                            </View>
                          </View>
                          {report.post && (
                            <View className="flex-row flex-wrap gap-2">
                              <Button
                                type="outline"
                                onPress={() => handleHide(report.post!._id)}
                              >
                                <View className="flex-row items-center">
                                  <EyeOff
                                    size={16}
                                    color="#ffffff"
                                    style={{ marginRight: 8 }}
                                  />
                                  <Text className="text-white">Hide</Text>
                                </View>
                              </Button>
                              <Button
                                type="outline"
                                onPress={() =>
                                  handleLock(
                                    report.post!._id,
                                    !report.post!.isLocked
                                  )
                                }
                              >
                                <View className="flex-row items-center">
                                  {report.post.isLocked ? (
                                    <Unlock
                                      size={16}
                                      color="#ffffff"
                                      style={{ marginRight: 8 }}
                                    />
                                  ) : (
                                    <Lock
                                      size={16}
                                      color="#ffffff"
                                      style={{ marginRight: 8 }}
                                    />
                                  )}
                                  <Text className="text-white">
                                    {report.post.isLocked ? "Unlock" : "Lock"}
                                  </Text>
                                </View>
                              </Button>
                              <Button
                                type="ghost"
                                onPress={() => handleDismissReport(report._id)}
                              >
                                <Text className="text-white">
                                  Dismiss Report
                                </Text>
                              </Button>
                            </View>
                          )}
                        </View>
                      </CardContent>
                    </Card>
                  ))}
                </View>
              )}
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      {/* Reject Dialog */}
      <Dialog
        visible={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
      >
        <View className="gap-4">
          <View>
            <Text className="text-lg font-bold text-white">Reject Post</Text>
            <Text className="text-sm text-gray-400 mt-2">
              Please provide a reason for rejecting this post. The author will
              be notified.
            </Text>
          </View>
          <View className="gap-2">
            <Label>Rejection Reason *</Label>
            <Textarea
              placeholder="Explain why this post was rejected..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              className="min-h-24"
            />
          </View>
          <View className="flex-row gap-2 justify-end">
            <Button
              type="outline"
              onPress={() => {
                setShowRejectDialog(false);
                setSelectedPostId(null);
                setRejectionReason("");
              }}
            >
              <Text className="text-white">Cancel</Text>
            </Button>
            <Button type="danger" onPress={handleRejectConfirm}>
              <Text className="text-red-400">Reject Post</Text>
            </Button>
          </View>
        </View>
      </Dialog>
    </View>
  );
}
