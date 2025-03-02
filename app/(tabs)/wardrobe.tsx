import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/IconSymbol";

export default function WardrobePage() {
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
                    <ScrollView className="flex-1">
                        <View className="px-4 py-6">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-2xl font-bold dark:text-white">
                                    Profile
                                </Text>
                                <TouchableOpacity>
                                    <IconSymbol size={24} name="gear" color="#000" />
                                </TouchableOpacity>
                            </View>
        
                            {/* Profile header */}
                            <View className="items-center py-6">
                                <View className="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-700 mb-4" />
                                <Text className="text-xl font-bold dark:text-white">
                                    Alex Johnson
                                </Text>
                                <Text className="text-gray-500 dark:text-gray-400">
                                    @alexfashion
                                </Text>
                            </View>
        
                            {/* Stats */}
                            <View className="flex-row justify-around py-4 mb-6 border-y border-gray-200 dark:border-gray-800">
                                <View className="items-center">
                                    <Text className="text-lg font-bold dark:text-white">
                                        42
                                    </Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        Items
                                    </Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-lg font-bold dark:text-white">
                                        12
                                    </Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        Outfits
                                    </Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-lg font-bold dark:text-white">
                                        156
                                    </Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        Followers
                                    </Text>
                                </View>
                            </View>
        
                            {/* Recent Outfits */}
                            <View className="mb-6">
                                <Text className="text-lg font-semibold mb-4 dark:text-white">
                                    Recent Outfits
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {[1, 2, 3].map((item) => (
                                        <View key={item} className="mr-4">
                                            <View className="h-48 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                                            <Text className="text-sm dark:text-white">
                                                Outfit #{item}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
        
                            {/* Activity */}
                            <View>
                                <Text className="text-lg font-semibold mb-4 dark:text-white">
                                    Activity
                                </Text>
                                {[1, 2, 3].map((item) => (
                                    <View
                                        key={item}
                                        className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-800"
                                    >
                                        <View className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3" />
                                        <View className="flex-1">
                                            <Text className="dark:text-white">
                                                You added a new item to your closet
                                            </Text>
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                                2 days ago
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
    );
}