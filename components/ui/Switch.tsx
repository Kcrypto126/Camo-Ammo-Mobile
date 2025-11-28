import { Switch as RNSwitch } from "react-native";

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Switch({ value, onValueChange, disabled }: SwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: "#4b5563", true: "#ff6800" }}
      thumbColor={value ? "#ffffff" : "#9ca3af"}
    />
  );
}

