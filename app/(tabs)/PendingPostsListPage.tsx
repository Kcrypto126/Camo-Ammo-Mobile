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
  MessageSquare,
  XCircle,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface PendingPostsListPageProps {
  onBack: () => void;
}

export default function PendingPostsListPage({
  onBack,
}: PendingPostsListPageProps) {
  const pendingPosts = useQuery(api.forums.getPendingPosts);
  const approvePost = useMutation(api.forums.approvePost);
  const rejectPost = useMutation(api.forums.rejectPost);
  const warnPost = useMutation(api.forums.warnPost);

  const [selectedPost, setSelectedPost] = useState<Id<"forumPosts"> | null>(
    null
  );
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (postId: Id<"forumPosts">) => {
    try {
      setIsProcessing(true);
      await approvePost({ postId });
      showToast("Post approved successfully");
    } catch (error) {
      showToast("Failed to approve post");
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
        postId: selectedPost,
        reason: rejectionReason.trim(),
      });
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

  const handleWarn = async (postId: Id<"forumPosts">) => {
    try {
      setIsProcessing(true);
      const result = await warnPost({ postId });
      if (result.warningCount === 1) {
        showToast("First warning issued to user");
      } else {
        showToast(
          `Warning issued (${result.warningCount} total). User may be banned from posting.`
        );
      }
    } catch (error) {
      showToast("Failed to issue warning");
    } finally {
      setIsProcessing(false);
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
              Forum Posts Pending Review
            </Text>
            <Text className="text-xs text-gray-400">
              Review and approve or reject posts
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
          {pendingPosts === undefined ? (
            <View className="gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </View>
          ) : pendingPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <View className="items-center">
                  <MessageSquare
                    size={48}
                    color="#9ca3af"
                    style={{ marginBottom: 12 }}
                  />
                  <Text className="text-sm text-gray-400 text-center">
                    No pending posts to review
                  </Text>
                </View>
              </CardContent>
            </Card>
          ) : (
            pendingPosts.map((post) => (
              <Card key={post._id}>
                <CardContent className="p-4">
                  <View className="gap-3">
                    {/* Header */}
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1" style={{ minWidth: 0 }}>
                        <Text
                          className="font-semibold text-sm text-white"
                          numberOfLines={2}
                        >
                          {post.title}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                          By: {post.author?.name || "Unknown"} •{" "}
                          {format(
                            new Date(post.createdAt),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </Text>
                      </View>
                      <Badge type="secondary" className="text-xs">
                        <Text className="text-xs text-white">PENDING</Text>
                      </Badge>
                    </View>

                    {/* Content */}
                    <Text className="text-sm text-gray-300" numberOfLines={3}>
                      {post.content}
                    </Text>

                    {/* Category */}
                    {post.category && (
                      <Badge type="secondary" className="text-xs">
                        <Text className="text-xs text-white">
                          {post.category}
                        </Text>
                      </Badge>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row gap-2">
                      <Button
                        type="primary"
                        className="flex-1"
                        onPress={() => handleApprove(post._id)}
                        disabled={isProcessing}
                      >
                        <View className="flex-row items-center">
                          {isProcessing ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <>
                              <CheckCircle2
                                size={16}
                                color="#ffffff"
                                style={{ marginRight: 8 }}
                              />
                              <Text className="text-white">Approve</Text>
                            </>
                          )}
                        </View>
                      </Button>
                      <Button
                        type="outline"
                        className="flex-1"
                        onPress={() => handleWarn(post._id)}
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
                          setSelectedPost(post._id);
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
                    </View>
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
              placeholder="Explain why this post cannot be approved..."
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
