import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/convex/_generated/api.js";
import { useAction } from "convex/react";
import {
  ChevronRight,
  Droplets,
  Gauge,
  RefreshCw,
  Sunrise,
  Sunset,
  Wind,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  condition: string;
  windSpeed: number;
  windDirection: number;
  windGust?: number;
  sunrise: number;
  sunset: number;
  location: string;
  country: string;
  timestamp: number;
  units: string;
}

interface ForecastData {
  location: string;
  country: string;
  forecast: Array<{
    timestamp: number;
    dateTime: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    description: string;
    icon: string;
    condition: string;
    windSpeed: number;
    windDirection: number;
    windGust?: number;
    precipitationProbability: number;
  }>;
  units: string;
}

interface WeatherPanelProps {
  lat: number;
  lng: number;
  onClose: () => void;
}

function WindDirectionArrow({ degrees }: { degrees: number }) {
  return (
    <View className="relative w-12 h-12 flex items-center justify-center">
      <View
        className="absolute w-0.5 h-5 bg-orange-500"
        style={{
          transform: [{ rotate: `${degrees}deg` }],
        }}
      >
        <View className="absolute -top-1 left-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-orange-500" />
      </View>
      <Text className="absolute text-xs text-gray-400">
        {Math.round(degrees)}°
      </Text>
    </View>
  );
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export default function WeatherPanel({ lat, lng, onClose }: WeatherPanelProps) {
  const getCurrentWeather = useAction(api.weather.getCurrentWeather);
  const getForecast = useAction(api.weather.getForecast);

  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null
  );
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);

  const loadWeatherData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [weather, forecastData] = await Promise.all([
        getCurrentWeather({ lat, lng, units: "imperial" }),
        getForecast({ lat, lng, units: "imperial" }),
      ]);
      setCurrentWeather(weather);
      setForecast(forecastData);
    } catch (error) {
      console.error("Failed to load weather:", error);
    } finally {
      setIsLoading(false);
    }
  }, [lat, lng, getCurrentWeather, getForecast]);

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  return (
    <View className="absolute top-0 right-0 bottom-0 w-full bg-gray-900 border-l border-gray-700 z-[1000]">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
        <Text className="text-lg font-bold text-white">Weather Forecast</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={loadWeatherData}
            disabled={isLoading}
            className="p-2"
          >
            <RefreshCw
              size={20}
              color="#fff"
              style={isLoading ? { opacity: 0.5 } : {}}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {isLoading ? (
          <View className="p-4 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </View>
        ) : currentWeather ? (
          <View className="p-4 space-y-6">
            {/* Current Weather */}
            <View className="space-y-2">
              <Text className="text-sm text-gray-400">
                {currentWeather.location}, {currentWeather.country}
              </Text>
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-5xl font-bold text-white">
                    {currentWeather.temperature}°F
                  </Text>
                  <Text className="text-sm text-gray-400 mt-1 capitalize">
                    {currentWeather.description}
                  </Text>
                  <Text className="text-sm text-gray-400">
                    Feels like {currentWeather.feelsLike}°F
                  </Text>
                </View>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`,
                  }}
                  className="w-20 h-20"
                />
              </View>
            </View>

            {/* Wind Information */}
            <View className="border border-gray-700 rounded-lg p-4">
              <View className="flex-row items-center gap-2 mb-3">
                <Wind size={16} color="#fff" />
                <Text className="font-semibold text-white">
                  Wind Conditions
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="space-y-1">
                  <Text className="text-sm text-gray-400">Speed</Text>
                  <Text className="text-2xl font-bold text-white">
                    {currentWeather.windSpeed} mph
                  </Text>
                  {currentWeather.windGust && (
                    <Text className="text-xs text-gray-400">
                      Gusts up to {currentWeather.windGust} mph
                    </Text>
                  )}
                  <Text className="text-sm font-medium mt-2 text-white">
                    {getWindDirection(currentWeather.windDirection)}
                  </Text>
                </View>
                <WindDirectionArrow degrees={currentWeather.windDirection} />
              </View>
            </View>

            {/* Additional Info */}
            <View className="flex-row gap-4">
              <View className="flex-1 border border-gray-700 rounded-lg p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Droplets size={16} color="#9ca3af" />
                  <Text className="text-xs text-gray-400">Humidity</Text>
                </View>
                <Text className="text-2xl font-bold text-white">
                  {currentWeather.humidity}%
                </Text>
              </View>
              <View className="flex-1 border border-gray-700 rounded-lg p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Gauge size={16} color="#9ca3af" />
                  <Text className="text-xs text-gray-400">Pressure</Text>
                </View>
                <Text className="text-2xl font-bold text-white">
                  {Math.round(currentWeather.pressure * 0.02953)} inHg
                </Text>
              </View>
            </View>

            {/* Sunrise/Sunset */}
            <View className="border border-gray-700 rounded-lg p-4">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Sunrise size={16} color="#9ca3af" />
                    <Text className="text-xs text-gray-400">Sunrise</Text>
                  </View>
                  <Text className="font-semibold text-white">
                    {new Date(currentWeather.sunrise * 1000).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Sunset size={16} color="#9ca3af" />
                    <Text className="text-xs text-gray-400">Sunset</Text>
                  </View>
                  <Text className="font-semibold text-white">
                    {new Date(currentWeather.sunset * 1000).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* 5-Day Forecast Toggle */}
            <Button
              type="outline"
              className="w-full"
              onPress={() => setShowForecast(!showForecast)}
            >
              <Text className="text-white">
                {showForecast ? "Hide" : "View"} 5-Day Forecast
              </Text>
              <ChevronRight
                size={16}
                color="#fff"
                style={{
                  transform: [{ rotate: showForecast ? "90deg" : "0deg" }],
                }}
              />
            </Button>

            {/* Hourly Forecast */}
            {showForecast && forecast && (
              <View className="border border-gray-700 rounded-lg p-4 space-y-3">
                <Text className="font-semibold text-white">
                  Hourly Forecast
                </Text>
                <View className="space-y-2">
                  {forecast.forecast.slice(0, 16).map((item, index) => {
                    const date = new Date(item.timestamp * 1000);
                    const isNewDay =
                      index === 0 ||
                      new Date(
                        forecast.forecast[index - 1].timestamp * 1000
                      ).getDate() !== date.getDate();

                    return (
                      <View key={item.timestamp}>
                        {isNewDay && (
                          <Text className="text-xs font-semibold text-gray-400 mt-3 mb-1">
                            {date.toLocaleDateString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        )}
                        <View className="flex-row items-center justify-between py-2 border-b border-gray-700">
                          <View className="flex-row items-center gap-3">
                            <Text className="text-sm font-medium w-16 text-white">
                              {date.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </Text>
                            <Image
                              source={{
                                uri: `https://openweathermap.org/img/wn/${item.icon}.png`,
                              }}
                              className="w-10 h-10"
                            />
                            <View className="flex-1">
                              <Text className="text-sm font-medium text-white">
                                {item.temperature}°F
                              </Text>
                              <Text className="text-xs text-gray-400 capitalize">
                                {item.description}
                              </Text>
                            </View>
                          </View>
                          <View className="items-end">
                            <View className="flex-row items-center gap-1">
                              <Wind size={12} color="#9ca3af" />
                              <Text className="text-xs text-gray-400">
                                {item.windSpeed} mph{" "}
                                {getWindDirection(item.windDirection)}
                              </Text>
                            </View>
                            {item.precipitationProbability > 0 && (
                              <View className="flex-row items-center gap-1 mt-1">
                                <Droplets size={12} color="#3b82f6" />
                                <Text className="text-xs text-blue-400">
                                  {item.precipitationProbability}%
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View className="p-4 items-center">
            <Text className="text-gray-400">Failed to load weather data</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
