/**
 * @file Type declarations for the @unweave/core module.
 */

declare module "@unweave/core" {
  export function listReferences(): Promise<string[]>;
}

declare module "@unweave/core/pipeline" {
  export function pipeline(
    urls: string | string[],
    options?: any,
    onProgress?: (progress: number, message: string) => void,
  ): Promise<
    Array<{
      url: string;
      success: boolean;
      extracted?: any;
      analysis?: any;
      spec?: any;
      generated?: any;
      error?: string;
    }>
  >;

  export function runPipeline(
    options: any,
  ): Promise<{ success: boolean; data?: any; error?: string }>;
}
