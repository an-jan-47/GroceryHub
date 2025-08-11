import { FileOpener } from '@capawesome-team/capacitor-file-opener';

export class FileService {
  /**
   * Opens a file with the default application
   * @param path The file path to open
   * @param mimeType Optional mime type
   */
  static async openFile(path: string, mimeType?: string): Promise<void> {
    try {
      await FileOpener.openFile({
        path,
        mimeType
      });
    } catch (error) {
      console.error('Error opening file:', error);
      throw error;
    }
  }

  /**
   * Opens a PDF file from the downloads directory
   * @param fileName The name of the PDF file
   */
  static async openPdfFromDownloads(fileName: string): Promise<void> {
    // For Android, we need to use the content:// URI scheme
    // This is a simplified example - you may need to adjust based on your specific requirements
    try {
      // The path format may vary depending on the Android version and storage access
      const path = `content://com.android.providers.downloads.documents/document/raw:/storage/emulated/0/Download/${fileName}`;
      await this.openFile(path, 'application/pdf');
    } catch (error) {
      console.error('Error opening PDF from downloads:', error);
      throw error;
    }
  }
}