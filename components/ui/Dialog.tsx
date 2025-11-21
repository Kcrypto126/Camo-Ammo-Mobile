import clsx from "clsx";
import { Text, TouchableOpacity, View } from "react-native";

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ visible, onClose, children, className }: DialogProps) {
  if (!visible) return null;
  return (
    <View
      className={clsx(
        "absolute top-0 left-0 right-0 bottom-0 bg-black/30 justify-center items-center z-50",
        className
      )}
    >
      <View className="bg-white dark:bg-gray-900 p-5 rounded-xl w-11/12">
        {children}
      </View>
      <TouchableOpacity
        onPress={onClose}
        className="absolute top-0 right-0 p-4"
      >
        <Text className="text-lg font-bold text-gray-400">✕</Text>
      </TouchableOpacity>
    </View>
  );
}

