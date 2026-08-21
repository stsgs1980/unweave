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

      // Оборачиваем в async функцию, чтобы дождаться ответа от БД (Prisma)
      (async () => {
        try {
          // 0. Очищаем зависшие задачи при запуске сервера
          await cleanupStaleJobs();

          // 1. Отправляем текущие активные задачи при подключении
          const jobs = await getActiveJobs();
          logger.info("API:Events", `Sending initial active jobs (${jobs.length}) to client`);
          sendEvent({ type: "initial", jobs });

          // 2. Подписываемся на будущие обновления
          const unsubscribe = subscribe((job: Job) => {
            logger.debug(
              "API:Events",
              `Broadcasting job update for ${job.id} (status: ${job.status})`,
            );
            sendEvent({ type: "update", job });
          });

          // 3. Отправляем heartbeat каждые 15 сек, чтобы соединение не закрывалось
          const interval = setInterval(() => {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          }, 15000);

          // 4. Отписываемся при закрытии вкладки
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
