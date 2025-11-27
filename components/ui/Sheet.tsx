import clsx from "clsx";
import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  View,
} from "react-native";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface SheetContentProps {
  side?: "left" | "right" | "top" | "bottom";
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null;
  
  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={() => onOpenChange(false)}
    >
      <View className="flex-1">
        {children}
      </View>
    </Modal>
  );
}

export function SheetContent({
  side = "right",
  children,
  className = "",
  onClose,
}: SheetContentProps) {
  const slideAnim = useRef(
    new Animated.Value(side === "right" ? 1 : side === "left" ? -1 : 0)
  ).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getTransform = () => {
    if (side === "right") {
      return {
        translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1000],
        }),
      };
    } else if (side === "left") {
      return {
        translateX: slideAnim.interpolate({
          inputRange: [-1, 0],
          outputRange: [-1000, 0],
        }),
      };
    } else if (side === "top") {
      return {
        translateY: slideAnim.interpolate({
          inputRange: [-1, 0],
          outputRange: [-1000, 0],
        }),
      };
    } else {
      return {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1000],
        }),
      };
    }
  };

  const getPositionClasses = () => {
    if (side === "right") {
      return "top-0 right-0 bottom-0";
    } else if (side === "left") {
      return "top-0 left-0 bottom-0";
    } else if (side === "top") {
      return "top-0 left-0 right-0";
    } else {
      return "bottom-0 left-0 right-0";
    }
  };

  const getWidthHeightClasses = () => {
    if (side === "right" || side === "left") {
      return "w-full max-w-lg";
    } else {
      return "h-3/4";
    }
  };

  return (
    <View className="flex-1">
      <Pressable
        className="absolute top-0 left-0 right-0 bottom-0 bg-black/50"
        onPress={onClose}
      />
      <Animated.View
        className={clsx(
          "absolute bg-gray-900 border border-gray-700",
          getPositionClasses(),
          getWidthHeightClasses(),
          className
        )}
        style={{
          transform: [getTransform()],
          opacity: opacityAnim,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
