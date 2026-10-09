/**
 * One line of text of a PDF document.
 */
export interface PdfLine {
  text: string;
  /** Whether the line is rendered in bold, e.g. headings. */
  bold?: boolean;
}

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 56;
const LEADING = 18;
const FONT_SIZE = 12;
const LINES_PER_PAGE = Math.floor((PAGE_HEIGHT - 2 * MARGIN) / LEADING);

/**
 * Builds a plain-text PDF document without third-party libraries.
 *
 * @remarks
 * The document uses the standard Helvetica fonts with Latin-1 encoding, which covers
 * Spanish and English text. Characters outside Latin-1 are replaced by `?`.
 */
export class PdfDocumentBuilder {
  /**
   * Lays the lines out on A4 pages and serializes the PDF.
   *
   * @param lines - Lines of the document, top to bottom.
   * @returns The bytes of the PDF file.
   */
  build(lines: readonly PdfLine[]): Uint8Array<ArrayBuffer> {
    const pages = this.paginate(lines);
    // Objects: 1 catalog, 2 page tree, 3 regular font, 4 bold font, then a page and its content per page.
    const pageIds = pages.map((_, index) => 5 + index * 2);
    const objects: string[] = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
    ];
    pages.forEach((pageLines, index) => {
      const content = this.contentStream(pageLines);
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
          `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pageIds[index] + 1} 0 R >>`,
        `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
      );
    });

    let output = '%PDF-1.4\n';
    const offsets: number[] = [];
    objects.forEach((body, index) => {
      offsets.push(output.length);
      output += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xrefOffset = output.length;
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    output += offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
    output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Uint8Array.from(output, char => char.charCodeAt(0));
  }

  private paginate(lines: readonly PdfLine[]): PdfLine[][] {
    const pages: PdfLine[][] = [];
    for (let start = 0; start < lines.length; start += LINES_PER_PAGE) {
      pages.push(lines.slice(start, start + LINES_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }

  private contentStream(lines: readonly PdfLine[]): string {
    return lines
      .map((line, index) => {
        const y = PAGE_HEIGHT - MARGIN - index * LEADING;
        const font = line.bold ? 'F2' : 'F1';
        return `BT /${font} ${FONT_SIZE} Tf ${MARGIN} ${y} Td (${this.escape(line.text)}) Tj ET`;
      })
      .join('\n');
  }

  /** Escapes PDF string delimiters and keeps every character inside Latin-1. */
  private escape(text: string): string {
    return [...text]
      .map(char => (char.charCodeAt(0) > 255 ? '?' : char))
      .join('')
      .replace(/[\\()]/g, match => `\\${match}`);
  }
}
