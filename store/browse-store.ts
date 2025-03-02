import { create } from "zustand"

export interface ClothingItem {
  id: number
  name: string
  category: string
  image: string
  tags?: string[]
}

export interface Outfit {
  id: number
  name: string
  image: string
  items: number
  liked: boolean
  clothingItems?: number[] // IDs of clothing items in this outfit
}

interface BrowseState {
  // View settings
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void

  // Filters
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Favorites
  likedOutfits: number[]
  toggleLikeOutfit: (outfitId: number) => void

  // Data
  clothingItems: ClothingItem[]
  outfits: Outfit[]
}

export const useBrowseStore = create<BrowseState>((set) => ({
  // View settings
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),

  // Filters
  selectedCategory: "All",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Favorites
  likedOutfits: [2, 5], // Some pre-liked outfits
  toggleLikeOutfit: (outfitId) =>
    set((state) => ({
      likedOutfits: state.likedOutfits.includes(outfitId)
        ? state.likedOutfits.filter((id) => id !== outfitId)
        : [...state.likedOutfits, outfitId],
    })),

  // Mock data
  clothingItems: [
    { id: 1, name: "White T-Shirt", category: "Tops", image: "https://via.placeholder.com/150" },
    { id: 2, name: "Blue Jeans", category: "Bottoms", image: "https://via.placeholder.com/150" },
    { id: 3, name: "Black Dress", category: "Dresses", image: "https://via.placeholder.com/150" },
    { id: 4, name: "Leather Jacket", category: "Outerwear", image: "https://via.placeholder.com/150" },
    { id: 5, name: "Sneakers", category: "Shoes", image: "https://via.placeholder.com/150" },
    { id: 6, name: "Scarf", category: "Accessories", image: "https://via.placeholder.com/150" },
    { id: 7, name: "Striped Shirt", category: "Tops", image: "https://via.placeholder.com/150" },
    { id: 8, name: "Khaki Pants", category: "Bottoms", image: "https://via.placeholder.com/150" },
  ],
  outfits: [
    { id: 1, name: "Casual Friday", image: "https://via.placeholder.com/300", items: 3, liked: false },
    { id: 2, name: "Night Out", image: "https://via.placeholder.com/300", items: 4, liked: true },
    { id: 3, name: "Work Meeting", image: "https://via.placeholder.com/300", items: 5, liked: false },
    { id: 4, name: "Weekend Brunch", image: "https://via.placeholder.com/300", items: 3, liked: false },
    { id: 5, name: "Summer Vibes", image: "https://via.placeholder.com/300", items: 4, liked: true },
  ],
}))

