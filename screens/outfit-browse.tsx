"use client";

import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Filter } from "lucide-react-native";

import SearchBar from "../components/search-bar";
import CategoryPill from "../components/category-pill";
import OutfitCard from "../components/outfit-card";
import { useBrowseStore, type Outfit } from "../store/browse-store";

// Categories for outfits
const OUTFIT_CATEGORIES = [
    "All",
    "Casual",
    "Formal",
    "Work",
    "Weekend",
    "Favorites",
];

export default function OutfitBrowseScreen() {
    const { outfits, likedOutfits, toggleLikeOutfit } = useBrowseStore();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter outfits based on selected category and search query
    const filteredOutfits = outfits
        .filter((outfit) => {
            if (selectedCategory === "Favorites") {
                return likedOutfits.includes(outfit.id);
            }
            return (
                selectedCategory === "All" ||
                outfit.name.includes(selectedCategory)
            );
        })
        .filter(
            (outfit) =>
                searchQuery === "" ||
                outfit.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleOutfitPress = (outfit: Outfit) => {
        // Navigate to outfit detail screen
        console.log("Outfit pressed:", outfit.name);
    };

    const handleLikeOutfit = (outfitId: number) => {
        toggleLikeOutfit(outfitId);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-2">
                <Text className="text-2xl font-bold mb-4">Outfit Ideas</Text>

                {/* Search bar */}
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={() => setSearchQuery("")}
                    placeholder="Search outfits..."
                />

                {/* Category filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4"
                >
                    {OUTFIT_CATEGORIES.map((category) => (
                        <CategoryPill
                            key={category}
                            label={category}
                            isSelected={selectedCategory === category}
                            onPress={() => setSelectedCategory(category)}
                        />
                    ))}
                </ScrollView>

                {/* Filter button */}
                <View className="flex-row justify-end mb-4">
                    <TouchableOpacity className="flex-row items-center bg-gray-200 px-3 py-2 rounded-lg">
                        <Filter size={18} color="black" />
                        <Text className="ml-1">Filter</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Outfits grid */}
            <ScrollView className="flex-1 px-4">
                {filteredOutfits.length > 0 ? (
                    filteredOutfits.map((outfit) => (
                        <OutfitCard
                            key={outfit.id}
                            outfit={{
                                ...outfit,
                                liked: likedOutfits.includes(outfit.id),
                            }}
                            onPress={() => handleOutfitPress(outfit)}
                            onLike={() => handleLikeOutfit(outfit.id)}
                        />
                    ))
                ) : (
                    <View className="flex-1 items-center justify-center py-10">
                        <Text className="text-gray-500">No outfits found</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
