import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  
  /**
   * Save a file to the assets folder and return the path
   * In a real application, this would involve server-side file handling
   * For static builds, we'll use data URLs for now but maintain the structure
   */
  async saveAsset(file: File, folder: string = 'uploads'): Promise<string> {
    // For static builds, we convert to data URL
    // In a real server environment, this would upload to server and return URL
    return this.convertToDataUrl(file);
  }

  /**
   * Convert file to data URL for static builds
   */
  private convertToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate a unique filename
   */
  generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Check if a string is a data URL
   */
  isDataUrl(url: string): boolean {
    return url.startsWith('data:');
  }

  /**
   * Get asset path for build time
   */
  getAssetPath(path: string): string {
    // For static builds, return the path as-is
    // In development, this might need different handling
    return path;
  }

  /**
   * Process multiple files and return their paths/URLs
   */
  async saveMultipleAssets(files: FileList, folder: string = 'uploads'): Promise<string[]> {
    const promises = Array.from(files).map(file => this.saveAsset(file, folder));
    return Promise.all(promises);
  }

  /**
   * Extract file type from data URL
   */
  getFileTypeFromDataUrl(dataUrl: string): string {
    const matches = dataUrl.match(/^data:(.+?);base64,/);
    return matches ? matches[1] : 'application/octet-stream';
  }

  /**
   * Check if asset is an image
   */
  isImageAsset(dataUrl: string): boolean {
    const fileType = this.getFileTypeFromDataUrl(dataUrl);
    return fileType.startsWith('image/');
  }

  /**
   * Get file extension from data URL
   */
  getExtensionFromDataUrl(dataUrl: string): string {
    const fileType = this.getFileTypeFromDataUrl(dataUrl);
    const extensions: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/webp': 'webp'
    };
    return extensions[fileType] || 'bin';
  }
}
