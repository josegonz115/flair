"use client";
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, Grid, List } from "lucide-react-native";
import { create } from "zustand";

// Define the store for browse state
interface BrowseStore {
    viewMode: "grid" | "list";
    setViewMode: (mode: "grid" | "list") => void;
    filters: string[];
    addFilter: (filter: string) => void;
    removeFilter: (filter: string) => void;
}

const useBrowseStore = create<BrowseStore>((set) => ({
    viewMode: "grid",
    setViewMode: (mode) => set({ viewMode: mode }),
    filters: [],
    addFilter: (filter) =>
        set((state) => ({
            filters: [...state.filters, filter],
        })),
    removeFilter: (filter) =>
        set((state) => ({
            filters: state.filters.filter((f) => f !== filter),
        })),
}));

// Mock data for clothing items
const CLOTHING_ITEMS = [
    {
        id: 1,
        image: "https://pin.it/2J3cqaYc8",
    },
    {
        id: 2,
        image: "../assets/images/2.jpg",
    },
    {
        id: 3,
        name: "Black Dress",
        category: "Dresses",
        image: "https://via.placeholder.com/150",
    },
    {
        id: 4,
        name: "Leather Jacket",
        category: "Outerwear",
        image: "https://via.placeholder.com/150",
    },
    {
        id: 5,
        name: "Sneakers",
        category: "Shoes",
        image: "https://via.placeholder.com/150",
    },
    {
        id: 6,
        name: "Scarf",
        category: "Accessories",
        image: "https://via.placeholder.com/150",
    },
    {
        id: 7,
        name: "Striped Shirt",
        category: "Tops",
        image: "https://via.placeholder.com/150",
    },
    {
        id: 8,
        name: "Khaki Pants",
        category: "Bottoms",
        image: "https://via.placeholder.com/150",
    },
];

// Filter categories
const CATEGORIES = [
    "by you",
    "feed",
    "grunge",
    "classy",
    "edgy",
    "modern",
    "Accessories",
];

export default function BrowseScreen() {
    const { viewMode, setViewMode } = useBrowseStore();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter items based on selected category
    const filteredItems = CLOTHING_ITEMS.filter(
        (item) =>
            selectedCategory === "All" || item.category === selectedCategory
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-2">
                <Text className="text-2xl font-bold mb-4">Browse</Text>

                {/* Search bar */}
                {/* <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
                    <Search size={20} color="#666" />
                    <Text className="ml-2 text-gray-500">
                        Search your wardrobe...
                    </Text>
                </View> */}

                {/* Category filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4"
                >
                    {CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category}
                            onPress={() => setSelectedCategory(category)}
                            className={`mr-2 px-4 py-2 rounded-full  ${
                                selectedCategory === category
                                    ? "border-2 border-gray-400"
                                    : "bg-gray-200"
                            }`}
                        >
                            <Text
                                className={`${
                                    selectedCategory === category
                                        ? "text-gray-800"
                                        : "text-gray-800"
                                }`}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* View mode toggle and filter button */}
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row bg-gray-200 rounded-lg">
                        {/* <TouchableOpacity
                            onPress={() => setViewMode("grid")}
                            className={`p-2 rounded-l-lg ${
                                viewMode === "grid" ? "bg-black" : ""
                            }`}
                        >
                            <Grid
                                size={20}
                                color={viewMode === "grid" ? "white" : "black"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setViewMode("list")}
                            className={`p-2 rounded-r-lg ${
                                viewMode === "list" ? "bg-black" : ""
                            }`}
                        >
                            <List
                                size={20}
                                color={viewMode === "list" ? "white" : "black"}
                            />
                        </TouchableOpacity> */}
                    </View>

                    {/* <TouchableOpacity className="flex-row items-center bg-gray-200 px-3 py-2 rounded-lg">
                        <Filter size={18} color="black" />
                        <Text className="ml-1">Filter</Text>
                    </TouchableOpacity> */}
                </View>
            </View>

            {/* Clothing items grid/list */}
            <ScrollView className="flex-1 px-4">
                <View
                    className={`flex-1 ${
                        viewMode === "grid"
                            ? "flex-row flex-wrap justify-between"
                            : ""
                    }`}
                >
                    {filteredItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className={`mb-4 ${
                                viewMode === "grid"
                                    ? "w-[48%]"
                                    : "flex-row items-center"
                            }`}
                        >
                            <Image
                                source={{ uri: item.image }}
                                className={`${
                                    viewMode === "grid"
                                        ? "w-full h-40 rounded-lg"
                                        : "w-20 h-20 rounded-lg"
                                }`}
                            />
                            <View
                                className={`${
                                    viewMode === "list" ? "ml-4" : "mt-2"
                                }`}
                            >
                                <Text className="font-medium">{item.name}</Text>
                                <Text className="text-gray-500">
                                    {item.category}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
