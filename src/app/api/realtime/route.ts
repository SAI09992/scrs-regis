import { NextRequest } from 'next/server';
import { realtimeEmitter, RealtimeMessage } from '@/lib/realtime';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial heartbeat
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)
      );

      const onBroadcast = (message: RealtimeMessage) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
        } catch (e) {
          // Stream closed by client
        }
      };

      realtimeEmitter?.on('broadcast', onBroadcast);

      // Keep connection alive every 25 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        realtimeEmitter?.off('broadcast', onBroadcast);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
