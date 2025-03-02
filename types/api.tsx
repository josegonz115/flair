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
    best_overall_matches: OverallMatch[];
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
    return "best_overall_matches" in response && "board_info" in response;
}

// Request type for /api/scrape-board
export interface ScrapeboardRequest {
    pinterest_url: string;
    download_images?: boolean | string;
}

// response type for /api/scrape-board when download_images is true
export interface ScrapeBoardDownloadResponse {
    board_info: {
        title: string;
        total_pins: number;
    };
    pins_count: number;
    uploaded_images: number;
    uploaded_urls: string[];
}

// response type for /api/scrape-board when download_images is false
interface Pins {
    src: string;
    alt: string;
}
export interface ScrapeBoardPinsResponse {
    board_info: {
        title: string;
        total_pins: number;
    };
    pins: Pins[];
}

// Request type for /api/find-similar
export interface FindSimilarRequest {
    images: string[];
    pinterest_url?: string;
    use_supabase?: boolean;
    username?: string;
    board_name?: string;
    library_directory?: string;
}

// Union type for both possible responses
export type ScrapeBoardResponse =
    | ScrapeBoardDownloadResponse
    | ScrapeBoardPinsResponse;

// Type guard to check which response type we have
export function isScrapeBoardDownloadResponse(
    response: ScrapeBoardResponse
): response is ScrapeBoardDownloadResponse {
    return "uploaded_urls" in response;
}
