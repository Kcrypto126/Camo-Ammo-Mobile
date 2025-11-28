import { View, Text } from "react-native";

interface EmptyProps {
  children: React.ReactNode;
}

interface EmptyHeaderProps {
  children: React.ReactNode;
}

interface EmptyMediaProps {
  variant?: "icon" | "image";
  children: React.ReactNode;
}

interface EmptyTitleProps {
  children: React.ReactNode;
}

interface EmptyDescriptionProps {
  children: React.ReactNode;
}

interface EmptyContentProps {
  children: React.ReactNode;
}

export function Empty({ children }: EmptyProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      {children}
    </View>
  );
}

export function EmptyHeader({ children }: EmptyHeaderProps) {
  return <View className="items-center gap-2">{children}</View>;
}

export function EmptyMedia({ children }: EmptyMediaProps) {
  return <View className="mb-4">{children}</View>;
}

export function EmptyTitle({ children }: EmptyTitleProps) {
  return <Text className="text-lg font-semibold text-white">{children}</Text>;
}

export function EmptyDescription({ children }: EmptyDescriptionProps) {
  return <Text className="text-center text-sm text-gray-400">{children}</Text>;
}

export function EmptyContent({ children }: EmptyContentProps) {
  return <View className="mt-4">{children}</View>;
}

