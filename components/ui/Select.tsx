import clsx from "clsx";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SelectProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={clsx(
          "border border-gray-600 px-4 py-2 rounded-lg bg-gray-700 flex-row items-center justify-between",
          className
        )}
      >
        <Text className={value ? "text-white" : "text-gray-400"}>
          {value || placeholder}
        </Text>
        <Text className="text-gray-400">▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/70 justify-center items-center"
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            className="w-11/12 max-h-[70%] bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="px-4 py-3 border-b border-gray-700 bg-gray-800">
              <Text className="text-white text-lg font-bold">
                {placeholder || "Select"}
              </Text>
            </View>
            <ScrollView
              className="max-h-[400px]"
              showsVerticalScrollIndicator={true}
            >
              {options.map((option, index) => {
                const isSelected = value === option;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelect(option)}
                    className={clsx(
                      "px-4 py-4 border-b border-gray-800",
                      isSelected && "bg-[#ff6800]"
                    )}
                    activeOpacity={0.6}
                  >
                    <Text
                      className={clsx(
                        "text-base",
                        isSelected
                          ? "text-white font-bold"
                          : "text-white font-normal"
                      )}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
