import {PdfDocumentBuilder} from './pdf-document-builder';

const asText = (bytes: Uint8Array) => String.fromCharCode(...bytes);

describe('PdfDocumentBuilder', () => {
  const builder = new PdfDocumentBuilder();

  it('should produce a PDF file', () => {
    const text = asText(builder.build([{text: 'Reporte', bold: true}, {text: 'Línea'}]));

    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text.endsWith('%%EOF')).toBe(true);
    expect(text).toContain('/Count 1');
  });

  it('should escape string delimiters', () => {
    const text = asText(builder.build([{text: 'Total (S/) \\ 1'}]));
    expect(text).toContain('(Total \\(S/\\) \\\\ 1)');
  });

  it('should keep Latin-1 accents and replace other characters', () => {
    const text = asText(builder.build([{text: 'Pérdida – evitada'}]));
    expect(text).toContain('Pérdida ? evitada');
  });

  it('should start a new page when the lines do not fit', () => {
    const lines = Array.from({length: 100}, (_, index) => ({text: `Línea ${index}`}));
    expect(asText(builder.build(lines))).toContain('/Count 3');
  });

  it('should point the xref table to the real object offsets', () => {
    const text = asText(builder.build([{text: 'x'}]));
    const startxref = Number(/startxref\n(\d+)/.exec(text)?.[1]);
    expect(text.slice(startxref, startxref + 4)).toBe('xref');
    const firstOffset = Number(/0000000000 65535 f \n(\d{10})/.exec(text)?.[1]);
    expect(text.slice(firstOffset, firstOffset + 7)).toBe('1 0 obj');
  });
});
