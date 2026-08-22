/**
 * @file API route for Server-Sent Events (SSE) to stream job updates.
 */

import { NextRequest } from "next/server";
import { subscribe, getActiveJobs, cleanupStaleJobs, Job } from "@/lib/jobStore";
import { logger } from "@/lib/logger";

/**
 * Handles GET requests to establish an SSE connection.
 * @param {NextRequest} request - The incoming request.
 * @returns {Response} A streaming response.
 */
export async function GET(request: NextRequest): Promise<Response> {
  logger.info("API:Events", "Client connected for SSE stream");
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Wrap in async to await DB response (Prisma)
      (async () => {
        try {
          // 0. Clean up stale jobs on server start
          await cleanupStaleJobs();

          // 1. Send current active jobs on connect
          const jobs = await getActiveJobs();
          logger.info("API:Events", `Sending initial active jobs (${jobs.length}) to client`);
          sendEvent({ type: "initial", jobs });

          // 2. Subscribe to future updates
          const unsubscribe = subscribe((job: Job) => {
            logger.debug(
              "API:Events",
              `Broadcasting job update for ${job.id} (status: ${job.status})`,
            );
            sendEvent({ type: "update", job });
          });

          // 3. Send heartbeat every 15s to keep connection alive
          const interval = setInterval(() => {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          }, 15000);

          // 4. Unsubscribe on client disconnect
          request.signal.addEventListener("abort", () => {
            logger.info("API:Events", "SSE connection aborted/closed by client");
            clearInterval(interval);
            unsubscribe();
            controller.close();
          });
        } catch (err) {
          logger.error("API:Events", "Error in SSE stream", err);
          controller.close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
