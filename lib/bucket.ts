import { supabase } from "@/lib/supabase";

/**
 * Gets a public URL for a file in a bucket
 *
 * @param bucketName - The name of the bucket
 * @param filePath - The path of the file in the bucket
 * @returns The public URL of the file
 */
export const getPublicUrl = (bucketName: string, filePath: string): string => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
};

/**
 * Lists all files in a bucket directory
 */
export const listFiles = async (
    bucketName: string = "images",
    folderPath: string
): Promise<string[]> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .list(folderPath);

        // console.log(
        //     "HEELLLLO IN LISTFILES:",
        //     bucketName,
        //     folderPath,
        //     data,
        //     error
        // ); //TESTING

        if (error) {
            console.error("Error listing files:", error);
            return [];
        }

        if (!data || data.length === 0) {
            console.log(`No files found in ${bucketName}/${folderPath}`);
            return [];
        }

        // Filter for only image files by checking common image extensions
        const imageExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp",
            ".svg",
            ".avif",
        ];
        const filePaths = data
            .filter((item) => {
                const lowerName = item.name.toLowerCase();
                return (
                    imageExtensions.some((ext) => lowerName.endsWith(ext)) &&
                    !item.id.includes("match")
                );
            })
            .map((file) => `${folderPath}/${file.name}`);

        console.log(`Found ${filePaths.length} image files in ${folderPath}`);
        return filePaths;
    } catch (err) {
        console.error("Failed to list files:", err);
        return [];
    }
};

/**
 * Extracts username and board name from a Pinterest board URL
 */
export const extractBoardInfo = (
    boardUrl: string
): { username: string; boardName: string } => {
    const normalizedUrl = boardUrl.endsWith("/") ? boardUrl : `${boardUrl}/`;

    // Format example: https://www.pinterest.com/username/boardname/
    const urlParts = normalizedUrl.split("/");
    const nonEmptyParts = urlParts.filter((part) => part.trim() !== "");

    const boardName = nonEmptyParts[nonEmptyParts.length - 1];
    const username = nonEmptyParts[nonEmptyParts.length - 2];

    console.log(
        `Extracted from ${boardUrl}: username=${username}, boardName=${boardName}`
    );
    return { username, boardName };
};

/**
 * Downloads a file from a bucket
 *
 * @param bucketName - The name of the bucket
 * @param filePath - The path of the file in the bucket
 * @returns A promise that resolves with the file blob or null if it fails
 */
export const downloadFile = async (
    bucketName: string,
    filePath: string
): Promise<Blob | null> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .download(filePath);

        if (error) {
            console.error("Error downloading file:", error);
            return null;
        }

        return data;
    } catch (err) {
        console.error("Failed to download file:", err);
        return null;
    }
};

/**
 * Gets all images from a Pinterest board folder in storage
 *
 * @param username - The username part of the path
 * @param boardName - The board name part of the path
 * @param bucketName - The name of the bucket (default: 'images')
 * @returns An array of public URLs for all images in the board
 */
export const getBoardImages = async (
    username: string,
    boardName: string,
    bucketName = "images"
): Promise<string[]> => {
    try {
        const folderPath = `${username}/${boardName}`;
        const filePaths = await listFiles(bucketName, folderPath);

        return filePaths.map((path) => getPublicUrl(bucketName, path));
    } catch (err) {
        console.error(
            `Failed to get board images for ${username}/${boardName}:`,
            err
        );
        return [];
    }
};

/**
 * Gets all images from a Pinterest board using its URL
 */
export const getImagesFromBoardUrl = async (
    boardUrl: string,
    bucketName = "images"
): Promise<string[]> => {
    const { username, boardName } = extractBoardInfo(boardUrl);
    const folderPath = `${username}/${boardName}`;
    const filePaths = await listFiles(bucketName, folderPath);
    const imageUrls = filePaths.map((path) => getPublicUrl(bucketName, path));
    console.log(`Found ${imageUrls.length} images for board ${boardUrl}`);
    return imageUrls;
};

/**
 * Uploads an image to a user's personal items folder and returns its public URL
 * 
 * @param file - The image file to upload
 * @param userId - The user's ID for creating the path
 * @param fileName - Optional custom filename (defaults to original filename)
 * @param bucketName - The storage bucket name (default: 'images')
 * @returns A promise resolving to the public URL of the uploaded image, or null if upload fails
 */
export const uploadUserItem = async (
    file: File,
    userId: string,
    fileName?: string,
    bucketName: string = "images"
): Promise<string | null> => {
    try {
        // Generate path and use either provided filename or original name
        const itemPath = `${userId}/items`;
        const finalFileName = fileName || `${Date.now()}-${file.name}`;
        const filePath = `${itemPath}/${finalFileName}`;
        
        // Upload the file to storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false 
            });
            
        if (error) {
            console.error("Error uploading item image:", error);
            return null;
        }
        
        // Get and return the public URL of the uploaded file
        const publicUrl = getPublicUrl(bucketName, filePath);
        console.log(`Successfully uploaded user item to ${filePath}`);
        
        return publicUrl;
    } catch (err) {
        console.error("Failed to upload user item image:", err);
        return null;
    }
};

/**
 * Gets all images from a user's personal items folder
 * 
 * @param userId - The user's ID to identify the folder
 * @param bucketName - The storage bucket name (default: 'images')
 * @returns A promise resolving to an array of public URLs for all user item images
 */
export const getUserItems = async (
    userId: string,
    bucketName: string = "images"
): Promise<string[]> => {
    try {
        const folderPath = `${userId}/items`;
        
        // Use existing listFiles function to get all image paths
        const filePaths = await listFiles(bucketName, folderPath);
        
        if (filePaths.length === 0) {
            console.log(`No item images found for user ${userId}`);
            return [];
        }
        
        const imageUrls = filePaths.map(path => getPublicUrl(bucketName, path));
        
        console.log(`Found ${imageUrls.length} item images for user ${userId}`);
        return imageUrls;
    } catch (err) {
        console.error(`Failed to get item images for user ${userId}:`, err);
        return [];
    }
};