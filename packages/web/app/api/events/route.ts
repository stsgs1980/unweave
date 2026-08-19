/**
 * @file API route for Server-Sent Events (SSE) to stream job updates.
 */

import { NextRequest } from "next/server";
import { subscribe, getActiveJobs } from "@/lib/jobStore";

/**
 * Handles GET requests to establish an SSE connection.
 * @param {NextRequest} request - The incoming request.
 * @returns {Response} A streaming response.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // 1. Отправляем текущие активные задачи при подключении
      sendEvent({ type: "initial", jobs: getActiveJobs() });

      // 2. Подписываемся на будущие обновления
      const unsubscribe = subscribe((job) => {
        sendEvent({ type: "update", job });
      });

      // 3. Отправляем heartbeat каждые 15 сек, чтобы соединение не закрывалось
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15000);

      // 4. Отписываемся при закрытии вкладки
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        unsubscribe();
        controller.close();
      });
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
