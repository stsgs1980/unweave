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
}

declare module "@unweave/core/spec" {
  export function generateSpec(analysis: any, options: any): any;
}

declare module "@unweave/core/generate" {
  export function generate(spec: any, options: any): string;
}
