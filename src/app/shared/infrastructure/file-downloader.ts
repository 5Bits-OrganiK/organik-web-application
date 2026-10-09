import {DOCUMENT, inject, Injectable} from '@angular/core';

/**
 * Infrastructure service that hands a generated file to the user's browser.
 */
@Injectable({providedIn: 'root'})
export class FileDownloader {
  private readonly document = inject(DOCUMENT);

  /**
   * Starts the download of a file generated in the browser.
   *
   * @param fileName - Name suggested to the user.
   * @param content - Bytes of the file.
   * @param mimeType - Media type of the file.
   */
  download(fileName: string, content: Uint8Array<ArrayBuffer>, mimeType: string): void {
    const url = URL.createObjectURL(new Blob([content], {type: mimeType}));
    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
