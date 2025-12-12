import { ActiveViewers } from "@/components/ui/ActiveViewers";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
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
import { format } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Paperclip,
  Pause,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Send,
  Shield,
  Trash2,
  Upload,
  User,
  UserCog,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ViewMemberProfilePageProps {
  userId: Id<"users">;
  onBack: () => void;
}

function FileDownloadButton({ storageId }: { storageId: Id<"_storage"> }) {
  const url = useQuery(api.roles.getMemberFileUrl, { storageId });

  return (
    <Button
      type="ghost"
      className="h-8 w-8 !p-0"
      onPress={() => {
        if (url) Linking.openURL(url);
      }}
      disabled={!url}
    >
      <Download size={16} color="#ffffff" />
    </Button>
  );
}

function AttachmentDownloadButton({
  storageId,
  fileName,
  fileSize,
}: {
  storageId: Id<"_storage">;
  fileName: string;
  fileSize: number;
}) {
  const url = useQuery(api.support.getAttachmentUrl, { storageId });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (url) Linking.openURL(url);
      }}
      disabled={!url}
      className="border border-gray-600 rounded-lg bg-gray-700 flex-row items-center gap-2 px-3 py-2"
      activeOpacity={0.7}
    >
      <FileText size={16} color="#ffffff" />
      <View className="flex-1 min-w-0">
        <Text className="text-xs font-medium text-white" numberOfLines={1}>
          {fileName}
        </Text>
        <Text className="text-xs text-gray-400">
          {formatFileSize(fileSize)}
        </Text>
      </View>
      <Download size={12} color="#ffffff" />
    </TouchableOpacity>
  );
}

