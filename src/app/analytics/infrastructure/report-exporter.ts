import {inject, Injectable} from '@angular/core';
import {FileDownloader} from '../../shared/infrastructure/file-downloader';
import {PdfDocumentBuilder, PdfLine} from './pdf-document-builder';

/**
 * A report ready to be exported.
 */
export interface ReportDocument {
  /** Name of the file the user receives. */
  fileName: string;
  lines: PdfLine[];
}

/**
 * Infrastructure gateway that exports reports as PDF files.
 */
@Injectable({providedIn: 'root'})
export class ReportExporter {
  private readonly downloader = inject(FileDownloader);
  private readonly pdf = new PdfDocumentBuilder();

  /**
   * Builds the PDF of the report and downloads it.
   *
   * @param report - Report to export.
   */
  exportAsPdf(report: ReportDocument): void {
    this.downloader.download(report.fileName, this.pdf.build(report.lines), 'application/pdf');
  }
}
