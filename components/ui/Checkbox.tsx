import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  tintColor?: string;
  boxType?: "square" | "circle";
  style?: any;
}

export function Checkbox({
  value,
  onValueChange,
  disabled = false,
  tintColor = "#1e6b3a",
  boxType = "square",
  style,
}: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      activeOpacity={0.7}
      style={style}
    >
      <View
        className={`${
          boxType === "circle" ? "rounded-full" : "rounded"
        } border-2 items-center justify-center`}
        style={{
          width: 24,
          height: 24,
          borderColor: value ? tintColor : "#888",
          backgroundColor: value ? tintColor : "transparent",
        }}
      >
        {value && (
          <Ionicons
            name="checkmark"
            size={16}
            color="#fff"
            style={{ fontWeight: "bold" }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
