import clsx from "clsx";
import { isValidElement } from "react";
import { Text, View } from "react-native";

interface BadgeProps {
  children: React.ReactNode;
  type?: "default" | "destructive" | "secondary" | "success";
  className?: string;
}

export function Badge({ children, type = "default", className }: BadgeProps) {
  let bgClass = "bg-gray-700/80 border border-gray-600";
  let textClass = "text-gray-200";
  if (type === "destructive") {
    bgClass = "bg-red-500/30 border border-red-500/50";
    textClass = "text-red-300";
  }
  if (type === "secondary") {
    bgClass = "bg-amber-500/30 border border-amber-500/50";
    textClass = "text-amber-300";
  }
  if (type === "success") {
    bgClass = "bg-green-500/30 border border-green-500/50";
    textClass = "text-green-300";
  }
  if (type === "default") {
    bgClass = "bg-orange-500/30 border border-orange-500/50";
    textClass = "text-orange-300";
  }

  // Check if children contains View components (for icons)
  const hasView = isValidElement(children) && children.type === View;
  const isSimple = typeof children === "string" || typeof children === "number";

  // Use View wrapper if children contains View, otherwise use Text
  if (hasView || (!isSimple && isValidElement(children))) {
    return (
      <View
        className={clsx(
          "rounded-full px-2 py-1 flex-row items-center justify-center gap-1.5 border",
          bgClass,
          className
        )}
      >
        {children}
      </View>
    );
  }

  // Simple text badge
  return (
    <Text
      className={clsx(
        "rounded-full px-2.5 py-1 text-xs font-semibold border",
        bgClass,
        textClass,
        className
      )}
      numberOfLines={1}
    >
      {children}
    </Text>
  );
}