function TicketRepliesSection({
  ticketId,
}: {
  ticketId: Id<"supportTickets">;
}) {
  const replies = useQuery(api.support.getTicketReplies, { ticketId });

  if (replies === undefined) {
    return <Skeleton className="h-20" />;
  }

  if (replies.length === 0) {
    return (
      <Text className="text-xs text-gray-400 text-center py-4">
        No replies yet
      </Text>
    );
  }

  return (
    <View className="gap-3">
      {replies.map((reply) => (
        <View
          key={reply._id}
          className={`rounded-lg border p-3 gap-2 ${
            reply.isAdminReply
              ? "bg-orange-500/5 border-orange-500/20"
              : "bg-gray-700/50"
          }`}
        >
          <View className="flex-row items-center flex-wrap gap-2">
            <Badge
              type={reply.isAdminReply ? "default" : "secondary"}
              className="text-xs"
            >
              <Text className="text-xs text-white">
                {reply.isAdminReply ? "Support Team" : "Member"}
              </Text>
            </Badge>
            <Text className="text-xs font-medium text-white">
              {reply.userName}
            </Text>
            <Text className="text-xs text-gray-400">
              {format(new Date(reply.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </Text>
          </View>
          <Text className="text-sm text-white whitespace-pre-wrap">
            {reply.message}
          </Text>
          {reply.attachments && reply.attachments.length > 0 && (
            <View className="gap-2">
              <Text className="text-xs font-medium text-gray-400">
                Attachments:
              </Text>
              <View className="gap-2">
                {reply.attachments.map((attachment, index) => (
                  <AttachmentDownloadButton
                    key={index}
                    storageId={attachment.storageId}
                    fileName={attachment.fileName}
                    fileSize={attachment.fileSize}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

export default function ViewMemberProfilePage({
  userId,
  onBack,
}: ViewMemberProfilePageProps) {
  const user = useQuery(api.roles.getUserById, { userId });
  const notes = useQuery(api.roles.getAdminNotes, { userId });
  const callLogs = useQuery(api.roles.getCallLogs, { userId });
  const tickets = useQuery(api.support.getUserTickets, { userId });
  const files = useQuery(api.roles.getMemberFiles, { userId });
  const forumActivity = useQuery(api.forums.getUserForumActivity, { userId });
  const myRole = useQuery(api.roles.getMyRole);

  // Get avatar URL from storage if it's a storage ID
  const avatarUrl = useQuery(
    api.profile.getPhotoUrl,
    user?.avatar && user.avatar.startsWith("kg")
      ? { storageId: user.avatar as never }
      : "skip"
  );

  const updateStatus = useMutation(api.roles.updateAccountStatus);
  const changeRole = useMutation(api.roles.changeUserRole);
  const addNote = useMutation(api.roles.addAdminNote);
  const deleteNote = useMutation(api.roles.deleteAdminNote);
  const addCallLog = useMutation(api.roles.addCallLog);
  const restrictAccess = useMutation(api.roles.restrictAccountAccess);
  const archiveUser = useMutation(api.roles.archiveUser);
  const generateFileUploadUrl = useMutation(
    api.roles.generateMemberFileUploadUrl
  );
  const addMemberFile = useMutation(api.roles.addMemberFile);
  const deleteMemberFile = useMutation(api.roles.deleteMemberFile);
  const addTicketReply = useMutation(api.support.addTicketReply);
  const generateReplyUploadUrl = useMutation(
    api.support.generateReplyUploadUrl
  );
  const updateTicketStatus = useMutation(api.support.updateTicketStatus);
  const removeForumBan = useMutation(api.forums.removeForumBan);

  const [currentTab, setCurrentTab] = useState("profile");
  const [expandedTickets, setExpandedTickets] = useState<
    Set<Id<"supportTickets">>
  >(new Set());
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyFiles, setReplyFiles] = useState<
    Record<string, ImagePicker.ImagePickerAsset[]>
  >({});
  const [newNote, setNewNote] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "active" | "hold" | "banned"
  >("active");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Call log state
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<"inbound" | "outbound">("inbound");
  const [callDuration, setCallDuration] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [callPhoneNumber, setCallPhoneNumber] = useState("");
  const [callDate, setCallDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // File upload state
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [selectedFile, setSelectedFile] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [fileDescription, setFileDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Initialize tab from SecureStore
  useEffect(() => {
    const initTab = async () => {
      try {
        const expandedTicketId =
          await SecureStore.getItemAsync("expandedTicketId");
        if (expandedTicketId) {
          setCurrentTab("inquiries");
          setExpandedTickets(
            new Set([expandedTicketId as Id<"supportTickets">])
          );
          await SecureStore.deleteItemAsync("expandedTicketId");
        }
      } catch (error) {
        console.error("Failed to read expandedTicketId:", error);
      }
    };
    initTab();
  }, []);

  const handleStatusChange = async () => {
    try {
      await updateStatus({ userId, status: selectedStatus });
      showToast(`Account status updated to ${selectedStatus}`);
      setShowStatusDialog(false);
    } catch (error) {
      showToast("Failed to update account status");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      showToast("Please enter a note");
      return;
    }

    try {
      await addNote({ userId, content: newNote });
      showToast("Note added successfully");
      setNewNote("");
    } catch (error) {
      showToast("Failed to add note");
    }
  };

  const handleRoleChange = async (newRole: "owner" | "admin" | "member") => {
    try {
      await changeRole({ userId, newRole });
      showToast("Role updated successfully");
    } catch (error) {
      showToast("Failed to update role");
    }
  };

  const handleDelete = async () => {
    try {
      await archiveUser({ userId });
      showToast("Member archived successfully");
      setShowDeleteDialog(false);
      onBack();
    } catch (error) {
      showToast("Failed to archive member");
    }
  };

  const handleDeleteNote = async (noteId: Id<"adminNotes">) => {
    try {
      await deleteNote({ noteId });
      showToast("Note deleted successfully");
    } catch (error) {
      showToast("Failed to delete note");
    }
  };

  const handleRestrictAccess = async () => {
    try {
      await restrictAccess({
        userId,
        restricted: !user?.accountAccessRestricted,
      });
      showToast(
        user?.accountAccessRestricted
          ? "Account access restored"
          : "Account access restricted"
      );
    } catch (error) {
      showToast("Failed to update account access");
    }
  };

  const handleAddCall = async () => {
    if (!callNotes.trim()) {
      showToast("Please enter call notes");
      return;
    }

    try {
      await addCallLog({
        userId,
        callType,
        duration: callDuration ? parseInt(callDuration) : undefined,
        notes: callNotes,
        phoneNumber: callPhoneNumber || undefined,
        callDate: new Date(callDate).getTime(),
      });
      showToast("Call logged successfully");
      setShowCallDialog(false);
      setCallNotes("");
      setCallDuration("");
      setCallPhoneNumber("");
      setCallDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      showToast("Failed to log call");
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showToast("Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      // Get upload URL
      const uploadUrl = await generateFileUploadUrl();

      // Fetch the file from local URI
      const fileResp = await fetch(selectedFile.uri);
      if (!fileResp.ok) {
        throw new Error(`Failed to read file: ${fileResp.status}`);
      }

      const blob = await fileResp.blob();
      const fileType = selectedFile.mimeType || "application/octet-stream";

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": fileType },
        body: blob,
      });

      const { storageId } = await result.json();

      // Save file metadata
      await addMemberFile({
        userId,
        fileName: selectedFile.fileName || "file",
        fileSize: selectedFile.fileSize || 0,
        fileType: fileType,
        storageId,
        description: fileDescription || undefined,
      });

      showToast("File uploaded successfully");
      setShowFileDialog(false);
      setSelectedFile(null);
      setFileDescription("");
    } catch (error) {
      showToast("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: Id<"memberFiles">) => {
    try {
      await deleteMemberFile({ fileId });
      showToast("File deleted successfully");
    } catch (error) {
      showToast("Failed to delete file");
    }
  };

  const toggleTicketExpanded = (ticketId: Id<"supportTickets">) => {
    setExpandedTickets((prev) => {
      const next = new Set(prev);
      if (next.has(ticketId)) {
        next.delete(ticketId);
      } else {
        next.add(ticketId);
      }
      return next;
    });
  };

  const handleReplyFilePick = async (ticketId: string) => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Media permission is required");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (pickerResult.canceled || !pickerResult.assets) return;

      setReplyFiles((prev) => ({
        ...prev,
        [ticketId]: pickerResult.assets || [],
      }));
    } catch (error) {
      showToast("Failed to pick files");
    }
  };

  const handleRemoveReplyFile = (ticketId: string, index: number) => {
    setReplyFiles((prev) => {
      const files = prev[ticketId] || [];
      return {
        ...prev,
        [ticketId]: files.filter((_, i) => i !== index),
      };
    });
  };

  const handleSendReply = async (ticketId: Id<"supportTickets">) => {
    const message = replyTexts[ticketId] || "";
    const files = replyFiles[ticketId] || [];

    if (!message.trim() && files.length === 0) {
      showToast("Please enter a message or attach a file");
      return;
    }

    try {
      // Upload files if any
      const attachments = [];
      for (const file of files) {
        const uploadUrl = await generateReplyUploadUrl();

        // Fetch the file from local URI
        const fileResp = await fetch(file.uri);
        if (!fileResp.ok) {
          throw new Error(`Failed to read file: ${fileResp.status}`);
        }

        const blob = await fileResp.blob();
        const fileType = file.mimeType || "application/octet-stream";

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": fileType },
          body: blob,
        });
        const { storageId } = await result.json();
        attachments.push({
          storageId,
          fileName: file.fileName || "file",
          fileSize: file.fileSize || 0,
        });
      }

      // Send reply
      await addTicketReply({
        ticketId,
        message: message.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      // Clear form
      setReplyTexts((prev) => ({ ...prev, [ticketId]: "" }));
      setReplyFiles((prev) => ({ ...prev, [ticketId]: [] }));

      showToast("Reply sent successfully");
    } catch (error) {
      showToast("Failed to send reply");
      console.error(error);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "owner") return <Shield size={16} color="#ffffff" />;
    if (role === "admin") return <UserCog size={16} color="#ffffff" />;
    return <User size={16} color="#ffffff" />;
  };

  const getRoleBadgeType = (
    role: string
  ): "default" | "secondary" | "destructive" => {
    if (role === "owner") return "default";
    if (role === "admin") return "secondary";
    return "secondary";
  };

  const getStatusBadgeType = (
    status?: string
  ): "default" | "destructive" | "secondary" => {
    if (status === "banned") return "destructive";
    if (status === "hold") return "secondary";
    return "default";
  };

  const getStatusIcon = (status?: string) => {
    if (status === "banned") return <Ban size={14} color="#ffffff" />;
    if (status === "hold") return <Pause size={14} color="#ffffff" />;
    return <AlertCircle size={14} color="#ffffff" />;
  };

  const getTicketStatusBadgeType = (
    status: string
  ): "default" | "secondary" | "destructive" => {
    if (status === "resolved" || status === "closed") return "secondary";
    if (status === "in_progress") return "default";
    return "destructive";
  };

  const getTicketStatusIcon = (status: string) => {
    if (status === "resolved" || status === "closed")
      return <CheckCircle2 size={12} color="#9ca3af" />;
    if (status === "in_progress") return <Clock size={12} color="#9ca3af" />;
    return <AlertCircle size={12} color="#ef4444" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (
    user === undefined ||
    notes === undefined ||
    callLogs === undefined ||
    tickets === undefined ||
    files === undefined ||
    forumActivity === undefined
  ) {
    return (
      <View className="flex-1 bg-gray-900">
        <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
          <View className="flex-row items-center gap-3">
            <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
              <ArrowLeft size={16} color="#ffffff" />
            </Button>
            <Skeleton className="h-6 w-48" />
          </View>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </View>
        </ScrollView>
      </View>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "communication", label: "Communication" },
    { id: "inquiries", label: "Inquiries", badge: tickets?.length ?? 0 },
    { id: "files", label: "Files", badge: files?.length ?? 0 },
  ];

  return (
    <View className="flex-1 bg-gray-900">
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
            <ArrowLeft size={16} color="#ffffff" />
          </Button>
          <View>
            <Text className="text-lg font-bold text-white">Member Profile</Text>
            <Text className="text-xs text-gray-400">
              View and manage member details
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-700 bg-gray-800 mx-4 mt-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setCurrentTab(tab.id)}
            className={`flex-1 py-3 items-center border-b-2 ${
              currentTab === tab.id ? "border-orange-500" : "border-transparent"
            }`}
          >
            <View className="flex-row relative items-center gap-1">
              <Text
                className={`text-xs font-semibold ${
                  currentTab === tab.id ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {tab.label || ""}
              </Text>
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <View className="absolute -right-[25px] top-[-10px] rounded-full bg-amber-500/30 border border-amber-500/50 px-1.5 py-0.5">
                  <Text className="text-xs text-amber-300 font-semibold">
                    {tab.badge}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {currentTab === "profile" && (
          <View className="gap-4">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View className="flex-row items-center gap-4">
                  <Avatar
                    src={
                      avatarUrl ||
                      (typeof user.avatar === "string"
                        ? user.avatar
                        : undefined)
                    }
                    fallback={
                      user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "?"
                    }
                    size={64}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-semibold text-white">
                        {user.name || "Unknown"}
                      </Text>
                      {user.memberNumber && (
                        <Badge type="secondary" className="text-xs">
                          <Text className="text-xs text-amber-300">
                            {user.memberNumber}
                          </Text>
                        </Badge>
                      )}
                    </View>
                    <Text className="text-sm text-gray-400">{user.email}</Text>
                    {user.username && (
                      <Text className="text-xs text-gray-400">
                        @{user.username}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-400">Role:</Text>
                    <View className="flex-row items-center gap-2">
                      <Badge type={getRoleBadgeType(user.role || "member")}>
                        <View className="flex-row items-center gap-1">
                          {getRoleIcon(user.role || "member")}
                          <Text className="text-white text-xs">
                            {(user.role || "member").toUpperCase()}
                          </Text>
                        </View>
                      </Badge>
                      {myRole === "owner" && (
                        <Select
                          options={["member", "admin", "owner"]}
                          value={user.role || "member"}
                          onChange={(value) =>
                            handleRoleChange(
                              value as "owner" | "admin" | "member"
                            )
                          }
                          placeholder="Select role"
                          className="w-32"
                        />
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-400">
                      Account Status:
                    </Text>
                    <Badge
                      type={getStatusBadgeType(user.accountStatus || "active")}
                    >
                      <View className="flex-row items-center gap-1">
                        {getStatusIcon(user.accountStatus || "active")}
                        <Text className="text-white text-xs">
                          {(user.accountStatus || "active").toUpperCase()}
                        </Text>
                      </View>
                    </Badge>
                  </View>

                  {user.phoneNumber && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-gray-400">Phone:</Text>
                      <Text className="text-sm text-white">
                        {user.phoneNumber}
                      </Text>
                    </View>
                  )}

                  {(user.city || user.state) && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-gray-400">Location:</Text>
                      <Text className="text-sm text-white">
                        {[user.city, user.state].filter(Boolean).join(", ")}
                      </Text>
                    </View>
                  )}

                  {user.country && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-gray-400">Country:</Text>
                      <Text className="text-sm text-white">{user.country}</Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-400">
                      Account Access:
                    </Text>
                    <Badge
                      type={
                        user.accountAccessRestricted ? "destructive" : "default"
                      }
                    >
                      <Text className="text-xs text-white">
                        {user.accountAccessRestricted
                          ? "RESTRICTED"
                          : "ALLOWED"}
                      </Text>
                    </Badge>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Account Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="gap-3">
                <Button
                  type="outline"
                  className="w-full"
                  onPress={handleRestrictAccess}
                >
                  <View className="flex-row items-center">
                    <AlertCircle
                      size={16}
                      color="#ffffff"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white">
                      {user.accountAccessRestricted
                        ? "Restore Account Access"
                        : "Restrict Account Access"}
                    </Text>
                  </View>
                </Button>
                <Button
                  type="outline"
                  className="w-full"
                  onPress={() => {
                    setSelectedStatus("hold");
                    setShowStatusDialog(true);
                  }}
                >
                  <View className="flex-row items-center">
                    <Pause
                      size={16}
                      color="#ffffff"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white">Put Account on Hold</Text>
                  </View>
                </Button>
                <Button
                  type="danger"
                  className="w-full"
                  onPress={() => {
                    setSelectedStatus("banned");
                    setShowStatusDialog(true);
                  }}
                >
                  <View className="flex-row items-center">
                    <Ban size={16} color="#ef4444" style={{ marginRight: 8 }} />
                    <Text className="text-red-400">Ban Member</Text>
                  </View>
                </Button>
                {user.accountStatus !== "active" && (
                  <Button
                    type="default"
                    className="w-full"
                    onPress={() => {
                      setSelectedStatus("active");
                      setShowStatusDialog(true);
                    }}
                  >
                    <View className="flex-row items-center">
                      <AlertCircle
                        size={16}
                        color="#ffffff"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-white">Restore Account</Text>
                    </View>
                  </Button>
                )}
                <View className="pt-2 border-t border-gray-700">
                  <Button
                    type="danger"
                    className="w-full"
                    onPress={() => setShowDeleteDialog(true)}
                  >
                    <View className="flex-row items-center">
                      <Trash2
                        size={16}
                        color="#ef4444"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-red-400">Delete Member</Text>
                    </View>
                  </Button>
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {currentTab === "communication" && (
          <View className="gap-4">
            {/* Call Logs Card */}
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Call Logs</CardTitle>
                <Button onPress={() => setShowCallDialog(true)}>
                  <View className="flex-row items-center">
                    <Phone size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text className="text-[#fff]">Log Call</Text>
                  </View>
                </Button>
              </CardHeader>
              <CardContent className="gap-3">
                {callLogs.length === 0 ? (
                  <Text className="py-8 text-center text-sm text-gray-400">
                    No calls logged yet
                  </Text>
                ) : (
                  callLogs.map((log) => (
                    <View
                      key={log._id}
                      className="rounded-lg border border-gray-700 bg-gray-700/50 p-3 gap-2"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          {log.callType === "inbound" ? (
                            <PhoneIncoming size={16} color="#10b981" />
                          ) : (
                            <PhoneOutgoing size={16} color="#3b82f6" />
                          )}
                          <Text className="text-xs text-white">
                            {log.callType.toUpperCase()}
                          </Text>
                          {log.duration && (
                            <Text className="text-xs text-gray-400">
                              {log.duration} min
                            </Text>
                          )}
                        </View>
                        <Text className="text-xs text-gray-400">
                          {format(new Date(log.callDate), "MMM d, yyyy")}
                        </Text>
                      </View>
                      {log.phoneNumber && (
                        <Text className="text-xs text-gray-400">
                          Phone: {log.phoneNumber}
                        </Text>
                      )}
                      <Text className="text-sm text-white">{log.notes}</Text>
                      <Text className="text-xs text-gray-400">
                        Logged by {log.authorName} on{" "}
                        {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                      </Text>
                    </View>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Admin Notes Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin Notes</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View className="gap-2">
                  <Textarea
                    placeholder="Add a note about this member (only visible to admins)..."
                    value={newNote}
                    onChangeText={setNewNote}
                    className="min-h-24"
                  />
                  <Button onPress={handleAddNote} className="w-full">
                    <Text className="text-white">Add Note</Text>
                  </Button>
                </View>

                <View className="gap-3">
                  {notes.length === 0 ? (
                    <Text className="py-8 text-center text-sm text-gray-400">
                      No admin notes yet
                    </Text>
                  ) : (
                    notes.map((note) => (
                      <View
                        key={note._id}
                        className="rounded-lg border border-gray-700 bg-gray-700/50 p-3 gap-1"
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className="text-xs font-medium text-white">
                            {note.authorName}
                          </Text>
                          <View className="flex-row items-center gap-2">
                            <Text className="text-xs text-gray-400">
                              {format(
                                new Date(note.createdAt),
                                "MMM d, yyyy h:mm a"
                              )}
                            </Text>
                            {myRole === "owner" && (
                              <Button
                                type="ghost"
                                className="h-6 w-6 !p-0"
                                onPress={() => handleDeleteNote(note._id)}
                              >
                                <Trash2 size={12} color="#9ca3af" />
                              </Button>
                            )}
                          </View>
                        </View>
                        <Text className="text-sm text-white">
                          {note.content}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </CardContent>
            </Card>

            {/* Forum Activity Card */}
            <Card>
              <CardHeader>
                <View className="flex-row items-center justify-between">
                  <CardTitle className="text-base">Forum Activity</CardTitle>
                  {user.forumBanExpiresAt &&
                    user.forumBanExpiresAt > Date.now() && (
                      <Badge type="destructive" className="text-xs">
                        <Text className="text-xs text-red-300">Banned</Text>
                      </Badge>
                    )}
                </View>
              </CardHeader>
              <CardContent className="gap-4">
                {/* Ban Info */}
                {user.forumBanExpiresAt &&
                  user.forumBanExpiresAt > Date.now() && (
                    <View className="rounded-lg border border-red-500 bg-red-500/10 p-3 gap-2">
                      <View className="flex-row items-start justify-between gap-2">
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-red-500">
                            Currently Banned from Forums
                          </Text>
                          <Text className="text-xs text-gray-400 mt-1">
                            Expires:{" "}
                            {format(
                              new Date(user.forumBanExpiresAt),
                              "MMM d, yyyy h:mm a"
                            )}
                          </Text>
                          <Text className="text-xs text-gray-400">
                            Time remaining:{" "}
                            {(() => {
                              const diff = user.forumBanExpiresAt - Date.now();
                              const days = Math.floor(
                                diff / (24 * 60 * 60 * 1000)
                              );
                              const hours = Math.floor(
                                (diff % (24 * 60 * 60 * 1000)) /
                                  (60 * 60 * 1000)
                              );
                              const minutes = Math.floor(
                                (diff % (60 * 60 * 1000)) / (60 * 1000)
                              );

                              if (days > 0)
                                return `${days}d ${hours}h ${minutes}m`;
                              if (hours > 0) return `${hours}h ${minutes}m`;
                              return `${minutes}m`;
                            })()}
                          </Text>
                          {user.forumBanReason && (
                            <Text className="text-xs mt-1 text-gray-400">
                              Reason: {user.forumBanReason}
                            </Text>
                          )}
                        </View>
                        {(myRole === "owner" || myRole === "admin") && (
                          <Button
                            type="outline"
                            onPress={async () => {
                              try {
                                await removeForumBan({ userId: user._id });
                                showToast("Forum ban removed");
                              } catch {
                                showToast("Failed to remove ban");
                              }
                            }}
                          >
                            <Text className="text-white">Remove Ban</Text>
                          </Button>
                        )}
                      </View>
                    </View>
                  )}

                {/* Warning Count */}
                {user.forumWarningCount && user.forumWarningCount > 0 && (
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-400">
                      Total Warnings:{" "}
                    </Text>
                    <Badge type="secondary" className="ml-1 text-xs">
                      <Text className="text-xs text-amber-300">
                        {user.forumWarningCount}
                      </Text>
                    </Badge>
                  </View>
                )}

                {/* Posts */}
                <View>
                  <Text className="text-sm font-semibold mb-2 text-white">
                    Posts ({forumActivity.posts.length})
                  </Text>
                  {forumActivity.posts.length === 0 ? (
                    <Text className="text-xs text-gray-400 py-4 text-center">
                      No posts yet
                    </Text>
                  ) : (
                    <View className="gap-2">
                      {forumActivity.posts.map((post) => (
                        <View
                          key={post._id}
                          className={`rounded-lg border p-3 gap-2 ${
                            post.hasWarning
                              ? "border-red-500 bg-red-500/5"
                              : "bg-gray-700/50 border-gray-700"
                          }`}
                        >
                          <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1 min-w-0">
                              <Text className="text-sm font-medium text-white">
                                {post.title}
                              </Text>
                              <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                                <Badge
                                  type={
                                    post.status === "approved"
                                      ? "default"
                                      : post.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  <Text className="text-xs text-white">
                                    {post.status || "approved"}
                                  </Text>
                                </Badge>
                                {post.hasWarning && (
                                  <Badge type="destructive" className="text-xs">
                                    <Text className="text-xs text-red-300">
                                      ⚠️ Warning
                                    </Text>
                                  </Badge>
                                )}
                              </View>
                              <Text className="text-xs text-gray-400 mt-1">
                                {format(
                                  new Date(post.createdAt),
                                  "MMM d, yyyy h:mm a"
                                )}
                              </Text>
                            </View>
                            <Button
                              type="ghost"
                              className="h-8"
                              onPress={() => {
                                showToast(
                                  "Forum navigation not available in mobile"
                                );
                              }}
                            >
                              <Text className="text-white">View</Text>
                            </Button>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Comments */}
                <View className="pt-2 border-t border-gray-700">
                  <Text className="text-sm font-semibold mb-2 text-white">
                    Comments ({forumActivity.comments.length})
                  </Text>
                  {forumActivity.comments.length === 0 ? (
                    <Text className="text-xs text-gray-400 py-4 text-center">
                      No comments yet
                    </Text>
                  ) : (
                    <View className="gap-2">
                      {forumActivity.comments.map((comment) => (
                        <View
                          key={comment._id}
                          className={`rounded-lg border p-3 gap-1 ${
                            comment.hasWarning
                              ? "border-red-500 bg-red-500/5"
                              : "bg-gray-700/50 border-gray-700"
                          }`}
                        >
                          <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1 min-w-0">
                              <Text
                                className="text-sm text-white"
                                numberOfLines={2}
                              >
                                {comment.content}
                              </Text>
                              {comment.hasWarning && (
                                <Badge
                                  type="destructive"
                                  className="text-xs mt-1"
                                >
                                  <Text className="text-xs text-red-300">
                                    ⚠️ Warning
                                  </Text>
                                </Badge>
                              )}
                              <Text className="text-xs text-gray-400 mt-1">
                                On: {comment.post?.title || "Deleted post"} •{" "}
                                {format(
                                  new Date(comment.createdAt),
                                  "MMM d, yyyy h:mm a"
                                )}
                              </Text>
                            </View>
                            {comment.post && (
                              <Button
                                type="ghost"
                                className="h-8"
                                onPress={() => {
                                  showToast(
                                    "Forum navigation not available in mobile"
                                  );
                                }}
                              >
                                <Text className="text-white">View</Text>
                              </Button>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {currentTab === "inquiries" && (
          <View className="gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Support Tickets</CardTitle>
              </CardHeader>
              <CardContent className="gap-3">
                {tickets.length === 0 ? (
                  <Text className="py-8 text-center text-sm text-gray-400">
                    No support tickets submitted
                  </Text>
                ) : (
                  tickets.map((ticket) => {
                    const isExpanded = expandedTickets.has(ticket._id);
                    const ticketFiles = replyFiles[ticket._id] || [];

                    return (
                      <Card key={ticket._id}>
                        <CardContent className="p-4">
                          <View className="gap-3">
                            {/* Header */}
                            <View className="flex-row items-start justify-between gap-2">
                              <View className="flex-1 min-w-0">
                                <View className="flex-row items-center gap-2 flex-wrap">
                                  <Text className="font-semibold text-sm text-white">
                                    {ticket.subject}
                                  </Text>
                                  <Badge
                                    type={getTicketStatusBadgeType(
                                      ticket.status
                                    )}
                                    className="text-xs"
                                  >
                                    <View className="flex-row items-center gap-1">
                                      {getTicketStatusIcon(ticket.status)}
                                      <Text
                                        className={`text-xs ${
                                          getTicketStatusBadgeType(
                                            ticket.status
                                          ) === "secondary"
                                            ? "text-gray-400"
                                            : getTicketStatusBadgeType(
                                                  ticket.status
                                                ) === "destructive"
                                              ? "text-red-300"
                                              : "text-white"
                                        }`}
                                      >
                                        {ticket.status
                                          .replace("_", " ")
                                          .toUpperCase()}
                                      </Text>
                                    </View>
                                  </Badge>
                                  {ticket.status !== "closed" &&
                                    ticket.status !== "resolved" && (
                                      <Button
                                        type="outline"
                                        className="h-6"
                                        onPress={async () => {
                                          try {
                                            await updateTicketStatus({
                                              ticketId: ticket._id,
                                              status: "closed",
                                            });
                                            showToast("Ticket closed");
                                          } catch {
                                            showToast("Failed to close ticket");
                                          }
                                        }}
                                      >
                                        <Text className="text-xs text-white">
                                          Close Ticket
                                        </Text>
                                      </Button>
                                    )}
                                </View>
                                <Text className="text-xs text-gray-400 mt-1">
                                  {format(
                                    new Date(ticket.createdAt),
                                    "MMM d, yyyy 'at' h:mm a"
                                  )}
                                </Text>
                              </View>
                              <Badge type="secondary" className="text-xs">
                                <Text className="text-xs text-amber-300">
                                  {ticket.category}
                                </Text>
                              </Badge>
                            </View>

                            {/* Active Viewers */}
                            {isExpanded && (
                              <ActiveViewers
                                entityType="supportTicket"
                                entityId={ticket._id}
                              />
                            )}

                            {/* Message */}
                            <Text className="text-sm text-gray-400">
                              {ticket.message}
                            </Text>

                            {/* Expand/Collapse Button */}
                            <Button
                              type="outline"
                              className="w-full"
                              onPress={() => toggleTicketExpanded(ticket._id)}
                            >
                              <View className="flex-row items-center">
                                {isExpanded ? (
                                  <>
                                    <ChevronUp
                                      size={16}
                                      color="#ffffff"
                                      style={{ marginRight: 8 }}
                                    />
                                    <Text className="text-white">
                                      Hide Conversation
                                    </Text>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown
                                      size={16}
                                      color="#ffffff"
                                      style={{ marginRight: 8 }}
                                    />
                                    <Text className="text-white">
                                      View & Reply to Conversation
                                    </Text>
                                  </>
                                )}
                              </View>
                            </Button>

                            {/* Replies Section */}
                            {isExpanded && (
                              <View className="gap-3 pt-2">
                                <View className="border-t border-gray-700 pt-3">
                                  <Text className="text-xs font-semibold mb-3 text-white">
                                    Conversation History
                                  </Text>
                                  <TicketRepliesSection ticketId={ticket._id} />
                                </View>

                                {/* Reply Form */}
                                <View className="border-t border-gray-700 py-3 gap-3">
                                  <Text className="text-xs font-semibold text-white">
                                    Add Reply
                                  </Text>
                                  <Textarea
                                    placeholder="Type your response or provide evidence..."
                                    value={replyTexts[ticket._id] || ""}
                                    onChangeText={(text) =>
                                      setReplyTexts((prev) => ({
                                        ...prev,
                                        [ticket._id]: text,
                                      }))
                                    }
                                    className="min-h-24"
                                  />

                                  {/* File Attachments */}
                                  {ticketFiles.length > 0 && (
                                    <View className="gap-2">
                                      <Text className="text-xs font-medium text-white">
                                        Attachments:
                                      </Text>
                                      <View className="gap-2">
                                        {ticketFiles.map((file, index) => (
                                          <View
                                            key={index}
                                            className="flex-row items-center gap-2 rounded border border-gray-700 bg-gray-700/50 px-3 py-2"
                                          >
                                            <FileText
                                              size={16}
                                              color="#ffffff"
                                            />
                                            <Text
                                              className="flex-1 text-xs text-white"
                                              numberOfLines={1}
                                            >
                                              {file.fileName ||
                                                file.uri.split("/").pop()}
                                            </Text>
                                            <Button
                                              type="ghost"
                                              className="h-6 w-6 !p-0"
                                              onPress={() =>
                                                handleRemoveReplyFile(
                                                  ticket._id,
                                                  index
                                                )
                                              }
                                            >
                                              <X size={12} color="#ffffff" />
                                            </Button>
                                          </View>
                                        ))}
                                      </View>
                                    </View>
                                  )}

                                  <View className="flex-row gap-2">
                                    <Button
                                      type="outline"
                                      onPress={() =>
                                        handleReplyFilePick(ticket._id)
                                      }
                                    >
                                      <View className="flex-row items-center">
                                        <Paperclip
                                          size={16}
                                          color="#ffffff"
                                          style={{ marginRight: 8 }}
                                        />
                                        <Text className="text-white">
                                          Attach Files
                                        </Text>
                                      </View>
                                    </Button>

                                    <Button
                                      type="primary"
                                      className="flex-1"
                                      onPress={() =>
                                        handleSendReply(ticket._id)
                                      }
                                    >
                                      <View className="flex-row items-center">
                                        <Send
                                          size={16}
                                          color="#000"
                                          style={{ marginRight: 8 }}
                                        />
                                        <Text className="text-[#000]">
                                          Send Reply
                                        </Text>
                                      </View>
                                    </Button>
                                  </View>
                                </View>
                              </View>
                            )}
                          </View>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </View>
        )}

        {currentTab === "files" && (
          <View className="gap-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Private Files</CardTitle>
                <Button
                  onPress={async () => {
                    try {
                      const permissionResult =
                        await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (!permissionResult.granted) {
                        showToast("Media permission is required");
                        return;
                      }
                      const pickerResult =
                        await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: ImagePicker.MediaTypeOptions.All,
                          allowsMultipleSelection: false,
                          quality: 1,
                        });
                      if (
                        pickerResult.canceled ||
                        !pickerResult.assets ||
                        pickerResult.assets.length === 0
                      )
                        return;
                      setSelectedFile(pickerResult.assets[0]);
                      setShowFileDialog(true);
                    } catch (error) {
                      showToast("Failed to pick file");
                    }
                  }}
                >
                  <View className="flex-row items-center">
                    <Upload size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text className="text-[#fff]">Upload File</Text>
                  </View>
                </Button>
              </CardHeader>
              <CardContent className="gap-3">
                <Text className="text-xs text-gray-400">
                  Files uploaded here are only visible to admins and owners
                </Text>
                {files.length === 0 ? (
                  <Text className="py-8 text-center text-sm text-gray-400">
                    No files uploaded yet
                  </Text>
                ) : (
                  files.map((file) => (
                    <View
                      key={file._id}
                      className="rounded-lg border border-gray-700 bg-gray-700/50 p-3 gap-2"
                    >
                      <View className="flex-row items-start justify-between gap-2">
                        <View className="flex-1 min-w-0">
                          <View className="flex-row items-center gap-2">
                            <FileText size={16} color="#ffffff" />
                            <Text
                              className="font-semibold text-sm text-white"
                              numberOfLines={1}
                            >
                              {file.fileName}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-3 mt-1">
                            <Text className="text-xs text-gray-400">
                              {formatFileSize(file.fileSize)}
                            </Text>
                            <Text className="text-xs text-gray-400">
                              {format(new Date(file.createdAt), "MMM d, yyyy")}
                            </Text>
                          </View>
                          {file.description && (
                            <Text className="text-xs text-gray-400 mt-1">
                              {file.description}
                            </Text>
                          )}
                          <Text className="text-xs text-gray-400 mt-1">
                            Uploaded by {file.uploaderName}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <FileDownloadButton storageId={file.storageId} />
                          <Button
                            type="ghost"
                            className="h-8 w-8 !p-0"
                            onPress={() => handleDeleteFile(file._id)}
                          >
                            <Trash2 size={16} color="#9ca3af" />
                          </Button>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </CardContent>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Status Change Dialog */}
      <Dialog
        visible={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
      >
        <View className="gap-4">
          <View>
            <Text className="text-lg font-bold text-white">
              Update Account Status
            </Text>
            <Text className="text-sm text-gray-400 mt-2">
              Are you sure you want to change this member's account status to{" "}
              <Text className="font-bold">{selectedStatus}</Text>?
            </Text>
          </View>
          <View className="flex-row gap-2 justify-end">
            <Button type="outline" onPress={() => setShowStatusDialog(false)}>
              <Text className="text-white">Cancel</Text>
            </Button>
            <Button type="primary" onPress={handleStatusChange}>
              <Text className="text-white">Confirm</Text>
            </Button>
          </View>
        </View>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <View className="gap-4">
          <View>
            <Text className="text-lg font-bold text-white">Delete Member</Text>
            <Text className="text-sm text-gray-400 mt-2">
              Are you sure you want to delete this member? They will be moved to
              the archived members list and will no longer have access to the
              app.
            </Text>
          </View>
          <View className="flex-row gap-2 justify-end">
            <Button type="outline" onPress={() => setShowDeleteDialog(false)}>
              <Text className="text-white">Cancel</Text>
            </Button>
            <Button type="danger" onPress={handleDelete}>
              <Text className="text-red-400">Delete Member</Text>
            </Button>
          </View>
        </View>
      </Dialog>

      {/* Call Log Dialog */}
      <Dialog visible={showCallDialog} onClose={() => setShowCallDialog(false)}>
        <ScrollView className="max-h-[80%]">
          <View className="gap-4">
            <View>
              <Text className="text-lg font-bold text-white">Log Call</Text>
              <Text className="text-sm text-gray-400 mt-2">
                Record details about a phone call with this member
              </Text>
            </View>
            <View className="gap-2">
              <Label>Call Type *</Label>
              <Select
                options={["inbound", "outbound"]}
                value={callType}
                onChange={(value) =>
                  setCallType(value as "inbound" | "outbound")
                }
                placeholder="Select call type"
              />
            </View>
            <View className="gap-2">
              <Label>Call Date *</Label>
              <DatePickerInput
                value={callDate}
                onChange={setCallDate}
                placeholder="Select date"
              />
            </View>
            <View className="gap-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="(555) 123-4567"
                value={callPhoneNumber}
                onChangeText={setCallPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
            <View className="gap-2">
              <Label>Duration (minutes)</Label>
              <Input
                placeholder="15"
                value={callDuration}
                onChangeText={setCallDuration}
                keyboardType="numeric"
              />
            </View>
            <View className="gap-2">
              <Label>Call Notes *</Label>
              <Textarea
                placeholder="Discussion summary, action items, follow-up needed..."
                value={callNotes}
                onChangeText={setCallNotes}
                className="min-h-24"
              />
            </View>
            <View className="flex-row gap-2 justify-end mt-4">
              <Button type="outline" onPress={() => setShowCallDialog(false)}>
                <Text className="text-white">Cancel</Text>
              </Button>
              <Button type="primary" onPress={handleAddCall}>
                <Text className="text-white">Log Call</Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog visible={showFileDialog} onClose={() => setShowFileDialog(false)}>
        <View className="gap-4">
          <View>
            <Text className="text-lg font-bold text-white">Upload File</Text>
            <Text className="text-sm text-gray-400 mt-2">
              Upload a private file for this member (visible to admins only)
            </Text>
          </View>
          {selectedFile && (
            <View className="gap-2">
              <Label>Selected File</Label>
              <View className="flex-row items-center gap-2 rounded border border-gray-700 bg-gray-700/50 px-3 py-2">
                <FileText size={16} color="#ffffff" />
                <Text className="flex-1 text-sm text-white" numberOfLines={1}>
                  {selectedFile.fileName || selectedFile.uri.split("/").pop()}
                </Text>
                <Button
                  type="ghost"
                  className="h-6 w-6 !p-0"
                  onPress={() => setSelectedFile(null)}
                >
                  <X size={12} color="#ffffff" />
                </Button>
              </View>
            </View>
          )}
          <View className="gap-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Brief description of this file..."
              value={fileDescription}
              onChangeText={setFileDescription}
              className="min-h-20"
            />
          </View>
          <View className="flex-row gap-2 justify-between">
            <Button
              type="outline"
              onPress={() => {
                setShowFileDialog(false);
                setSelectedFile(null);
                setFileDescription("");
              }}
            >
              <Text className="text-white">Cancel</Text>
            </Button>
            <Button
              type="primary"
              onPress={handleFileUpload}
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text className="text-[#000]">Upload File</Text>
              )}
            </Button>
          </View>
        </View>
      </Dialog>
    </View>
  );
}
