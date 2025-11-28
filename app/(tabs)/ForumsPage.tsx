import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  Flag,
  Heart,
  MessageSquare,
  Plus,
  Send,
  ShieldAlert,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

interface ForumsPageProps {
  onBack: () => void;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "tips", label: "Tips & Tricks" },
  { value: "stories", label: "Hunt Stories" },
  { value: "gear", label: "Gear & Equipment" },
  { value: "spots", label: "Hunting Spots" },
];

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export default function ForumsPage({ onBack }: ForumsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedState, setSelectedState] = useState<string | undefined>(
    undefined
  );
  const [selectedCity, setSelectedCity] = useState<string | undefined>(
    undefined
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<Id<"forumPosts"> | null>(
    null
  );

  const posts = useQuery(api.forums.getPosts, {
    category: selectedCategory,
    state: selectedState,
    city: selectedCity,
  });

  const banStatus = useQuery(api.forums.getMyForumBanStatus, {});

  if (selectedPostId) {
    return (
      <PostDetailView
        postId={selectedPostId}
        onBack={() => setSelectedPostId(null)}
        banStatus={banStatus}
      />
    );
  }

  const formatBanExpiry = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;

    if (diff <= 0) return "expired";

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack}>
            <ChevronLeft size={20} color="#ffffff" />
          </Button>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">Forums</Text>
            <Text className="text-xs text-gray-400">
              Connect with other hunters
            </Text>
          </View>
          <Button
            onPress={() => setShowCreateDialog(true)}
            disabled={banStatus?.isBanned}
          >
            <View className="flex-row items-center gap-2">
              <Plus size={16} color="#ffffff" />
              <Text className="text-white">New Post</Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Ban Message */}
      {banStatus?.isBanned && banStatus.banExpiresAt && (
        <View className="border-t border-red-700 bg-red-900/90 px-4 py-3">
          <View className="flex-row items-center gap-2">
            <ShieldAlert size={16} color="#ffffff" />
            <View className="flex-1">
              <Text className="text-xs font-medium text-white">
                At this time you are unable to participate in the forums for
                this app due to recent behaviors.
              </Text>
              <Text className="mt-1 text-xs text-white">
                Your ban will expire in{" "}
                {formatBanExpiry(banStatus.banExpiresAt)} (
                {new Date(banStatus.banExpiresAt).toLocaleDateString()})
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Location Filter */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Select
              options={["All States", ...US_STATES]}
              value={selectedState || "All States"}
              onChange={(value) => {
                setSelectedState(value === "All States" ? undefined : value);
                setSelectedCity(undefined);
              }}
              placeholder="All States"
              className="w-[180px]"
            />

            <Input
              placeholder="Filter by city..."
              value={selectedCity || ""}
              onChangeText={(text) => setSelectedCity(text || undefined)}
              className="w-[180px]"
            />

            {(selectedState || selectedCity) && (
              <Button
                type="ghost"
                onPress={() => {
                  setSelectedState(undefined);
                  setSelectedCity(undefined);
                }}
              >
                <Text className="text-white">Clear</Text>
              </Button>
            )}
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-2"
        >
          <Button
            type={selectedCategory === undefined ? "primary" : "outline"}
            onPress={() => setSelectedCategory(undefined)}
          >
            <Text className="text-white">All</Text>
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              type={selectedCategory === cat.value ? "primary" : "outline"}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text className="text-white">{cat.label}</Text>
            </Button>
          ))}
        </ScrollView>
      </View>

      {/* Posts List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        <View className="gap-3">
          {!posts ? (
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
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <View className="items-center">
                  <MessageSquare
                    size={48}
                    color="#9ca3af"
                    style={{ marginBottom: 12 }}
                  />
                  <Text className="mb-1 font-semibold text-white">
                    No posts yet
                  </Text>
                  <Text className="mb-4 text-sm text-gray-400">
                    Be the first to start a conversation!
                  </Text>
                  <Button onPress={() => setShowCreateDialog(true)}>
                    <Text className="text-white">Create Post</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post._id} onPress={() => setSelectedPostId(post._id)}>
                <CardHeader className="pb-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="mb-1 font-semibold leading-tight text-white">
                        {post.title}
                      </Text>
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Text className="text-xs text-gray-400">
                          {post.author?.name?.split(" ")[0] || "Unknown"}
                        </Text>
                        <Text className="text-xs text-gray-400">•</Text>
                        <Text className="text-xs text-gray-400">
                          {formatDistanceToNow(post.createdAt, {
                            addSuffix: true,
                          })}
                        </Text>
                        {post.city && post.state && (
                          <>
                            <Text className="text-xs text-gray-400">•</Text>
                            <Text className="text-xs text-gray-400">
                              {post.city}, {post.state}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                    <View className="flex-col gap-1">
                      {post.category && (
                        <Badge type="secondary" className="text-xs">
                          {CATEGORIES.find((c) => c.value === post.category)
                            ?.label || post.category}
                        </Badge>
                      )}
                    </View>
                  </View>
                </CardHeader>
                <CardContent className="pt-0">
                  <Text
                    className="mb-3 text-sm text-gray-400"
                    numberOfLines={2}
                  >
                    {post.content}
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <Heart size={14} color="#9ca3af" />
                      <Text className="text-xs text-gray-400">
                        {post.likeCount}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MessageSquare size={14} color="#9ca3af" />
                      <Text className="text-xs text-gray-400">
                        {post.commentCount}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </View>
  );
}

// Post Detail View Component
function PostDetailView({
  postId,
  onBack,
  banStatus,
}: {
  postId: Id<"forumPosts">;
  onBack: () => void;
  banStatus?:
    | {
        isBanned: boolean;
        banExpiresAt?: number | null;
        banReason?: string | null;
        warningCount?: number;
      }
    | undefined;
}) {
  const [commentText, setCommentText] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const post = useQuery(api.forums.getPost, { postId });
  const addComment = useMutation(api.forums.addComment);
  const toggleLike = useMutation(api.forums.toggleLikePost);
  const hasLiked = useQuery(api.forums.hasLikedPost, { postId });
  const deletePost = useMutation(api.forums.deletePost);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (banStatus?.isBanned) {
      showToast("You are currently banned from commenting");
      return;
    }

    try {
      await addComment({
        postId,
        content: commentText,
      });
      setCommentText("");
      showToast("Comment added!");
    } catch (error) {
      showToast("Failed to add comment");
    }
  };

  const handleToggleLike = async () => {
    try {
      await toggleLike({ postId });
    } catch (error) {
      showToast("Failed to like post");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost({ postId });
      showToast("Post deleted");
      onBack();
    } catch (error) {
      showToast("Failed to delete post");
    }
  };

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <View className="items-center">
          <View className="mb-4 h-8 w-8 rounded-full border-4 border-[#ff6800] border-t-transparent" />
          <Text className="text-gray-400">Loading post...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Button type="ghost" onPress={onBack}>
            <ChevronLeft size={20} color="#ffffff" />
          </Button>
          <View className="flex-row gap-2">
            <Button type="ghost" onPress={() => setShowReportDialog(true)}>
              <Flag size={16} color="#ffffff" />
            </Button>
            <Button type="ghost" onPress={handleDelete}>
              <Trash2 size={16} color="#ef4444" />
            </Button>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
      >
        <View className="gap-4">
          {/* Post */}
          <Card>
            <CardHeader>
              <View className="mb-2 flex-row items-center gap-3">
                <Avatar
                  size={40}
                  fallback={post.author?.name?.[0]?.toUpperCase() || "?"}
                />
                <View>
                  <Text className="font-semibold text-white">
                    {post.author?.name?.split(" ")[0] || "Unknown"}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                  </Text>
                </View>
              </View>
              <Text className="text-xl font-bold text-white">{post.title}</Text>
            </CardHeader>
            <CardContent>
              <Text className="mb-4 whitespace-pre-wrap text-sm text-white">
                {post.content}
              </Text>
              <View className="flex-row items-center gap-4">
                <Button
                  type={hasLiked ? "primary" : "outline"}
                  onPress={handleToggleLike}
                >
                  <View className="flex-row items-center gap-2">
                    <Heart
                      size={16}
                      color={hasLiked ? "#ffffff" : "#ffffff"}
                      fill={hasLiked ? "#ffffff" : "none"}
                    />
                    <Text className="text-white">{post.likeCount}</Text>
                  </View>
                </Button>
                <View className="flex-row items-center gap-1">
                  <MessageSquare size={16} color="#9ca3af" />
                  <Text className="text-sm text-gray-400">
                    {post.commentCount} comments
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Comments */}
          <View className="gap-3">
            <Text className="font-semibold text-white">Comments</Text>
            {post.comments.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <Text className="text-center text-sm text-gray-400">
                    No comments yet. Be the first to comment!
                  </Text>
                </CardContent>
              </Card>
            ) : (
              post.comments.map((comment) => (
                <Card key={comment._id}>
                  <CardContent className="p-4">
                    <View className="mb-2 flex-row items-center gap-2">
                      <Avatar
                        size={24}
                        fallback={
                          comment.author?.name?.[0]?.toUpperCase() || "?"
                        }
                      />
                      <Text className="text-sm font-medium text-white">
                        {comment.author?.name?.split(" ")[0] || "Unknown"}
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

      {/* Report Dialog */}
      <ReportPostDialog
        postId={postId}
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />

      {/* Comment Input */}
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
          <Button onPress={handleAddComment} disabled={!commentText.trim()}>
            <Send size={16} color="#ffffff" />
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Report Post Dialog Component
function ReportPostDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: Id<"forumPosts">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState<
    "spam" | "hate_speech" | "violence" | "harassment" | ""
  >("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportPost = useMutation(api.forums.reportPost);

  const handleSubmit = async () => {
    if (!reason) {
      showToast("Please select a reason");
      return;
    }

    try {
      setIsSubmitting(true);
      await reportPost({
        postId,
        reason,
        description: description || undefined,
      });
      showToast("Post reported. An admin will review it shortly.");
      setReason("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      showToast("Failed to report post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions = ["Spam", "Hate Speech", "Violence", "Harassment"];
  const reasonValueMap: Record<
    string,
    "spam" | "hate_speech" | "violence" | "harassment"
  > = {
    Spam: "spam",
    "Hate Speech": "hate_speech",
    Violence: "violence",
    Harassment: "harassment",
  };
  const reasonLabelMap: Record<string, string> = {
    spam: "Spam",
    hate_speech: "Hate Speech",
    violence: "Violence",
    harassment: "Harassment",
  };

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <ScrollView className="max-h-[80vh]">
        <View className="gap-4">
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <ShieldAlert size={20} color="#ffffff" />
              <Text className="text-xl font-bold text-white">Report Post</Text>
            </View>
            <Text className="text-sm text-gray-400">
              Help us keep the community safe by reporting inappropriate
              content.
            </Text>
          </View>
          <View className="gap-2">
            <Label>Reason *</Label>
            <Select
              options={reasonOptions}
              value={reason ? reasonLabelMap[reason] : undefined}
              onChange={(value) => {
                const key = reasonValueMap[value];
                if (key) setReason(key);
              }}
              placeholder="Why are you reporting this post?"
            />
          </View>
          <View className="gap-2">
            <Label>Additional Details (Optional)</Label>
            <Textarea
              placeholder="Provide more context about why this content should be reviewed..."
              value={description}
              onChangeText={setDescription}
              className="min-h-32"
            />
          </View>
        </View>
      </ScrollView>
      <View className="flex-row gap-3 mt-4">
        <Button
          type="outline"
          onPress={() => {
            onOpenChange(false);
            setReason("");
            setDescription("");
          }}
          disabled={isSubmitting}
          className="flex-1"
        >
          <Text className="text-white">Cancel</Text>
        </Button>
        <Button
          onPress={handleSubmit}
          disabled={isSubmitting}
          type="danger"
          className="flex-1"
        >
          <Text className="text-white">
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Text>
        </Button>
      </View>
    </Dialog>
  );
}

// Create Post Dialog Component
function CreatePostDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = useMutation(api.forums.createPost);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast("Please fill in title and content");
      return;
    }

    if (!state || !city.trim()) {
      showToast("Please select a state and enter a city");
      return;
    }

    try {
      setIsSubmitting(true);
      await createPost({
        title,
        content,
        category: category || undefined,
        state,
        city,
      });
      showToast("Post created! It will be visible after admin approval.");
      setTitle("");
      setContent("");
      setCategory("");
      setState("");
      setCity("");
      onOpenChange(false);
    } catch (error) {
      showToast("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = CATEGORIES.map((cat) => cat.label);
  const categoryValueMap: Record<string, string> = {};
  CATEGORIES.forEach((cat) => {
    categoryValueMap[cat.label] = cat.value;
  });
  const categoryLabelMap: Record<string, string> = {};
  CATEGORIES.forEach((cat) => {
    categoryLabelMap[cat.value] = cat.label;
  });

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <ScrollView className="max-h-[90vh]">
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-xl font-bold text-white">
              Create New Post
            </Text>
            <Text className="text-sm text-gray-400">
              Share your thoughts with the hunting community
            </Text>
          </View>
          <View className="gap-2">
            <Label>Title *</Label>
            <Input
              placeholder="What's on your mind?"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <View className="gap-2">
            <Label>Category</Label>
            <Select
              options={categoryOptions}
              value={category ? categoryLabelMap[category] : undefined}
              onChange={(value) => {
                const key = categoryValueMap[value];
                if (key) setCategory(key);
              }}
              placeholder="Select a category"
            />
          </View>
          <View className="gap-2">
            <Label>State *</Label>
            <Select
              options={US_STATES}
              value={state}
              onChange={setState}
              placeholder="Select a state"
            />
          </View>
          <View className="gap-2">
            <Label>City *</Label>
            <Input
              placeholder="Enter city name"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View className="gap-2">
            <Label>Content *</Label>
            <Textarea
              placeholder="Share your story, tips, or questions..."
              value={content}
              onChangeText={setContent}
              className="min-h-32"
            />
          </View>
        </View>
      </ScrollView>
      <View className="flex-row gap-3 mt-4">
        <Button
          type="outline"
          onPress={() => onOpenChange(false)}
          disabled={isSubmitting}
          className="flex-1"
        >
          <Text className="text-white">Cancel</Text>
        </Button>
        <Button
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          <Text className="text-white">
            {isSubmitting ? "Creating..." : "Create Post"}
          </Text>
        </Button>
      </View>
    </Dialog>
  );
}
