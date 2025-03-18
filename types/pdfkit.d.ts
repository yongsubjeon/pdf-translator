declare module 'pdfkit' {
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    margins?: { top: number; left: number; bottom: number; right: number };
    layout?: 'portrait' | 'landscape';
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      CreationDate?: Date;
      ModDate?: Date;
    };
    autoFirstPage?: boolean;
    bufferPages?: boolean;
  }

  interface PDFDocument {
    pipe(destination: NodeJS.WritableStream): this;
    font(name: string): this;
    fontSize(size: number): this;
    text(text: string, options?: any): this;
    text(text: string, x?: number, y?: number, options?: any): this;
    moveDown(lines?: number): this;
    addPage(options?: any): this;
    switchToPage(pageNumber: number): this;
    bufferedPageRange(): { start: number; count: number };
    page: {
      width: number;
      height: number;
    };
    end(): void;
  }

  interface PDFDocumentConstructor {
    new(options?: PDFDocumentOptions): PDFDocument;
  }

  const PDFDocument: PDFDocumentConstructor;
  export = PDFDocument;
} 