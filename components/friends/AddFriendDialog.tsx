import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useDebounce } from "@/hooks/use-debounce";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import {
  Mail,
  Phone,
  Search,
  Upload,
  User,
  UserPlus,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddFriendDialog({
  open,
  onOpenChange,
}: AddFriendDialogProps) {
  const [activeTab, setActiveTab] = useState<"search" | "import">("search");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null
  );
  const [message, setMessage] = useState("");

  const sendRequest = useMutation(api.friends.sendFriendRequestById);

  const handleSendRequest = async (
    userId: Id<"users">,
    msg: string,
    onSuccess: () => void
  ) => {
    try {
      const result = await sendRequest({ toUserId: userId, message: msg });
      if (result.friendshipCreated) {
        showToast("Friend added! They had already sent you a request.");
      } else {
        showToast("Friend request sent!");
      }
      onSuccess();
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message: errorMessage } = error.data as {
          code: string;
          message: string;
        };
        showToast(errorMessage);
      } else {
        showToast("Failed to send friend request");
      }
    }
  };

  return (
    <>
      <Dialog visible={open} onClose={() => onOpenChange(false)}>
        <ScrollView
          className="max-h-[80vh]"
          showsVerticalScrollIndicator={true}
        >
          <View className="space-y-1 mb-4">
            <Text className="text-xl font-bold text-white">Add Friends</Text>
            <Text className="text-sm text-gray-400">
              Search for friends or import your contacts
            </Text>
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-gray-700 mb-4">
            <TouchableOpacity
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === "search"
                  ? "border-orange-500"
                  : "border-transparent"
              }`}
              onPress={() => setActiveTab("search")}
            >
              <View className="flex-row items-center gap-2">
                <Search
                  size={16}
                  color={activeTab === "search" ? "#f97316" : "#9ca3af"}
                />
                <Text
                  className={`text-sm font-semibold ${
                    activeTab === "search" ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  Search
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === "import"
                  ? "border-orange-500"
                  : "border-transparent"
              }`}
              onPress={() => setActiveTab("import")}
            >
              <View className="flex-row items-center gap-2">
                <Upload
                  size={16}
                  color={activeTab === "import" ? "#f97316" : "#9ca3af"}
                />
                <Text
                  className={`text-sm font-semibold ${
                    activeTab === "import" ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  Import
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {activeTab === "search" && (
            <SearchTab
              onClose={() => onOpenChange(false)}
              onSelectUser={setSelectedUserId}
            />
          )}

          {activeTab === "import" && (
            <ImportTab onClose={() => onOpenChange(false)} />
          )}
        </ScrollView>
      </Dialog>

      {/* Confirmation dialog - rendered outside main dialog with higher z-index */}
      <Dialog
        visible={selectedUserId !== null}
        onClose={() => {
          setSelectedUserId(null);
          setMessage("");
        }}
        className="z-[200]"
      >
        <View className="space-y-4">
          <View className="space-y-1">
            <Text className="text-lg font-bold text-white">
              Send Friend Request
            </Text>
            <Text className="text-sm text-gray-400">
              Add an optional message with your request
            </Text>
          </View>
          <View className="space-y-2">
            <Label>Message (optional)</Label>
            <Textarea
              placeholder="Let's hunt together!"
              value={message}
              onChangeText={setMessage}
            />
          </View>
          <View className="flex-row gap-2 pt-2">
            <Button
              type="outline"
              onPress={() => {
                setSelectedUserId(null);
                setMessage("");
              }}
              className="flex-1"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </Button>
            <Button
              type="primary"
              onPress={() => {
                if (selectedUserId) {
                  handleSendRequest(selectedUserId, message, () => {
                    setSelectedUserId(null);
                    setMessage("");
                    onOpenChange(false);
                  });
                }
              }}
              className="flex-1"
            >
              <Text className="text-white font-semibold">Send Request</Text>
            </Button>
          </View>
        </View>
      </Dialog>
    </>
  );
}

