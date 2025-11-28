import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface InquiryDialogProps {
  leaseId: Id<"landLeases"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InquiryDialog({
  leaseId,
  open,
  onOpenChange,
}: InquiryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numberOfHunters, setNumberOfHunters] = useState("");
  const sendInquiry = useMutation(api.landLeases.sendInquiry);

  const onSubmit = async () => {
    if (!leaseId) return;

    if (!message.trim() || message.length < 10) {
      showToast("Message must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendInquiry({
        leaseId,
        message: message.trim(),
        contactInfo: contactInfo.trim() || undefined,
        startDate: startDate ? new Date(startDate).getTime() : undefined,
        endDate: endDate ? new Date(endDate).getTime() : undefined,
        numberOfHunters: numberOfHunters
          ? parseInt(numberOfHunters)
          : undefined,
      });

      showToast("Inquiry sent successfully!");
      setMessage("");
      setContactInfo("");
      setStartDate("");
      setEndDate("");
      setNumberOfHunters("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send inquiry:", error);
      showToast("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <ScrollView className="max-h-[80vh]">
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-xl font-bold text-white">Send Inquiry</Text>
            <Text className="text-sm text-gray-400">
              Contact the landowner about this lease opportunity. They will
              receive your message and respond directly.
            </Text>
          </View>
          <View className="gap-2">
            <Label>
              Message <Text className="text-red-500">*</Text>
            </Label>
            <Textarea
              placeholder="Tell the landowner about your interest in the property..."
              value={message}
              onChangeText={setMessage}
              className="min-h-32"
            />
            {message.length > 0 && message.length < 10 && (
              <Text className="text-sm text-red-500">
                Message must be at least 10 characters
              </Text>
            )}
          </View>
          <View className="gap-2">
            <Label>Your Contact Info</Label>
            <Input
              placeholder="Phone or email (optional)"
              value={contactInfo}
              onChangeText={setContactInfo}
            />
            <Text className="text-xs text-gray-400">
              Provide your preferred contact method if different from your
              profile
            </Text>
          </View>
          <View className="flex-row gap-4">
            <View className="flex-1 gap-2">
              <Label>Desired Start Date</Label>
              <Input
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View className="flex-1 gap-2">
              <Label>Desired End Date</Label>
              <Input
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>
          <View className="gap-2">
            <Label>Number of Hunters</Label>
            <Input
              placeholder="How many hunters?"
              value={numberOfHunters}
              onChangeText={setNumberOfHunters}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>
      <View className="flex-row gap-3 mt-4">
        <Button
          type="outline"
          onPress={() => onOpenChange(false)}
          className="flex-1"
          disabled={isSubmitting}
        >
          <Text className="text-white">Cancel</Text>
        </Button>
        <Button onPress={onSubmit} disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white">Send Inquiry</Text>
          )}
        </Button>
      </View>
    </Dialog>
  );
}
