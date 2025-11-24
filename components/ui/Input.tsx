import clsx from "clsx";
import { TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  className = "",
  ...rest
}: InputProps) {
  return (
    <TextInput
      className={clsx(
        "border border-gray-600 px-3 py-2 rounded-lg text-base bg-gray-700 text-white",
        className
      )}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      {...rest}
    />
  );
}

