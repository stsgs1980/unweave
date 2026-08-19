/**
 * @file Type declarations for the @unweave/core module.
 */

declare module "@unweave/core" {
  export function listReferences(): Promise<any[]>;
}

declare module "@unweave/core/pipeline" {
  export function runPipeline(options: any): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
}
