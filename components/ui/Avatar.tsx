import { Image, Text, View } from "react-native";
import { useState } from "react";

interface AvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
  size?: number;
}

export function Avatar({
  src,
  fallback,
  className = "",
  size = 24,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = !src || hasError;

  return (
    <View
      className={`${className} rounded-full overflow-hidden bg-gray-700 items-center justify-center`}
      style={{ width: size, height: size }}
    >
      {!showFallback && src ? (
        <Image
          source={{ uri: src }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <Text
          className="text-white font-semibold"
          style={{ fontSize: size * 0.4 }}
        >
          {fallback || "?"}
        </Text>
      )}
    </View>
  );
}

// Export for compatibility with existing code
export function AvatarImage({ src, className = "" }: { src?: string; className?: string }) {
  return null; // Not used in simplified version
}

export function AvatarFallback({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return null; // Not used in simplified version
}
