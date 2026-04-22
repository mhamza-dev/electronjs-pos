// services/uploadService.ts
import { supabase } from "../lib/supabase";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export const uploadService = {
  /**
   * Validate file before upload.
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: "No file provided" };
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "File type not allowed. Use JPEG, PNG, WEBP, or GIF.",
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: "File size exceeds 5MB limit" };
    }
    return { valid: true };
  },

  /**
   * Generate a unique file path for the uploaded file.
   * Structure: {businessId}/{userId}/{timestamp}-{filename}
   */
  generateFilePath(
    businessId: string,
    userId: string,
    fileName: string,
  ): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `${businessId}/${userId}/${timestamp}-${sanitizedFileName}`;
  },

  /**
   * Upload a product image to Supabase Storage.
   */
  async uploadProductImage(
    file: File,
    businessId: string,
    userId: string,
  ): Promise<UploadResult> {
    // Validate
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const filePath = this.generateFilePath(businessId, userId, file.name);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const publicUrl = this.getPublicUrl(filePath);
    return { path: filePath, publicUrl };
  },

  /**
   * Get public URL for a file path.
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Delete a file from storage.
   */
  async deleteFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    if (error) throw error;
  },

  /**
   * Delete multiple files.
   */
  async deleteFiles(filePaths: string[]): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);
    if (error) throw error;
  },

  /**
   * Upload multiple product images.
   */
  async uploadMultipleImages(
    files: File[],
    businessId: string,
    userId: string,
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadProductImage(file, businessId, userId),
    );
    return Promise.all(uploadPromises);
  },

  /**
   * Extract file path from a public URL (useful for deletions).
   */
  extractPathFromUrl(publicUrl: string): string | null {
    const url = new URL(publicUrl);
    const pathSegments = url.pathname.split("/");
    const bucketIndex = pathSegments.indexOf(BUCKET_NAME);
    if (bucketIndex === -1) return null;
    return pathSegments.slice(bucketIndex + 1).join("/");
  },
};
