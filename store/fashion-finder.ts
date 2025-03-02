import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { Tables, TablesInsert } from "@/types/database.types";
import {
    OverallMatch,
    Match,
    SimilarityResult,
    FashionFinderResponse,
    FindSimilarResponse,
    ApiResponse,
    isFashionFinderResponse,
} from "@/types/api";

interface FashionFinderState {
    userId: string | null;

    // app state
    recentBoards: {
        id: string;
        url: string;
        title: string;
        lastAccessed: string;
    }[];
    currentBoard: {
        id: string;
        url: string;
        title: string;
    } | null;
    queryImages: string[]; // Base64 encoded images
    queryResults: ApiResponse | null;
    isLoading: boolean;
    error: string | null;

    // auth related
    setUserId: (userId: string | null) => void;

    // database operations
    fetchUserBoards: () => Promise<void>;
    fetchBoardHistory: (boardId: string) => Promise<Tables<"user_queries">[]>;
    fetchQueryResults: (
        queryId: string
    ) => Promise<Tables<"query_results"> | null>;

    // app actions
    setCurrentBoard: (url: string, title?: string) => Promise<void>;
    addQueryImage: (image: string) => void;
    removeQueryImage: (index: number) => void;
    clearQueryImages: () => void;
    findMatches: () => Promise<void>;
    clearResults: () => void;
    addToRecentBoards: (id: string, url: string, title: string) => void;
    clearRecentBoards: () => void;
}

