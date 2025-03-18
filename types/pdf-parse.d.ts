declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  }

  function pdf(dataBuffer: Buffer, options?: any): Promise<PDFData>;
  export = pdf;
} 