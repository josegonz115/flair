// Common types shared between both APIs
export interface Match {
    path: string;
    similarity_score: number;
}

export interface SimilarityResult {
    matches: Match[];
    query_image_index: number;
}

export interface OverallMatch {
    average_similarity_score: number;
    individual_scores: {
        [queryIndex: string]: number;
    };
    path: string;
    supabase_url: string;
}

// Types for /api/fashion-finder response
export interface FashionFinderResponse {
    best_overall_match: OverallMatch[];
    board_info: {
        title: string;
        total_pins: number;
    };
    scraped_images_count: number;
    similarity_results: SimilarityResult[];
    uploaded_images_count: number;
    uploaded_matches: string[];
}

// Types for /api/find-similar response
export interface FindSimilarResponse {
    best_overall_matches: OverallMatch[];
    results: SimilarityResult[];
    uploaded_matches: string[];
}

export interface PinterestRequest {
    pinterest_url: string;
    images: string[]; // Base64 encoded images or image URLs
}

export type ApiResponse = FashionFinderResponse | FindSimilarResponse;

export function isFashionFinderResponse(
    response: ApiResponse
): response is FashionFinderResponse {
    return "best_overall_match" in response && "board_info" in response;
}
