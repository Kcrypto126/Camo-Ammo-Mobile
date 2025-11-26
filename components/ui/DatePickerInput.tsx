import { format } from "date-fns";
import { Calendar } from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DatePickerInputProps {
  value?: string; // YYYY-MM-DD format
  onChange: (date: string) => void; // Returns YYYY-MM-DD format
  placeholder?: string;
  className?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  minimumDate,
  maximumDate,
}: DatePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  const displayValue = value
    ? format(new Date(value), "yyyy-MM-dd")
    : placeholder;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    onChange(formattedDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    // Reset to original value
    if (value) {
      setSelectedDate(new Date(value));
    }
    setShowPicker(false);
  };

  // Generate date options (years, months, days)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const selectedDay = selectedDate.getDate();
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleYearChange = (year: number) => {
    const newDate = new Date(
      year,
      selectedMonth,
      Math.min(selectedDay, getDaysInMonth(year, selectedMonth))
    );
    if (minimumDate && newDate < minimumDate) {
      setSelectedDate(minimumDate);
    } else if (maximumDate && newDate > maximumDate) {
      setSelectedDate(maximumDate);
    } else {
      setSelectedDate(newDate);
    }
  };

  const handleMonthChange = (month: number) => {
    const newDate = new Date(
      selectedYear,
      month,
      Math.min(selectedDay, getDaysInMonth(selectedYear, month))
    );
    if (minimumDate && newDate < minimumDate) {
      setSelectedDate(minimumDate);
    } else if (maximumDate && newDate > maximumDate) {
      setSelectedDate(maximumDate);
    } else {
      setSelectedDate(newDate);
    }
  };

  const handleDayChange = (day: number) => {
    const newDate = new Date(selectedYear, selectedMonth, day);
    if (minimumDate && newDate < minimumDate) {
      setSelectedDate(minimumDate);
    } else if (maximumDate && newDate > maximumDate) {
      setSelectedDate(maximumDate);
    } else {
      setSelectedDate(newDate);
    }
  };

  // Filter dates based on min/max constraints
  const availableYears = years.filter((year) => {
    if (minimumDate && year < minimumDate.getFullYear()) return false;
    if (maximumDate && year > maximumDate.getFullYear()) return false;
    return true;
  });

  const availableMonths = months
    .map((_, index) => index)
    .filter((monthIndex) => {
      const testDate = new Date(selectedYear, monthIndex, 1);
      if (minimumDate && testDate < minimumDate) {
        if (
          selectedYear === minimumDate.getFullYear() &&
          monthIndex < minimumDate.getMonth()
        ) {
          return false;
        }
      }
      if (maximumDate && testDate > maximumDate) {
        if (
          selectedYear === maximumDate.getFullYear() &&
          monthIndex > maximumDate.getMonth()
        ) {
          return false;
        }
      }
      return true;
    });

  const availableDays = days.filter((day) => {
    const testDate = new Date(selectedYear, selectedMonth, day);
    if (minimumDate && testDate < minimumDate) return false;
    if (maximumDate && testDate > maximumDate) return false;
    return true;
  });

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className={`border border-gray-600 px-3 py-2 rounded-lg flex-row items-center justify-between bg-gray-700 ${className}`}
        activeOpacity={0.7}
      >
        <Text className={value ? "text-white" : "text-gray-400"}>
          {displayValue}
        </Text>
        <Calendar size={18} color={value ? "#f97316" : "#9ca3af"} />
      </TouchableOpacity>

      {showPicker && (
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={handleCancel}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-center items-center"
            onPress={handleCancel}
          >
            <Pressable
              className="bg-gray-800 border border-gray-700 rounded-xl w-11/12 max-w-md"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="p-4">
                <Text className="text-white text-lg font-bold mb-4">
                  Select Date
                </Text>

                {/* Date Display */}
                <View className="bg-gray-700 rounded-lg p-4 mb-4 items-center">
                  <Text className="text-white text-2xl font-bold">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </Text>
                </View>

                {/* Date Pickers */}
                <View className="flex-row gap-2 mb-4">
                  {/* Month Picker */}
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs mb-2">Month</Text>
                    <ScrollView
                      className="bg-gray-700 rounded-lg"
                      style={{ maxHeight: 150 }}
                      showsVerticalScrollIndicator={true}
                    >
                      {availableMonths.map((monthIndex) => (
                        <TouchableOpacity
                          key={monthIndex}
                          onPress={() => handleMonthChange(monthIndex)}
                          className={`py-2 px-3 ${
                            selectedMonth === monthIndex
                              ? "bg-orange-500"
                              : "bg-transparent"
                          }`}
                        >
                          <Text
                            className={`text-center ${
                              selectedMonth === monthIndex
                                ? "text-white font-bold"
                                : "text-gray-300"
                            }`}
                          >
                            {months[monthIndex].substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Day Picker */}
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs mb-2">Day</Text>
                    <ScrollView
                      className="bg-gray-700 rounded-lg"
                      style={{ maxHeight: 150 }}
                      showsVerticalScrollIndicator={true}
                    >
                      {availableDays.map((day) => (
                        <TouchableOpacity
                          key={day}
                          onPress={() => handleDayChange(day)}
                          className={`py-2 px-3 ${
                            selectedDay === day
                              ? "bg-orange-500"
                              : "bg-transparent"
                          }`}
                        >
                          <Text
                            className={`text-center ${
                              selectedDay === day
                                ? "text-white font-bold"
                                : "text-gray-300"
                            }`}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Year Picker */}
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs mb-2">Year</Text>
                    <ScrollView
                      className="bg-gray-700 rounded-lg"
                      style={{ maxHeight: 150 }}
                      showsVerticalScrollIndicator={true}
                    >
                      {availableYears.map((year) => (
                        <TouchableOpacity
                          key={year}
                          onPress={() => handleYearChange(year)}
                          className={`py-2 px-3 ${
                            selectedYear === year
                              ? "bg-orange-500"
                              : "bg-transparent"
                          }`}
                        >
                          <Text
                            className={`text-center ${
                              selectedYear === year
                                ? "text-white font-bold"
                                : "text-gray-300"
                            }`}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="flex-1 py-3 px-4 bg-gray-700 rounded-lg items-center"
                  >
                    <Text className="text-white font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirm}
                    className="flex-1 py-3 px-4 bg-orange-500 rounded-lg items-center"
                  >
                    <Text className="text-white font-semibold">Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
