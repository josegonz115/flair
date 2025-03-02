import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/IconSymbol";

export default function BrowsePage() {
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1">
                <View className="px-4 py-6">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-2xl font-bold dark:text-white">
                            Discover
                        </Text>
                        <IconSymbol size={24} name="bell" color="#000" />
                    </View>

                    {/* Search bar placeholder */}
                    <View className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-3 mb-6 flex-row items-center">
                        <IconSymbol
                            size={20}
                            name="magnifyingglass"
                            color="#666"
                        />
                        <Text className="ml-2 text-gray-500 dark:text-gray-400">
                            Search styles, items...
                        </Text>
                    </View>

                    {/* Featured section */}
                    <View className="mb-8">
                        <Text className="text-lg font-semibold mb-4 dark:text-white">
                            Featured Looks
                        </Text>
                        <View className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mb-2" />
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            Spring Collection 2025
                        </Text>
                    </View>

                    {/* Trending section */}
                    <View>
                        <Text className="text-lg font-semibold mb-4 dark:text-white">
                            Trending Now
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        >
                            {[1, 2, 3, 4].map((item) => (
                                <View key={item} className="w-32 mr-4">
                                    <View className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                                    <Text className="text-sm dark:text-white">
                                        Style #{item}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
