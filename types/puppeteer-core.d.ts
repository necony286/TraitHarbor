declare module 'puppeteer-core' {
  export type PdfOptions = {
    format: string;
    printBackground: boolean;
    margin: {
      top: string;
      bottom: string;
      left: string;
      right: string;
    };
  };

  export type Page = {
    setDefaultTimeout(timeout: number): void;
    setDefaultNavigationTimeout(timeout: number): void;
    setContent(
      html: string,
      options: { waitUntil: 'networkidle0'; timeout: number }
    ): Promise<void>;
    emulateMedia(options: { media: 'screen' }): Promise<void>;
    pdf(options: PdfOptions): Promise<Uint8Array>;
    close(): Promise<void>;
  };

  export type Browser = {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  };

  const puppeteer: {
    connect(options: { browserWSEndpoint: string }): Promise<Browser>;
    launch(options: {
      executablePath?: string;
      args: string[];
      headless: boolean;
    }): Promise<Browser>;
  };

  export default puppeteer;
}