function SearchTab({
  onClose,
  onSelectUser,
}: {
  onClose: () => void;
  onSelectUser: (userId: Id<"users">) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const searchResults = useQuery(
    api.friends.searchUsers,
    debouncedSearch.trim().length >= 2
      ? { searchTerm: debouncedSearch }
      : "skip"
  );

  return (
    <View className="space-y-4">
      <View className="space-y-2 pr-0.5">
        <Label>Search by name, username, email, or phone</Label>
        <View className="relative">
          <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Search size={16} color="#9ca3af" />
          </View>
          <Input
            placeholder="Type to search..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="pl-9"
          />
        </View>
      </View>

      {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
        <Text className="text-sm text-gray-400">
          Type at least 2 characters to search
        </Text>
      )}

      {debouncedSearch.trim().length >= 2 && (
        <ScrollView
          className="max-h-[300px]"
          showsVerticalScrollIndicator={true}
        >
          <View className="space-y-2">
            {searchResults === undefined ? (
              <View className="py-8 items-center">
                <Text className="text-sm text-gray-400">Searching...</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-sm text-gray-400">No users found</Text>
              </View>
            ) : (
              searchResults.map((user) => (
                <View
                  key={user._id}
                  className="p-3 mt-2 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1" style={{ minWidth: 0 }}>
                      <Text
                        className="font-medium text-white"
                        numberOfLines={1}
                      >
                        {user.name || "Unknown"}
                      </Text>
                      {user.username && (
                        <View className="flex-row items-center gap-1 mt-1">
                          <User size={12} color="#9ca3af" />
                          <Text
                            className="text-xs text-gray-400"
                            numberOfLines={1}
                          >
                            @{user.username}
                          </Text>
                        </View>
                      )}
                      {user.email && (
                        <View className="flex-row items-center gap-1 mt-1">
                          <Mail size={12} color="#9ca3af" />
                          <Text
                            className="text-xs text-gray-400"
                            numberOfLines={1}
                          >
                            {user.email}
                          </Text>
                        </View>
                      )}
                      {user.phoneNumber && (
                        <View className="flex-row items-center gap-1 mt-1">
                          <Phone size={12} color="#9ca3af" />
                          <Text className="text-xs text-gray-400">
                            {user.phoneNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Button
                      type="primary"
                      onPress={() => onSelectUser(user._id)}
                    >
                      <UserPlus size={16} color="#fff" />
                    </Button>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function ImportTab({ onClose }: { onClose: () => void }) {
  const [contacts, setContacts] = useState("");
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState<
    Array<{ _id: Id<"users">; contact: string }>
  >([]);

  const searchResults = useQuery(
    api.friends.searchUsers,
    searchTerm.trim().length >= 2 ? { searchTerm } : "skip"
  );
  const sendRequest = useMutation(api.friends.sendFriendRequestById);

  const handleImport = () => {
    const lines = contacts.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      showToast("Please enter at least one contact");
      return;
    }

    // Search for first contact
    setSearchTerm(lines[0].trim());
    setImporting(true);
  };

  // When search results update, process them
  const handleSearchComplete = async () => {
    if (!importing || !searchResults) return;

    const lines = contacts.split("\n").filter((line) => line.trim());
    const currentIndex = foundUsers.length;

    if (currentIndex >= lines.length) {
      // Done processing all contacts
      if (foundUsers.length > 0) {
        // Send requests
        let successCount = 0;
        for (const user of foundUsers) {
          try {
            await sendRequest({ toUserId: user._id });
            successCount++;
          } catch (error) {
            console.error(`Failed to send request to ${user.contact}`);
          }
        }

        showToast(`Sent ${successCount} friend request(s)`);
        setContacts("");
        setFoundUsers([]);
        onClose();
      } else {
        showToast("No matching users found");
      }
      setImporting(false);
      setSearchTerm("");
      return;
    }

    // Process current search result
    if (searchResults.length > 0) {
      setFoundUsers((prev) => [
        ...prev,
        { _id: searchResults[0]._id, contact: lines[currentIndex] },
      ]);
    }

    // Search for next contact
    if (currentIndex + 1 < lines.length) {
      setSearchTerm(lines[currentIndex + 1].trim());
    } else {
      // Trigger completion
      setTimeout(() => handleSearchComplete(), 100);
    }
  };

  // Trigger when search results change
  useEffect(() => {
    if (importing && searchResults !== undefined && searchTerm) {
      handleSearchComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, importing]);

  return (
    <View className="flex flex-col gap-2">
      <View className="space-y-2 pr-0.5">
        <Label>Paste Contacts</Label>
        <Textarea
          placeholder="Enter emails, usernames, or phone numbers (one per line)"
          value={contacts}
          onChangeText={setContacts}
        />
        <Text className="text-xs text-gray-400">
          Enter one contact per line. We'll search for matching users and send
          friend requests.
        </Text>
      </View>

      <Button
        type="primary"
        onPress={handleImport}
        disabled={importing || !contacts.trim()}
        className="w-full"
      >
        <Text className="text-white font-semibold">
          {importing
            ? `Importing... (${foundUsers.length} found)`
            : "Import & Send Requests"}
        </Text>
      </Button>

      <View className="space-y-2 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
        <Text className="text-sm font-medium text-white">
          How to get your contacts:
        </Text>
        <View className="space-y-1">
          <Text className="text-xs text-gray-400">
            • Export from your phone's contacts app
          </Text>
          <Text className="text-xs text-gray-400">
            • Copy from your email address book
          </Text>
          <Text className="text-xs text-gray-400">
            • Ask friends for their username or email
          </Text>
        </View>
      </View>
    </View>
  );
}
