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
    ScrapeBoardResponse,
    isScrapeBoardDownloadResponse,
    ScrapeBoardPinsResponse,
    ScrapeBoardDownloadResponse,
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
        user_id?: string;
    } | null;
    queryImages: string[]; // Base64 encoded images
    queryResults: ApiResponse | null;
    isLoading: boolean;
    error: string | null;

    // Personal items state
    personalItems: Tables<"personal_items">[];
    selectedPersonalItems: string[]; // IDs of selected personal items
    itemMatches: Tables<"item_matches">[];

    // auth related
    setUserId: (userId: string | null) => void;

    // database operations
    fetchUserBoards: () => Promise<void>;
    fetchBoardHistory: (boardId: string) => Promise<Tables<"user_queries">[]>;
    fetchQueryResults: (
        queryId: string
    ) => Promise<Tables<"query_results"> | null>;

    // Personal items operations
    fetchPersonalItems: () => Promise<void>;
    addPersonalItem: (
        imageUrl: string,
        title?: string,
        description?: string,
        tags?: string[]
    ) => Promise<void>;
    removePersonalItem: (itemId: string) => Promise<void>;
    selectPersonalItem: (itemId: string) => void;
    deselectPersonalItem: (itemId: string) => void;
    clearSelectedPersonalItems: () => void;

    // Item matching operations
    fetchItemMatches: () => Promise<void>;
    createItemMatch: (
        boardId: string,
        personalItemIds: string[],
        limit?: number
    ) => Promise<Tables<"item_matches"> | undefined>;
    removeItemMatch: (matchId: string) => Promise<void>;

    // app actions
    setCurrentBoard: (url: string, title?: string) => Promise<void>;
    addQueryImage: (image: string) => void;
    removeQueryImage: (index: number) => void;
    clearQueryImages: () => void;
    findMatches: () => Promise<void>;
    clearResults: () => void;
    addToRecentBoards: (id: string, url: string, title: string) => void;
    clearRecentBoards: () => void;

    // Board operations
    removeBoard: (boardId: string) => Promise<void>;
    scrapeBoard: (
        url: string,
        downloadImages?: boolean
    ) => Promise<ScrapeBoardResponse>;
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

            // Personal items initial state
            personalItems: [],
            selectedPersonalItems: [],
            itemMatches: [],

            // Set user ID
            setUserId: (userId: string | null) => {
                set({ userId });

                if (userId) {
                    get().fetchUserBoards();
                    get().fetchPersonalItems();
                    get().fetchItemMatches();
                }
            },

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
                        console.warn(
                            "User ID is not set. Cannot fetch board history."
                        );
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

            // Fetch personal items
            fetchPersonalItems: async () => {
                const { userId } = get();
                if (!userId) return;

                set({ isLoading: true, error: null });

                try {
                    const { data: items, error } = await supabase
                        .from("personal_items")
                        .select("*")
                        .eq("user_id", userId)
                        .order("created_at", { ascending: false });

                    if (error) throw error;

                    set({ personalItems: items || [], isLoading: false });
                } catch (err) {
                    console.error("Error fetching personal items:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to fetch personal items",
                        isLoading: false,
                    });
                }
            },

            // Add a personal item
            addPersonalItem: async (imageUrl, title, description, tags) => {
                const { userId } = get();
                if (!userId) {
                    set({ error: "User not logged in" });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const newItem: TablesInsert<"personal_items"> = {
                        user_id: userId,
                        image_url: imageUrl,
                        title: title || null,
                        description: description || null,
                        tags: tags || null,
                    };

                    const { data: item, error } = await supabase
                        .from("personal_items")
                        .insert([newItem])
                        .select()
                        .single();

                    if (error) throw error;

                    // Update local state
                    set((state) => ({
                        personalItems: [item, ...state.personalItems],
                        isLoading: false,
                    }));
                } catch (err) {
                    console.error("Error adding personal item:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to add personal item",
                        isLoading: false,
                    });
                }
            },

            // Remove a personal item
            removePersonalItem: async (itemId) => {
                set({ isLoading: true, error: null });

                try {
                    const { error } = await supabase
                        .from("personal_items")
                        .delete()
                        .eq("id", itemId);

                    if (error) throw error;

                    // Update local state
                    set((state) => ({
                        personalItems: state.personalItems.filter(
                            (item) => item.id !== itemId
                        ),
                        selectedPersonalItems:
                            state.selectedPersonalItems.filter(
                                (id) => id !== itemId
                            ),
                        isLoading: false,
                    }));
                } catch (err) {
                    console.error("Error removing personal item:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to remove personal item",
                        isLoading: false,
                    });
                }
            },

            // Select a personal item
            selectPersonalItem: (itemId) => {
                set((state) => {
                    // Don't add if already selected
                    if (state.selectedPersonalItems.includes(itemId)) {
                        return state;
                    }

                    return {
                        selectedPersonalItems: [
                            ...state.selectedPersonalItems,
                            itemId,
                        ],
                    };
                });
            },

            // Deselect a personal item
            deselectPersonalItem: (itemId) => {
                set((state) => ({
                    selectedPersonalItems: state.selectedPersonalItems.filter(
                        (id) => id !== itemId
                    ),
                }));
            },

            // Clear selected personal items
            clearSelectedPersonalItems: () => {
                set({ selectedPersonalItems: [] });
            },

            // Fetch item matches
            fetchItemMatches: async () => {
                const { userId } = get();
                if (!userId) return;

                set({ isLoading: true, error: null });

                try {
                    const { data: matches, error } = await supabase
                        .from("item_matches")
                        .select("*")
                        .eq("user_id", userId)
                        .order("created_at", { ascending: false });

                    if (error) throw error;

                    set({ itemMatches: matches || [], isLoading: false });
                } catch (err) {
                    console.error("Error fetching item matches:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to fetch item matches",
                        isLoading: false,
                    });
                }
            },

            createItemMatch: async (boardId, personalItemIds, limit = 5) => {
                const { userId } = get();
                if (!userId) {
                    set({ error: "User not logged in" });
                    return;
                }

                if (personalItemIds.length === 0) {
                    set({ error: "No personal items selected" });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    // Get personal item images
                    const { data: items } = await supabase
                        .from("personal_items")
                        .select("image_url")
                        .in("id", personalItemIds);

                    if (!items || items.length === 0) {
                        throw new Error(
                            "Could not find selected personal items"
                        );
                    }

                    // Get board URL
                    const { data: board } = await supabase
                        .from("pinterest_boards")
                        .select("url")
                        .eq("id", boardId)
                        .single();

                    if (!board) {
                        throw new Error("Could not find selected board");
                    }

                    // Call API to find matches
                    const response = await fetch(
                        "http://192.168.4.59:5000/api/fashion-finder",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                pinterest_url: board.url,
                                images: items.map((item) => item.image_url),
                                limit: limit,
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Server responded with ${response.status}`
                        );
                    }

                    const data: FashionFinderResponse = await response.json();

                    const bestMatches = data.best_overall_matches;

                    const matchedUrls = bestMatches.map(
                        (match) => match.supabase_url || match.path
                    );

                    const newMatch: TablesInsert<"item_matches"> = {
                        user_id: userId,
                        board_id: boardId,
                        personal_item_ids: personalItemIds,
                        matched_pin_urls: matchedUrls,
                        similarity_scores: bestMatches.map((match) => ({
                            path: match.path,
                            score: match.average_similarity_score,
                        })),
                    };

                    const { data: savedMatch, error } = await supabase
                        .from("item_matches")
                        .insert([newMatch])
                        .select()
                        .single();

                    if (error) throw error;

                    // Update local state
                    set((state) => ({
                        itemMatches: [savedMatch, ...state.itemMatches],
                        isLoading: false,
                        queryResults: data,
                    }));

                    return savedMatch;
                } catch (err) {
                    console.error("Error creating item match:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to create item match",
                        isLoading: false,
                    });
                }
            },

            // Remove an item match
            removeItemMatch: async (matchId) => {
                set({ isLoading: true, error: null });

                try {
                    const { error } = await supabase
                        .from("item_matches")
                        .delete()
                        .eq("id", matchId);

                    if (error) throw error;

                    // Update local state
                    set((state) => ({
                        itemMatches: state.itemMatches.filter(
                            (match) => match.id !== matchId
                        ),
                        isLoading: false,
                    }));
                } catch (err) {
                    console.error("Error removing item match:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to remove item match",
                        isLoading: false,
                    });
                }
            },

            setCurrentBoard: async (url: string, title?: string) => {
                set({ isLoading: true, error: null });

                try {
                    const { userId } = get();

                    let { data: board, error } = await supabase
                        .from("pinterest_boards")
                        .select("*")
                        .eq("url", url)
                        .single();
                    console.log("data exists in currentBoard:", board); //TESTING

                    if (error && error.code !== "PGRST116") {
                        // PGRST116 is "not found"
                        throw error;
                    }

                    // if (!board) {
                    //     const newBoard: TablesInsert<"pinterest_boards"> = {
                    //         url,
                    //         title: title || url.split("/").slice(-2, -1)[0],
                    //         user_id: userId,
                    //         last_scraped_at: new Date().toISOString(),
                    //     };

                    //     const { data: insertedBoard, error: insertError } =
                    //         await supabase
                    //             .from("pinterest_boards")
                    //             .insert([newBoard])
                    //             .select()
                    //             .single();

                    //     if (insertError) throw insertError;
                    //     board = insertedBoard;
                    // } else {
                    //     await supabase
                    //         .from("pinterest_boards")
                    //         .update({
                    //             last_scraped_at: new Date().toISOString(),
                    //         })
                    //         .eq("id", board.id);
                    // }
                    if (board) {
                        const { error: updateError } = await supabase
                            .from("pinterest_boards")
                            .update({
                                last_scraped_at: new Date().toISOString(),
                            })
                            .eq("id", board.id);

                        if (updateError) throw updateError;
                    } else {
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
                    }

                    set({
                        currentBoard: {
                            id: board.id,
                            url: board.url,
                            title:
                                board.title || url.split("/").slice(-2, -1)[0],
                            user_id: board.user_id || undefined,
                        },
                        isLoading: false,
                    });

                    console.log(
                        "after setting current board:",
                        get().currentBoard
                    ); //TESTING

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

            // Remove a board
            removeBoard: async (boardId) => {
                set({ isLoading: true, error: null });

                try {
                    // First delete all related queries and matches
                    await supabase
                        .from("user_queries")
                        .delete()
                        .eq("board_id", boardId);

                    await supabase
                        .from("item_matches")
                        .delete()
                        .eq("board_id", boardId);

                    // Then delete the board
                    const { error } = await supabase
                        .from("pinterest_boards")
                        .delete()
                        .eq("id", boardId);

                    if (error) throw error;

                    // Update local state
                    set((state) => ({
                        recentBoards: state.recentBoards.filter(
                            (board) => board.id !== boardId
                        ),
                        currentBoard:
                            state.currentBoard?.id === boardId
                                ? null
                                : state.currentBoard,
                        isLoading: false,
                    }));

                    // Refresh item matches as some might have been deleted
                    get().fetchItemMatches();
                } catch (err) {
                    console.error("Error removing board:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to remove board",
                        isLoading: false,
                    });
                }
            },

            scrapeBoard: async (url, downloadImages = true) => {
                set({ isLoading: true, error: null });
                console.log("scrapeboard input:", { url, downloadImages }); //TESTING
                try {
                    const response = await fetch(
                        "http://192.168.4.59:5000/api/scrape-board",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                pinterest_url: url,
                                download_images: downloadImages,
                            }),
                        }
                    );
                    console.log("just did resposne in scrape:", response); //TESTING

                    if (!response.ok) {
                        throw new Error(
                            `Server responded with ${response.status}`
                        );
                    }

                    const data =
                        (await response.json()) as ScrapeBoardDownloadResponse;
                    set({ isLoading: false });

                    console.log("before if new board:", data); //TESTING

                    // output: {"board_info": {"title": "Unknown Board", "total_pins": 0}, "pins_count": 0, "uploaded_images": 0, "uploaded_urls": []}

                    // If this is a new board, add it to the user's collection
                    if (data.board_info && data.board_info.title) {
                        const { userId } = get();
                        if (userId) {
                            get().setCurrentBoard(url, data.board_info.title);
                        }
                    }

                    return data;
                } catch (err) {
                    console.error("Error scraping board:", err);
                    set({
                        error:
                            err instanceof Error
                                ? err.message
                                : "Failed to scrape board",
                        isLoading: false,
                    });
                    throw err;
                }
            },

            // Add a query image
            addQueryImage: (image: string) => {
                set((state) => ({
                    queryImages: [...state.queryImages, image],
                }));
            },

            removeQueryImage: (index: number) => {
                set((state) => ({
                    queryImages: state.queryImages.filter(
                        (_, i) => i !== index
                    ),
                }));
            },

            clearQueryImages: () => {
                set({ queryImages: [] });
            },

            findMatches: async () => {
                const { currentBoard, queryImages, userId } = get();

                if (!currentBoard) {
                    set({ error: "No Pinterest board selected" });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const endpoint =
                        queryImages.length > 0
                            ? "/api/fashion-finder"
                            : "/api/find-similar";

                    const response = await fetch(
                        `http://192.168.4.59:5000${endpoint}`,
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

                    if (userId) {
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

                        const bestMatches = data.best_overall_matches;

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

            clearResults: () => {
                set({ queryResults: null });
            },

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
