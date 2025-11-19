import { useAuth } from "@/hooks/use-auth";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SignInModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SignInModal({ visible, onClose }: SignInModalProps) {
  const { signIn } = useAuth();
  const router = useRouter();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      console.log("[SignInModal] Starting Google sign-in...");
      setIsLoading(true);
      await signIn("google");
      console.log("[SignInModal] Google sign-in successful");
      onClose();
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      console.error("[SignInModal] Google sign-in error:", error);
      Alert.alert("Error", "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      console.log("[SignInModal] Starting email sign-in...");
      setIsLoading(true);
      await signIn("password", { email, password });
      console.log("[SignInModal] Email sign-in successful");
      onClose();
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      console.error("[SignInModal] Email sign-in error:", error);
      Alert.alert("Error", "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowEmailForm(false);
    setEmail("");
    setPassword("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-4"
        onPress={handleClose}
      >
        <View
          className="w-full max-w-sm"
          onStartShouldSetResponder={() => true}
        >
          <View className="bg-gray-900 rounded-2xl w-full p-6 relative">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-white">Sign In</Text>
              <TouchableOpacity onPress={handleClose}>
                <AntDesign name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Subtitle */}
            <Text className="text-gray-400 mb-6">
              Choose how you'd like to sign in
            </Text>

            {!showEmailForm ? (
              <>
                {/* Google Button */}
                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                  className="flex-row items-center justify-center border border-orange-500 rounded-lg py-2 mb-4 bg-gray-800"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <AntDesign name="google" size={24} color="#fff" />
                      <Text className="ml-2 text-white">
                        Continue with Google
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Email Button */}
                <TouchableOpacity
                  onPress={() => setShowEmailForm(true)}
                  disabled={isLoading}
                  className="flex-row items-center justify-center border border-gray-700 rounded-lg py-2 bg-gray-800"
                >
                  <MaterialIcons name="email" size={24} color="#fff" />
                  <Text className="ml-2 text-white">Continue with Email</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Back button */}
                <TouchableOpacity
                  onPress={() => setShowEmailForm(false)}
                  className="mb-4 flex-row items-center gap-2 max-w-[50px]"
                >
                  <AntDesign name="arrow-left" size={10} color="#f97316" />
                  <Text className="text-orange-500 text-base">Back</Text>
                </TouchableOpacity>

                {/* Email Form */}
                <View className="mb-4">
                  <Text className="text-white text-sm font-medium mb-2">
                    Email
                  </Text>
                  <TextInput
                    className="border border-gray-700 bg-gray-800 text-white rounded-lg px-4 py-3"
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-white text-sm font-medium mb-2">
                    Password
                  </Text>
                  <TextInput
                    className="border border-gray-700 bg-gray-800 text-white rounded-lg px-4 py-3"
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleEmailSignIn}
                  disabled={isLoading}
                  className="bg-orange-500 rounded-lg py-4 items-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-black font-semibold text-base">
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