export const useFashionFinderStore = create<FashionFinderState>()(
    persist(
        (set, get) => ({
            // Initial state
            userId: null,
            recentBoards: [],
            currentBoard: null,
            queryImages: [],
            queryResults: null,
            isLoading: false,
            error: null,

            // Set user ID
            setUserId: (userId: string | null) => {
                set({ userId });

                if (userId) {
                    get().fetchUserBoards();
                }
            },

            // Fetch user's Pinterest boards
            fetchUserBoards: async () => {
                const { userId } = get();
                if (!userId) return;

                set({ isLoading: true, error: null });

                try {
                    const { data: boards, error } = await supabase
                        .from("pinterest_boards")
                        .select("*")
                        .eq("user_id", userId)
                        .order("created_at", { ascending: false });

                    if (error) throw error;

                    // Update recent boards with data from database
                    if (boards && boards.length > 0) {
                        const recentBoards = boards.map((board) => ({
                            id: board.id,
                            url: board.url,
                            title:
                                board.title ||
                                board.url.split("/").slice(-2, -1)[0],
                            lastAccessed:
                                board.last_scraped_at ||
                                board.created_at ||
                                new Date().toISOString(),
                        }));

                        set({ recentBoards });
                    }

                    set({ isLoading: false });
                } catch (err) {
                    console.error("Error fetching user boards:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to fetch boards",
                        isLoading: false,
                    });
                }
            },

            // Fetch history for a specific board
            fetchBoardHistory: async (boardId: string) => {
                const { userId } = get();

                try {
                    if (!userId) {
                        console.warn("User ID is not set. Cannot fetch board history.");
                        return [];
                    }

                    const { data: queries, error } = await supabase
                        .from("user_queries")
                        .select("*")
                        .eq("board_id", boardId)
                        .eq("user_id", userId)
                        .order("created_at", { ascending: false });

                    if (error) throw error;

                    return queries || [];
                } catch (err) {
                    console.error("Error fetching board history:", err);
                    return [];
                }
            },

            // Fetch results for a specific query
            fetchQueryResults: async (queryId: string) => {
                try {
                    const { data: result, error } = await supabase
                        .from("query_results")
                        .select("*")
                        .eq("query_id", queryId)
                        .single();

                    if (error) throw error;

                    return result;
                } catch (err) {
                    console.error("Error fetching query results:", err);
                    return null;
                }
            },

            // Set current Pinterest board
            setCurrentBoard: async (url: string, title?: string) => {
                set({ isLoading: true, error: null });

                try {
                    const { userId } = get();

                    // Check if board exists in Supabase
                    let { data: board, error } = await supabase
                        .from("pinterest_boards")
                        .select("*")
                        .eq("url", url)
                        .single();

                    if (error && error.code !== "PGRST116") {
                        // PGRST116 is "not found"
                        throw error;
                    }

                    // If board doesn't exist, create it
                    if (!board) {
                        const newBoard: TablesInsert<"pinterest_boards"> = {
                            url,
                            title: title || url.split("/").slice(-2, -1)[0],
                            user_id: userId,
                            last_scraped_at: new Date().toISOString(),
                        };

                        const { data: insertedBoard, error: insertError } =
                            await supabase
                                .from("pinterest_boards")
                                .insert([newBoard])
                                .select()
                                .single();

                        if (insertError) throw insertError;
                        board = insertedBoard;
                    } else {
                        // Update last_scraped_at
                        await supabase
                            .from("pinterest_boards")
                            .update({
                                last_scraped_at: new Date().toISOString(),
                            })
                            .eq("id", board.id);
                    }

                    // Set current board and add to recent boards
                    set({
                        currentBoard: {
                            id: board.id,
                            url: board.url,
                            title:
                                board.title || url.split("/").slice(-2, -1)[0],
                        },
                        isLoading: false,
                    });

                    // Add to recent boards
                    get().addToRecentBoards(
                        board.id,
                        board.url,
                        board.title || url.split("/").slice(-2, -1)[0]
                    );
                } catch (err) {
                    console.error("Error setting board:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to set board",
                        isLoading: false,
                    });
                }
            },

            // Add a query image
            addQueryImage: (image: string) => {
                set((state) => ({
                    queryImages: [...state.queryImages, image],
                }));
            },

            // Remove a query image
            removeQueryImage: (index: number) => {
                set((state) => ({
                    queryImages: state.queryImages.filter(
                        (_, i) => i !== index
                    ),
                }));
            },

            // Clear all query images
            clearQueryImages: () => {
                set({ queryImages: [] });
            },

            // Find matches using the API
            findMatches: async () => {
                const { currentBoard, queryImages, userId } = get();

                if (!currentBoard) {
                    set({ error: "No Pinterest board selected" });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    // Determine which API to use based on whether images were uploaded
                    const endpoint =
                        queryImages.length > 0
                            ? "/api/fashion-finder"
                            : "/api/find-similar";

                    const response = await fetch(
                        `http://127.0.0.1:5000${endpoint}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                pinterest_url: currentBoard.url,
                                images: queryImages,
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Server responded with ${response.status}`
                        );
                    }

                    const data = await response.json();

                    // Save results to Supabase if user is logged in
                    if (userId) {
                        // Insert query
                        const queryInsert: TablesInsert<"user_queries"> = {
                            board_id: currentBoard.id,
                            query_images: queryImages,
                            user_id: userId,
                        };

                        const { data: queryData, error: queryError } =
                            await supabase
                                .from("user_queries")
                                .insert([queryInsert])
                                .select()
                                .single();

                        if (queryError) throw queryError;

                        // Save results
                        const bestMatches = isFashionFinderResponse(data)
                            ? data.best_overall_match
                            : data.best_overall_matches;

                        const resultInsert: TablesInsert<"query_results"> = {
                            query_id: queryData.id,
                            best_matches: bestMatches,
                            uploaded_matches: data.uploaded_matches,
                            user_id: userId,
                        };

                        await supabase
                            .from("query_results")
                            .insert([resultInsert]);
                    }

                    set({
                        queryResults: data,
                        isLoading: false,
                    });
                } catch (err) {
                    console.error("Error finding matches:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to find matches",
                        isLoading: false,
                    });
                }
            },

            // Clear results
            clearResults: () => {
                set({ queryResults: null });
            },

            // Add to recent boards
            addToRecentBoards: (id: string, url: string, title: string) => {
                set((state) => {
                    // Remove if already exists
                    const filtered = state.recentBoards.filter(
                        (board) => board.id !== id
                    );

                    // Add to beginning of array
                    return {
                        recentBoards: [
                            {
                                id,
                                url,
                                title,
                                lastAccessed: new Date().toISOString(),
                            },
                            ...filtered,
                        ].slice(0, 10), // Keep only 10 most recent
                    };
                });
            },

            // Clear recent boards
            clearRecentBoards: () => {
                set({ recentBoards: [] });
            },
        }),
        {
            name: "fashion-finder-storage",
            storage: {
                setItem: async (name, value) => {
                    await AsyncStorage.setItem(name, JSON.stringify(value));
                },
                getItem: async (name) => {
                    const value = await AsyncStorage.getItem(name);
                    return value ? JSON.parse(value) : null;
                },
                removeItem: async (name) => {
                    await AsyncStorage.removeItem(name);
                },
            },
        }
    )
);