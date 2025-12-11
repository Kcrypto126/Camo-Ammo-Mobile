import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface ContactSupportPageProps {
  onBack: () => void;
}

export default function ContactSupportPage({
  onBack,
}: ContactSupportPageProps) {
  const tickets = useQuery(api.support.getMyTickets);
  const profile = useQuery(api.profile.getMyProfile, {});
  const createTicket = useMutation(api.support.createTicket);

  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim() || !category) {
      showToast("Please fill in all fields");
      return;
    }

    try {
      await createTicket({
        subject: subject.trim(),
        message: message.trim(),
        category,
      });
      showToast("Support ticket submitted successfully");
      setShowNewTicketDialog(false);
      setSubject("");
      setMessage("");
      setCategory("");
    } catch (error) {
      showToast("Failed to submit ticket");
    }
  };

  const getStatusBadgeType = (
    status: string
  ): "default" | "secondary" | "destructive" => {
    if (status === "resolved" || status === "closed") return "secondary";
    if (status === "in_progress") return "default";
    return "destructive";
  };

  const getStatusIcon = (status: string) => {
    if (status === "resolved" || status === "closed")
      return <CheckCircle2 size={12} color="#9ca3af" />;
    if (status === "in_progress") return <Clock size={12} color="#9ca3af" />;
    return <AlertCircle size={12} color="#ef4444" />;
  };

  const categoryOptions = [
    "Technical Issue",
    "Account Issue",
    "Billing Question",
    "Other",
  ];

  const categoryValueMap: Record<string, string> = {
    "Technical Issue": "technical",
    "Account Issue": "account",
    "Billing Question": "billing",
    Other: "other",
  };

  const categoryLabelMap: Record<string, string> = {
    technical: "Technical Issue",
    account: "Account Issue",
    billing: "Billing Question",
    other: "Other",
  };

  return (
    <View className="flex-1 bg-gray-900">
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
              <ArrowLeft size={16} color="#ffffff" />
            </Button>
            <View>
              <Text className="text-lg font-bold text-white">
                Contact Support
              </Text>
              <Text className="text-xs text-gray-400">
                Get help from our support team
              </Text>
            </View>
          </View>
          <Button type="primary" onPress={() => setShowNewTicketDialog(true)}>
            <View className="flex-row items-center gap-2">
              <Send size={16} color="#000" />
              <Text className="text-[#000]">New Ticket</Text>
            </View>
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="gap-4">
          {/* Info Card */}
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="p-4">
              <View className="flex-row items-start gap-3">
                <MessageSquare
                  size={20}
                  color="#3b82f6"
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-white">
                    How can we help?
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    Submit a support ticket and our team will get back to you as
                    soon as possible. We typically respond within 24-48 hours.
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-white">My Tickets</Text>
            {tickets === undefined ? (
              <View className="gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </View>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <View className="items-center">
                    <MessageSquare
                      size={48}
                      color="#9ca3af"
                      style={{ marginBottom: 12 }}
                    />
                    <Text className="text-sm text-gray-400">
                      No support tickets yet
                    </Text>
                    <Button
                      type="primary"
                      onPress={() => setShowNewTicketDialog(true)}
                      className="mt-4"
                    >
                      <Text className="text-white font-semibold">
                        Create your first ticket
                      </Text>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket._id}>
                  <CardContent className="p-4">
                    <View className="gap-3">
                      {/* Header */}
                      <View className="flex-row items-start justify-between gap-2">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 flex-wrap">
                            <Text className="font-semibold text-sm text-white">
                              {ticket.subject}
                            </Text>
                            <Badge
                              type={getStatusBadgeType(ticket.status)}
                              className="text-xs"
                            >
                              <View className="flex-row items-center gap-1">
                                {getStatusIcon(ticket.status)}
                                <Text
                                  className="text-xs"
                                  style={{
                                    color:
                                      ticket.status === "resolved" || ticket.status === "closed"
                                        ? "#9ca3af"
                                        : ticket.status === "in_progress"
                                        ? "#9ca3af"
                                        : "#ef4444",
                                  }}
                                >
                                  {ticket.status
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </Text>
                              </View>
                            </Badge>
                          </View>
                          <Text className="text-xs text-gray-400 mt-1">
                            {format(
                              new Date(ticket.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </Text>
                        </View>
                        <Badge type="default" className="text-xs">
                          {categoryLabelMap[ticket.category] || ticket.category}
                        </Badge>
                      </View>

                      {/* Message */}
                      <Text className="text-sm text-gray-400">
                        {ticket.message}
                      </Text>

                      {/* Admin Response */}
                      {ticket.adminResponse && (
                        <View className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 gap-1">
                          <Text className="text-xs font-medium text-[#ff6800]">
                            Support Team Response:
                          </Text>
                          <Text className="text-sm text-white">
                            {ticket.adminResponse}
                          </Text>
                          {ticket.respondedAt && (
                            <Text className="text-xs text-gray-400">
                              Responded on{" "}
                              {format(
                                new Date(ticket.respondedAt),
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </CardContent>
                </Card>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* New Ticket Dialog */}
      <Dialog
        visible={showNewTicketDialog}
        onClose={() => setShowNewTicketDialog(false)}
      >
        <ScrollView className="max-h-[70vh] pr-0.5">
          <View className="gap-4">
            {/* Header */}
            <View className="gap-1">
              <Text className="text-xl font-bold text-white">
                Create Support Ticket
              </Text>
              <Text className="text-sm text-gray-400">
                Tell us about your issue and we'll help you resolve it
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
                  {profile.memberNumber}
                </Badge>
              )}
            </View>
            <View>
              <Label>Category *</Label>
              <Select
                options={categoryOptions}
                value={
                  category ? categoryLabelMap[category] || category : undefined
                }
                onChange={(value) => {
                  const key = categoryValueMap[value];
                  if (key) setCategory(key);
                }}
                placeholder="Select a category"
              />
            </View>
            <View>
              <Label>Subject *</Label>
              <Input
                placeholder="Brief description of your issue"
                value={subject}
                onChangeText={setSubject}
              />
            </View>
            <View>
              <Label>Message *</Label>
              <Textarea
                placeholder="Please provide detailed information about your issue..."
                value={message}
                onChangeText={setMessage}
              />
            </View>
          </View>
        </ScrollView>
        <View className="flex-row gap-3 mt-6">
          <Button
            type="outline"
            onPress={() => setShowNewTicketDialog(false)}
            className="flex-1"
          >
            <Text className="text-white font-semibold">Cancel</Text>
          </Button>
          <Button type="primary" onPress={handleSubmit} className="flex-1">
            <Text className="text-white font-semibold">Submit Ticket</Text>
          </Button>
        </View>
      </Dialog>
    </View>
  );
}
