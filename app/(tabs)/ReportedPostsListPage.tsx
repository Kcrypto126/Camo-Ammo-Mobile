import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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
  XCircle,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface ReportedPostsListPageProps {
  onBack: () => void;
}

export default function ReportedPostsListPage({
  onBack,
}: ReportedPostsListPageProps) {
  const reportedPosts = useQuery(api.forums.getReportedPosts);
  const approvePost = useMutation(api.forums.approvePost);
  const rejectPost = useMutation(api.forums.rejectPost);
  const hidePost = useMutation(api.forums.hidePost);
  const lockPost = useMutation(api.forums.lockPost);
  const dismissReport = useMutation(api.forums.dismissReport);
  const warnPost = useMutation(api.forums.warnPost);

  const [selectedPost, setSelectedPost] = useState<{
    postId: Id<"forumPosts">;
    reportId: Id<"forumReports">;
  } | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleHidePost = async (
    postId: Id<"forumPosts">,
    reportId: Id<"forumReports">
  ) => {
    try {
      setIsProcessing(true);
      await hidePost({ postId });
      await dismissReport({ reportId });
      showToast("Post hidden from public");
    } catch (error) {
      showToast("Failed to hide post");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLockPost = async (
    postId: Id<"forumPosts">,
    isLocked: boolean,
    reportId: Id<"forumReports">
  ) => {
    try {
      setIsProcessing(true);
      await lockPost({ postId, locked: !isLocked });
      await dismissReport({ reportId });
      showToast(isLocked ? "Post unlocked" : "Post locked");
    } catch (error) {
      showToast("Failed to lock/unlock post");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async (
    postId: Id<"forumPosts">,
    reportId: Id<"forumReports">
  ) => {
    try {
      setIsProcessing(true);
      await approvePost({ postId });
      await dismissReport({ reportId });
      showToast("Report dismissed, post remains visible");
    } catch (error) {
      showToast("Failed to approve post");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWarn = async (
    postId: Id<"forumPosts">,
    reportId: Id<"forumReports">
  ) => {
    try {
      setIsProcessing(true);
      const result = await warnPost({ postId });
      await dismissReport({ reportId });
      if (result.warningCount === 1) {
        showToast("First warning issued to user, report dismissed");
      } else {
        showToast(
          `Warning issued (${result.warningCount} total). User may be banned. Report dismissed.`
        );
      }
    } catch (error) {
      showToast("Failed to issue warning");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPost || !rejectionReason.trim()) {
      showToast("Please provide a reason for rejection");
      return;
    }

    try {
      setIsProcessing(true);
      await rejectPost({
        postId: selectedPost.postId,
        reason: rejectionReason.trim(),
      });
      await dismissReport({ reportId: selectedPost.reportId });
      showToast("Post rejected");
      setShowRejectDialog(false);
      setSelectedPost(null);
      setRejectionReason("");
    } catch (error) {
      showToast("Failed to reject post");
    } finally {
      setIsProcessing(false);
    }
  };

  const getReportReasonLabel = (reason: string) => {
    switch (reason) {
      case "spam":
        return "Spam";
      case "hate_speech":
        return "Hate Speech";
      case "violence":
        return "Violence";
      case "harassment":
        return "Harassment";
      default:
        return reason;
    }
  };

  const getReportReasonType = (reason: string): "default" | "destructive" => {
    switch (reason) {
      case "spam":
        return "default";
      case "hate_speech":
      case "violence":
      case "harassment":
        return "destructive";
      default:
        return "default";
    }
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
              Reported Forum Posts
            </Text>
            <Text className="text-xs text-gray-400">
              Review reports and take action
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          {reportedPosts === undefined ? (
            <View className="gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </View>
          ) : reportedPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <View className="items-center">
                  <AlertTriangle
                    size={48}
                    color="#9ca3af"
                    style={{ marginBottom: 12 }}
                  />
                  <Text className="text-sm text-gray-400 text-center">
                    No reported posts to review
                  </Text>
                </View>
              </CardContent>
            </Card>
          ) : (
            reportedPosts.map((report) => (
              <Card key={report._id} className="border-red-500/20">
                <CardContent className="p-4">
                  <View className="gap-3">
                    {/* Report Info */}
                    <View className="pb-2 border-b border-gray-700">
                      <Badge
                        type={getReportReasonType(report.reason)}
                        className="mb-2"
                      >
                        <Text className="text-xs text-white">
                          {getReportReasonLabel(report.reason)}
                        </Text>
                      </Badge>
                      <Text className="text-xs text-gray-400">
                        Reported by: {report.reporter?.name || "Unknown"} •{" "}
                        {format(new Date(report.createdAt), "MMM d, yyyy")}
                      </Text>
                      {report.description && (
                        <Text className="text-xs mt-1 italic text-gray-400">
                          "{report.description}"
                        </Text>
                      )}
                    </View>

                    {/* Post Info */}
                    {report.post && (
                      <>
                        <View>
                          <Text className="font-semibold text-sm text-white">
                            {report.post.title}
                          </Text>
                          <Text className="text-xs text-gray-400 mt-1">
                            By: {report.post.author?.name || "Unknown"} •{" "}
                            {format(
                              new Date(report.post.createdAt),
                              "MMM d, yyyy"
                            )}
                          </Text>
                        </View>

                        {/* Content */}
                        <Text
                          className="text-sm text-gray-300"
                          numberOfLines={3}
                        >
                          {report.post.content}
                        </Text>

                        {/* Status Badges */}
                        <View className="flex-row gap-2 flex-wrap">
                          {report.post.status && (
                            <Badge type="secondary" className="text-xs">
                              <Text className="text-xs text-white">
                                {report.post.status}
                              </Text>
                            </Badge>
                          )}
                          {report.post.isLocked && (
                            <Badge type="secondary" className="text-xs">
                              <View className="flex-row items-center gap-1">
                                <Lock size={12} color="#ffffff" />
                                <Text className="text-xs text-white">
                                  Locked
                                </Text>
                              </View>
                            </Badge>
                          )}
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row flex-wrap gap-2">
                          <Button
                            type="outline"
                            className="flex-1"
                            onPress={() =>
                              handleHidePost(report.post!._id, report._id)
                            }
                            disabled={isProcessing}
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
                            className="flex-1"
                            onPress={() =>
                              handleLockPost(
                                report.post!._id,
                                report.post!.isLocked || false,
                                report._id
                              )
                            }
                            disabled={isProcessing}
                          >
                            <View className="flex-row items-center">
                              <Lock
                                size={16}
                                color="#ffffff"
                                style={{ marginRight: 8 }}
                              />
                              <Text className="text-white">
                                {report.post.isLocked ? "Unlock" : "Lock"}
                              </Text>
                            </View>
                          </Button>
                          <Button
                            type="outline"
                            className="flex-1"
                            onPress={() =>
                              handleWarn(report.post!._id, report._id)
                            }
                            disabled={isProcessing}
                          >
                            <View className="flex-row items-center">
                              <AlertTriangle
                                size={16}
                                color="#ffffff"
                                style={{ marginRight: 8 }}
                              />
                              <Text className="text-white">Warn</Text>
                            </View>
                          </Button>
                          <Button
                            type="danger"
                            className="flex-1"
                            onPress={() => {
                              setSelectedPost({
                                postId: report.post!._id,
                                reportId: report._id,
                              });
                              setShowRejectDialog(true);
                            }}
                            disabled={isProcessing}
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
                          <Button
                            type="primary"
                            className="w-full"
                            onPress={() =>
                              handleApprove(report.post!._id, report._id)
                            }
                            disabled={isProcessing}
                          >
                            <View className="flex-row items-center">
                              <CheckCircle2
                                size={16}
                                color="#ffffff"
                                style={{ marginRight: 8 }}
                              />
                              <Text className="text-white">Dismiss Report</Text>
                            </View>
                          </Button>
                        </View>
                      </>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))
          )}
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
              Provide a reason for rejecting this post. The author will be
              notified.
            </Text>
          </View>
          <View className="gap-2">
            <Label>Rejection Reason *</Label>
            <Textarea
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Explain why this post is being removed..."
              className="min-h-24"
            />
          </View>
          <View className="flex-row gap-2 justify-end">
            <Button type="outline" onPress={() => setShowRejectDialog(false)}>
              <Text className="text-white">Cancel</Text>
            </Button>
            <Button
              type="danger"
              onPress={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Text className="text-red-400">Reject Post</Text>
              )}
            </Button>
          </View>
        </View>
      </Dialog>
    </View>
  );
}
