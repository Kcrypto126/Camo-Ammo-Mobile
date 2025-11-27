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
  
  // Extract z-index from className if provided, otherwise use default
  const hasCustomZIndex = className?.includes("z-");
  const defaultZIndex = 100;
  const zIndexStyle = hasCustomZIndex ? {} : { zIndex: defaultZIndex };
  
  return (
    <View
      className={clsx(
        "absolute top-0 left-0 right-0 bottom-0 bg-black/50 justify-center items-center",
        !hasCustomZIndex && "z-[100]",
        className
      )}
      style={zIndexStyle}
    >
      <View className="bg-gray-800 border border-gray-700 p-5 rounded-xl w-11/12 relative">
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-2 right-2 p-2 z-10"
        >
          <View className="bg-gray-700 rounded-full w-8 h-8 items-center justify-center">
            <Text className="text-lg font-bold text-white">✕</Text>
          </View>
        </TouchableOpacity>
        {children}
      </View>
    </View>
  );
}
